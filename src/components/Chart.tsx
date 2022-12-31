import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartProps } from "./Types";

export default function Chart({
  data,
  customChartProps,
}: ChartProps): JSX.Element {
  let minYear: number = 2002; // Hardcoded year to 2002 for the domain to begin
  let k = "G-Year";
  let maxYear: number = Math.max(...data[0].map((o: any) => o[k])); // Get the max year in year column
  return (
    <>
      <div className="border-0 text-center">{customChartProps.caption}</div>
      <ResponsiveContainer width="100%" height="54%">
        <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={customChartProps.xAxis.dkey}
            label={{
              value: customChartProps.xAxis.title,
              position: "bottom",
              offset: 10,
            }}
            type="number"
            domain={[minYear, maxYear]}
            tickCount={10}
            padding={{ left: 0, right: 30 }}
          />
          <YAxis
            type="number"
            dataKey={customChartProps.yAxis.dkey}
            label={{
              value: customChartProps.yAxis.title,
              angle: -90,
              position: "insideLeft",
              dy: customChartProps.yAxis.dy,
              dx: 1,
            }}
            domain={["auto", "auto"]}
            tickCount={7}
            padding={{ top: 30, bottom: 30 }}
            reversed={customChartProps.yAxis.reversed}
          />
          <Tooltip
            formatter={(value: any) => value.toFixed(1)}
            cursor={false}
          />
          <Legend verticalAlign="top" align="right" />
          {data.map((points, index) => {
            return (
              <Line
                type="monotone"
                name={index == 0 ? "All" : `Profile ${index}`}
                data={points}
                dataKey={customChartProps.mainDkey}
                stroke={customChartProps.colors[index]}
                strokeWidth={3}
                activeDot={{ r: 8 }}
                key={index}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
