import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
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

function formatTime(timestamp, window) {
  const date = new Date(timestamp);
  if (window === "1h")
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (window === "24h") return date.toLocaleTimeString([], { hour: "2-digit" });
  if (window === "7d") return date.toLocaleDateString();
  return date.toLocaleString();
}

export default function ServerUtilization() {
  const [instanceId, setInstanceId] = useState("i-123abc");
  const [window, setWindow] = useState("24h");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulated fetch function using generateMockUsageData internally
  // Replace with actual fetch from your Express backend if available
  function fetchMockData(instanceId, window) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Paste the generateMockUsageData function here or import it
        const mockData = generateMockUsageData(instanceId, window);
        resolve(mockData);
      }, 1000);
    });
  }

  useEffect(() => {
    setLoading(true);
    fetchMockData(instanceId, window)
      .then((res) => {
        // Convert timestamps to human-readable labels for the chart
        const chartData = res.data.map((point) => ({
          ...point,
          timeLabel: formatTime(point.timestamp, window),
        }));
        setData(chartData);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [instanceId, window]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Server Utilisation Timeline
      </Typography>

      <Box className={"chart-container"}>
        <FormControl>
          <InputLabel>Instance</InputLabel>
          <Select
            value={instanceId}
            label="Instance"
            onChange={(e) => setInstanceId(e.target.value)}
          >
            <MenuItem value="i-123abc">i-123abc</MenuItem>
            <MenuItem value="i-456def">i-456def</MenuItem>
            <MenuItem value="i-789ghi">i-789ghi</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Time Window</InputLabel>
          <Select
            value={window}
            label="Time Window"
            onChange={(e) => setWindow(e.target.value)}
          >
            <MenuItem value="1h">Last 1 Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ padding: 2, height: 350, minWidth: 600 }}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!loading && data && (
          <ResponsiveContainer
            width="100%"
            height="100%"
            className={"chart-container"}
          >
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeLabel" minTickGap={20} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#8884d8"
                dot={false}
                name="CPU %"
              />
              <Line
                type="monotone"
                dataKey="ram"
                stroke="#82ca9d"
                dot={false}
                name="RAM %"
              />
              <Line
                type="monotone"
                dataKey="gpu"
                stroke="#ffc658"
                dot={false}
                name="GPU %"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!loading && !data && (
          <Typography color="error" align="center" mt={3}>
            Failed to load data.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

// Paste or import this function from your util file
function generateMockUsageData(instanceId, window) {
  const now = Date.now();
  let totalDurationMs;
  let intervalMs;

  switch (window) {
    case "1h":
      totalDurationMs = 60 * 60 * 1000;
      intervalMs = 5 * 60 * 1000;
      break;
    case "24h":
      totalDurationMs = 24 * 60 * 60 * 1000;
      intervalMs = 60 * 60 * 1000;
      break;
    case "7d":
      totalDurationMs = 7 * 24 * 60 * 60 * 1000;
      intervalMs = 6 * 60 * 60 * 1000;
      break;
    default:
      throw new Error("Invalid time window");
  }

  const pointsCount = Math.floor(totalDurationMs / intervalMs) + 1;
  const data = [];

  for (let i = 0; i < pointsCount; i++) {
    const timestamp = now - totalDurationMs + i * intervalMs;

    const cpu = Math.min(
      100,
      Math.max(
        5,
        Math.round(
          50 +
            40 * Math.sin(i / 3) +
            20 * Math.random() -
            15 * (i % 6 === 0 ? 1 : 0) +
            (i % 10 === 0 ? 50 : 0)
        )
      )
    );

    const ram = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          60 +
            30 * Math.cos(i / 4) +
            10 * Math.random() -
            10 * (i % 5 === 0 ? 1 : 0) +
            (i % 15 === 0 ? 40 : 0)
        )
      )
    );

    const gpu = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          30 +
            50 * Math.abs(Math.sin(i / 2)) +
            10 * Math.random() -
            20 * (i % 8 === 0 ? 1 : 0) +
            (i % 20 === 0 ? 60 : 0)
        )
      )
    );

    data.push({ timestamp, cpu, ram, gpu });
  }

  return { instanceId, window, data };
}
