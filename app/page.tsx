"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/login")
  }, []);

  return <div>Sacred Heart Hostel</div>;
};

export default page;
