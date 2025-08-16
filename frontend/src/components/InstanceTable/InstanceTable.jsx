import React, { useMemo, useState } from "react";
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
  Tooltip,
  TableSortLabel,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Helper to assign waste level string based on CPU and uptime
function getWasteLevel(cpu, uptime) {
  if (cpu < 30 && uptime > 24) return "High";
  if (cpu < 50) return "Medium";
  return "Low";
}

const wasteLevelOrder = { High: 3, Medium: 2, Low: 1 };

const headCells = [
  { id: "instanceId", label: "Instance ID" },
  { id: "instanceType", label: "Type" },
  { id: "region", label: "Region" },
  { id: "cpu", label: "CPU (%)" },
  { id: "gpu", label: "GPU" },
  { id: "uptimeHours", label: "Uptime (hrs)" },
  { id: "costPerHour", label: "Cost/hr ($)" },
  { id: "waste", label: "Waste" },
];

// Sort helpers, updated to handle "waste" column sorting by custom order
function descendingComparator(a, b, orderBy) {
  if (orderBy === "waste") {
    // Sort by wasteLevelOrder
    return wasteLevelOrder[b.waste] - wasteLevelOrder[a.waste];
  }

  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    if (cmp !== 0) return cmp;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

const InstanceTable = ({ instances, isModal }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("instanceId");

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // Enrich instances with waste level for sorting and display
  const instancesWithWaste = useMemo(
    () =>
      instances.map((inst) => ({
        ...inst,
        waste: getWasteLevel(inst.cpu, inst.uptimeHours),
      })),
    [instances]
  );

  const sortedInstances = useMemo(
    () => stableSort(instancesWithWaste, getComparator(order, orderBy)),
    [instancesWithWaste, order, orderBy]
  );

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        EC2 Instance Utilization Table
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <div className="chart-container">
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: 3,
              width: "100%",
              maxWidth: isModal ? undefined : "100%", // Remove 650px cap
            }}
            // sx={isModal ? { boxShadow: 3 } : { boxShadow: 3, maxWidth: 650 }}
          >
            <Table stickyHeader size={isSmDown ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{
                        cursor: headCell.id !== "waste" ? "pointer" : "default",
                      }}
                      onClick={
                        headCell.id !== "waste"
                          ? () => handleSortRequest(headCell.id)
                          : undefined
                      }
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedInstances.map((i) => (
                  <TableRow
                    key={i.instanceId}
                    hover
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <TableCell>
                      <Tooltip title={`Instance ID: ${i.instanceId}`}>
                        <span>{i.instanceId}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Type: ${i.instanceType}`}>
                        <span>{i.instanceType}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Region: ${i.region}`}>
                        <span>{i.region}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip title={`CPU Usage: ${i.cpu}%`}>
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={i.cpu}
                            color={
                              i.cpu > 70
                                ? "success"
                                : i.cpu > 30
                                ? "warning"
                                : "error"
                            }
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                          <Typography
                            variant="caption"
                            component="div"
                            align="center"
                          >
                            {i.cpu}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip title={`GPU Count: ${i.gpu}`}>{i.gpu}</Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip title={`Uptime in hours: ${i.uptimeHours}`}>
                        {i.uptimeHours}
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip
                        title={`Cost per hour: $${i.costPerHour.toFixed(3)}`}
                      >
                        {i.costPerHour.toFixed(3)}
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip
                        title={
                          i.waste === "High"
                            ? "High waste: Low CPU and high uptime"
                            : i.waste === "Medium"
                            ? "Medium waste: Moderate CPU"
                            : "Low waste: Good utilization"
                        }
                      >
                        {i.waste === "High" ? (
                          <WarningAmberIcon color="error" />
                        ) : (
                          <CheckCircleIcon color="success" />
                        )}
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {sortedInstances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No matching instances found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Box>
    </Box>
  );
};

export default InstanceTable;
