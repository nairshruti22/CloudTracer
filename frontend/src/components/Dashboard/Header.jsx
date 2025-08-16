import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

const Header = () => (
  <Box
    className="header"
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    p={2}
    sx={{ borderBottom: "1px solid #ddd", mb: 3 }}
  >
    {/* Logo + Title */}
    <Box display="flex" alignItems="center">
      <img src="/logo.png" alt="Logo" style={{ height: 40, marginRight: 12 }} />
      <Typography variant="h5" ml={2} fontWeight="bold">
        CloudTracer
      </Typography>
    </Box>

    {/* User Profile */}
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar alt="S" src="/" />
    </Box>
  </Box>
);

export default Header;
