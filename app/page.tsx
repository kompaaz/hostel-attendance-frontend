"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, []);

  return (
    <div>
      {/* <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="flex gap-3">
            <div className="h-7 w-7 border-4 border-t-green-500 border-b-white rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl">Loading...</h1>
        </div>
      </div> */}
      <Loading />
    </div>
  );
};

export default page;
