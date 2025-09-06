import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../models/user.model";
import Student from "../../../models/student.model";
import dbConnect from "../../../lib/db"; // if you use MongoDB connection

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { username, password } = req.body;
    let account: any = null;
    let roleType = "";

    // 1. Check User (admin, ad, director)
    account = await User.findOne({ username });
    if (account) {
      roleType = account.role;
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // 2. Else check Student
    if (!account) {
      account = await Student.findOne({ dNo: username });
      if (account) {
        roleType = "student";
        if (account.password !== password) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
      }
    }

    if (!account) {
      return res.status(400).json({ message: "User not found" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: account._id, role: roleType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // 4. Set cookie (shared across subdomains)
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=.devnoel.org; Max-Age=3600`
    );

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: account._id,
        username: account.username || account.name,
        role: roleType,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
