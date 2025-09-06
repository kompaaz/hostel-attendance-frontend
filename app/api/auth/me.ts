import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "../../../models/user.model";
import Student from "../../../models/student.model";
import dbConnect from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };

    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      user = await Student.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in /me:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
