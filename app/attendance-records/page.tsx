"use client";
import React, { useState } from "react";
import "../styles/attendance-record.css";

const page = () => {
  const attendance = [
    {
      ad: "AD-101",
      date: "2025-07-28T08:28:52+05:30",
      records: [
        { name: "Noel Sebu", accountNumber: "123456", status: "Present" },
        { name: "Aanya Roy", accountNumber: "123457", status: "Absent" },
      ],
    },
    {
      ad: "AD-102",
      date: "2025-07-27T10:15:30+05:30",
      records: [
        { name: "Ravi Kumar", accountNumber: "223456", status: "Present" },
        { name: "Meena Singh", accountNumber: "223457", status: "Present" },
      ],
    },
  ];

  // Group by AD
  type AttendanceEntry = {
    ad: string;
    date: string;
    records: {
      name: string;
      accountNumber: string;
      status: string;
    }[];
  };

  const groupedByAD: Record<string, AttendanceEntry[]> = {};
//   const groupedByAD: any = {};
  attendance.forEach((entry) => {
    if (!groupedByAD[entry.ad]) {
      groupedByAD[entry.ad] = [];
    }
    groupedByAD[entry.ad].push(entry);
  });
  return (
    <>
      <h1 className="pl-5 text-black text-3xl font-bold">
        📋 Attendance List (Grouped by AD)
      </h1>
      {Object.entries(groupedByAD).map(([adId, sessions]) => (
        <div className="ad-block m-10" key={adId}>
          <h2 className="text-xl pb-5 font-bold">
            🧑‍🏫 Assistant Director: {adId}
          </h2>
          {sessions.map((session: any, index: any) => (
            <div key={index}>
              <p className="text-black">
                <strong>Date:</strong>{" "}
                {new Date(session.date).toLocaleDateString("en-IN")}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Account Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="text-black">
                  {session.records.map((record: any, idx: any) => (
                    <tr key={idx}>
                      <td>{record.name}</td>
                      <td>{record.accountNumber}</td>
                      <td>{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default page;
