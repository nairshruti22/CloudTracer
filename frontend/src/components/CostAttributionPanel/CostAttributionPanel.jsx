import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Pie chart colors
const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

/**
 * CostAttributionPanel - Shows EC2 cost breakdown as chart or table
 * @param {object} data - Cost data object
 * @param {boolean} isModal - If true, modal layout
 */
const CostAttributionPanel = ({ data, isModal }) => {
  const [view, setView] = useState("chart");

  if (!data) return null;

  // Prepare pie chart data including Unaccounted cost
  const pieData = [
    ...Object.entries(data.breakdown).map(([key, value]) => ({
      name: key,
      value,
    })),
    { name: "Unaccounted", value: parseFloat(data.unaccountedCost) },
  ];

  return (
    <Box
      sx={
        isModal
          ? { mx: "auto", p: 3 }
          : { minWidth: 200, maxWidth: 425, mx: "auto", p: 3 }
      }
    >
      {/* Panel Title */}
      <Typography variant="h5" gutterBottom>
        EC2 Cost Breakdown
      </Typography>

      {/* Time Range Info */}
      <Typography variant="subtitle1" gutterBottom>
        Time Range: {data.timePeriod.Start} to {data.timePeriod.End}
      </Typography>

      {/* Cost Summary */}
      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>Total Cost:</strong> ${data.totalCost} |{" "}
        <strong>Attributed:</strong> ${data.attributedCost} |{" "}
        <strong>Unaccounted:</strong> ${data.unaccountedCost}
      </Typography>

      {/* Chart/Table Toggle */}
      <div className="chart-container">
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="chart">Chart View</ToggleButton>
          <ToggleButton value="table">Table View</ToggleButton>
        </ToggleButtonGroup>

        {/* Table View */}
        {view === "table" ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{data.groupBy}</TableCell>
                  <TableCell align="right">Cost ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data.breakdown).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell align="right">{value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <strong>Unaccounted</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {parseFloat(data.unaccountedCost).toFixed(2)}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Chart View
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Box>
  );
};

export default CostAttributionPanel;
