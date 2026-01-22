"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface OverviewChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-500">Monthly revenue collection</p>
        </div>
        <div className="relative">
          <select className="appearance-none bg-gray-50 border-none text-gray-900 text-sm font-medium rounded-lg block w-full p-2.5 pr-8 focus:ring-0 cursor-pointer">
            <option>Last 6 Months</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `₹${value >= 1000 ? `${value / 1000}k` : value}`
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                padding: "12px",
              }}
              formatter={(
                value: number | string | Array<number | string>,
                name: string,
              ) => [
                <span key={name} className="text-indigo-600 font-medium">
                  {`₹${value}`}
                </span>,
                <span
                  key={`${name}-label`}
                  className="text-gray-500 capitalize ml-2"
                >
                  {name}
                </span>,
              ]}
              cursor={{
                stroke: "#4f46e5",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
