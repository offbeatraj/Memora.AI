import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const logs = [
  "Error: Something went wrong",
  "Info: User logged in",
  "Warning: Low disk space",
  "Info: Data saved successfully",
];

export default function LogFilter() {
  const [filter, setFilter] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Filter logs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <ul>
          {filteredLogs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}