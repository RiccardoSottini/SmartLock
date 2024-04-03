"use client";

import "bootstrap/dist/css/bootstrap.css";

interface AccessProps {
  timestamp: number;
}

export default function Access({ timestamp }: AccessProps) {
  const parsedTimestamp: number = parseInt(timestamp.toString()) * 1000;
  const date: string = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedTimestamp);
  const time: string = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(parsedTimestamp);

  return (
    <div className="col mb-3">
      <div className="border card">
        <div className="card-body text-center">
          <p className="mb-1 font-bold">{date}</p>
          <p className="mb-0">{time}</p>
        </div>
      </div>
    </div>
  );
}
