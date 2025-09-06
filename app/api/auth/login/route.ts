import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../../models/user.model";
import Student from "../../../../models/student.model";
import dbConnect from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    let account: any = null;
    let roleType = "";

    // 1. Check User (admin, ad, director)
    account = await User.findOne({ username });
    if (account) {
      roleType = account.role;
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 400 }
        );
      }
    }

    // 2. Else check Student
    if (!account) {
      account = await Student.findOne({ dNo: username });
      if (account) {
        roleType = "student";
        if (account.password !== password) {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 }
          );
        }
      }
    }

    if (!account) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: account._id, role: roleType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = isProd ? ".jwstechnologies.com" : "localhost";

    const cookieOptions = [
      `token=${token}`,
      "HttpOnly",
      isProd ? "Secure" : "",
      `SameSite=${isProd ? "None" : "Lax"}`,
      "Path=/",
      isProd ? `Domain=${cookieDomain}` : "",
      "Max-Age=3600",
    ]
      .filter(Boolean)
      .join("; ");

    return new NextResponse(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: account._id,
          username: account.username || account.name,
          role: roleType,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieOptions,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
