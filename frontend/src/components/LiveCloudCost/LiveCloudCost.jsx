import React, { useMemo } from "react";
import { Box, Typography, Grid, Paper, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const LiveCloudCost = ({ trendData }) => {
  const theme = useTheme();

  // Mark spikes based on threshold (1.5x average)
  const trendWithSpikes = useMemo(() => {
    if (!trendData || !trendData.trend) return [];

    const total = trendData.trend.reduce((acc, day) => acc + day.cost, 0);
    const avg = total / trendData.trend.length;
    const threshold = avg * 1.5;

    return trendData.trend.map((day) => ({
      ...day,
      spike: day.cost > threshold,
    }));
  }, [trendData]);

  const total = trendData?.total ?? 0;
  const dailyBurn = trendData?.dailyBurn ?? 0;
  const projectedMonthly = trendData?.projectedMonthly ?? 0;

  // Recalculate threshold for the reference line
  const threshold =
    trendWithSpikes.length > 0
      ? (trendWithSpikes.reduce((acc, day) => acc + day.cost, 0) /
          trendWithSpikes.length) *
        1.5
      : 0;

  // Custom dot for spikes
  const CustomDot = ({ cx, cy, payload }) => {
    if (payload.spike) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={theme.palette.error.main}
          stroke={theme.palette.error.dark}
          strokeWidth={2}
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={theme.palette.primary.main}
        stroke={theme.palette.primary.dark}
        strokeWidth={1}
      />
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        AWS Cost Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ minWidth: 400 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total (Last 7 Days)
            </Typography>
            <Typography variant="h6">${total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Daily Burn Rate
            </Typography>
            <Typography variant="h6">${dailyBurn}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Projected Monthly
            </Typography>
            <Typography variant="h6">${projectedMonthly}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Cost Trend Chart */}
      <div className="chart-container">
        <Box mt={5}>
          <Typography variant="subtitle1" gutterBottom>
            7-Day Cost Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendWithSpikes}
              margin={{ top: 20, right: 30, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="$" />
              <Tooltip />
              <Legend />
              <ReferenceLine
                y={threshold}
                stroke={theme.palette.warning.main}
                strokeDasharray="3 3"
                label="Spike Threshold"
              />
              <Line
                type="monotone"
                dataKey="cost"
                name="Daily Cost"
                stroke={theme.palette.primary.main}
                dot={<CustomDot />}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </Box>
  );
};

export default LiveCloudCost;
