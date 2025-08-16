import React, { useState, useMemo, useEffect } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import Filter from "../Filter/Filter";
import InstanceTable from "../InstanceTable/InstanceTable";
import LiveCloudCost from "../LiveCloudCost/LiveCloudCost";
import CostAttributionPanel from "../CostAttributionPanel/CostAttributionPanel";
import ServerUtilization from "../ServerUtilization/ServerUtilization";
import "./Dashboard.css";
import CommonModal from "./CommonModal/CommonModal";
import axios from "axios";

// Default filter values
const defaultFilters = {
  region: [],
  instanceType: [],
  waste: [],
};

// Helper: Determine waste level based on CPU and uptime
function getWasteLevel(cpu, uptime) {
  if (cpu < 30 && uptime > 24) return "High";
  if (cpu < 50) return "Medium";
  return "Low";
}

export default function Dashboard() {
  // State hooks
  const [filters, setFilters] = useState(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/getEC2Data"
        );
        setDashboardData(response.data);
        setDataSource(response.data.dataSource);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  console.log("Dashboard Data:", dashboardData);
  dataSource && console.log("Data Source:", dataSource);
  const allInstances = dashboardData?.allInstances ?? [];
  const costData = dashboardData?.costData ?? {
    breakdown: {},
    totalCost: "0.00",
  };
  const trendData = dashboardData?.trendData ?? [];

  // Modal handlers
  const openModalWithContent = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setModalTitle("");
  };

  // Memoized options for filters
  const availableOptions = useMemo(() => {
    const regions = [...new Set(allInstances.map((i) => i.region))];
    const instanceTypes = [...new Set(allInstances.map((i) => i.instanceType))];
    const wasteLevels = ["Low", "Medium", "High"];
    return {
      region: regions,
      instanceType: instanceTypes,
      waste: wasteLevels,
    };
  }, [allInstances]);

  // Memoized filtered instances
  const filteredInstances = useMemo(() => {
    return allInstances?.filter((inst) => {
      const waste = getWasteLevel(inst?.cpu, inst?.uptimeHours);
      return (
        (filters.region?.length === 0 ||
          filters.region?.includes(inst?.region)) &&
        (filters.instanceType?.length === 0 ||
          filters.instanceType?.includes(inst?.instanceType)) &&
        (filters.waste?.length === 0 || filters.waste?.includes(waste))
      );
    });
  }, [filters, allInstances]);

  // Memoized filtered cost data
  const filteredCostData = useMemo(() => {
    if (filters.region?.length === 0) return costData;
    const filteredBreakdown = Object.fromEntries(
      Object.entries(costData.breakdown).filter(([region]) =>
        filters.region?.includes(region)
      )
    );
    const totalCostSum = Object.values(filteredBreakdown).reduce(
      (sum, val) => sum + val,
      0
    );
    return {
      ...costData,
      totalCost: totalCostSum.toFixed(2),
      breakdown: filteredBreakdown,
    };
  }, [filters, costData]);

  // Reset filters to default
  const resetFilters = () => setFilters(defaultFilters);

  // Loading state UI
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state UI
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Defensive check for required data
  if (
    !dashboardData ||
    !dashboardData.allInstances ||
    !dashboardData.costData ||
    !dashboardData.trendData
  ) {
    return <Typography color="error">Incomplete data received</Typography>;
  }

  // Main dashboard UI
  return (
    <Box
      sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: "auto" }}
      className="dashboard-container"
    >
      {/* Filter Bar */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        mb={3}
        className="top-bar"
      >
        <Filter
          filters={filters}
          setFilters={setFilters}
          availableOptions={availableOptions}
          onReset={resetFilters}
        />
      </Box>

      {/* Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Instance Table */}
        <Grid className="hover-card" item xs={12} md={6}>
          <Box
            sx={{ cursor: "pointer" }}
            onClick={(e) => {
              const targetTag = e.target.tagName.toLowerCase();
              const isGraphElement =
                targetTag === "canvas" || e.target.closest(".chart-container");
              if (!isGraphElement) {
                openModalWithContent(
                  "EC2 Instance Utilization Table",
                  <InstanceTable instances={filteredInstances} isModal={true} />
                );
              }
            }}
          >
            <InstanceTable instances={filteredInstances} isModal={false} />
          </Box>
        </Grid>

        {/* Cost Attribution Panel */}
        <Grid className="hover-card" item xs={12} md={6}>
          <Box
            sx={{ cursor: "pointer" }}
            onClick={(e) => {
              const targetTag = e.target.tagName.toLowerCase();
              const isGraphElement =
                targetTag === "canvas" || e.target.closest(".chart-container");
              if (!isGraphElement) {
                openModalWithContent(
                  "Cost Attribution Panel",
                  <CostAttributionPanel
                    data={filteredCostData}
                    isModal={true}
                  />
                );
              }
            }}
          >
            <CostAttributionPanel data={filteredCostData} isModal={false} />
          </Box>
        </Grid>

        {/* Live Cloud Cost */}
        <Grid className="hover-card" item xs={12} md={4}>
          <Box
            sx={{ cursor: "pointer" }}
            onClick={(e) => {
              const targetTag = e.target.tagName.toLowerCase();
              const isGraphElement =
                targetTag === "canvas" || e.target.closest(".chart-container");
              if (!isGraphElement) {
                openModalWithContent(
                  "Cloud Cost Live Overview",
                  <LiveCloudCost trendData={trendData} />
                );
              }
            }}
          >
            <LiveCloudCost trendData={trendData} />
          </Box>
        </Grid>

        {/* Server Utilization */}
        <Grid className="hover-card" item xs={12} md={8}>
          <Box
            sx={{ cursor: "pointer" }}
            onClick={(e) => {
              const targetTag = e.target.tagName.toLowerCase();
              const isGraphElement =
                targetTag === "canvas" ||
                e.target.closest(".chart-container") ||
                e.target.closest(".MuiSelect-root") ||
                e.target.closest(".MuiMenu-paper");
              if (!isGraphElement) {
                openModalWithContent(
                  "Server Utilization Details",
                  <ServerUtilization data={filteredInstances} />
                );
              }
            }}
          >
            <ServerUtilization data={filteredInstances} />
          </Box>
        </Grid>
      </Grid>

      {/* Modal for details */}
      <CommonModal open={modalOpen} onClose={closeModal}>
        {modalContent}
      </CommonModal>
    </Box>
  );
}
