"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ComparisonChart({
  myData,
  partnerData,
}: {
  myData: any[];
  partnerData: any[];
}) {
  const merged = myData.map((d, i) => ({
    date: d.date.slice(5), // MM-DD
    me: d.growth + d.neutral + d.waste,
    partner:
      (partnerData[i]?.growth || 0) +
      (partnerData[i]?.neutral || 0) +
      (partnerData[i]?.waste || 0),
  }));

  // 👉 New logic: count how many days you "won"
  const wins = merged.filter((d) => d.me > d.partner).length;

  return (
    <div className="border p-4 rounded mt-6">
      <p className="text-sm text-gray-500 mb-1">
        7-Day Activity Comparison
      </p>

      {/* 👉 New UI line */}
      <p className="text-sm font-medium text-blue-600 mb-3">
        You led {wins}/{merged.length} days this week
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={merged}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line type="monotone" dataKey="me" stroke="#3b82f6" />
          <Line type="monotone" dataKey="partner" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}