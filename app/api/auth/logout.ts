import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Clear the cookie
    res.setHeader(
      "Set-Cookie",
      `token=; HttpOnly; Secure; SameSite=None; Path=/; Domain=.devnoel.org; Max-Age=0`
    );

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
