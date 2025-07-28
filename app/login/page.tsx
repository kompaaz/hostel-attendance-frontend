"use client";
import React, { useState } from "react";
import "../styles/login.css";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const page = () => {
  const [showPassword, setshowPassword] = useState<boolean>(false);

  return (
    <>
      <div className="container">
        <form className="login-form">
          <h2 className="text-3xl font-semibold">Login</h2>

          <label htmlFor="username" className="text-black">
            Username
          </label>
          <div className="px-2 border-2 rounded-xl">
            <input
              className="h-10 text-black outline-none"
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="password" className="text-black">
              Password
            </label>
            <div className="px-2 flex justify-between border-2 rounded-xl">
              <input
                className="h-10 text-black outline-none"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
              <div
                className="text-black flex items-center"
                onClick={() => {
                  setshowPassword((prev) => !prev);
                }}
              >
                {showPassword ? <FaEye size={25} /> : <FaEyeSlash size={25} />}
              </div>
            </div>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
};

export default page;
