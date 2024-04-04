"use client";

import "bootstrap/dist/css/bootstrap.css";

/* Props of the Access component */
interface AccessProps {
  timestamp: number;
}

/* Access React component - component used to display door access */
export default function Access({ timestamp }: AccessProps) {
  /* Parse timestamp */
  const parsedTimestamp: number = parseInt(timestamp.toString()) * 1000;

  /* Format date */
  const date: string = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedTimestamp);

  /* Format time */
  const time: string = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(parsedTimestamp);

  /* Return access JSX markup */
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
