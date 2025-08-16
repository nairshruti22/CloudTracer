import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Stack,
  IconButton,
  Drawer,
  Divider,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const Filter = ({ filters, setFilters, availableOptions, onReset }) => {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const toggleDrawer = (state) => () => {
    setOpen(state);
    if (state) {
      setTempFilters(filters); // Reset temp filters when opening
    }
  };

  const handleToggle = (key, value) => {
    setTempFilters((prev) => {
      const current = new Set(prev[key]);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  };

  const handleApply = () => {
    setFilters(tempFilters);
    setOpen(false);
  };

  const handleReset = () => {
    onReset();
    setTempFilters({
      region: [],
      instanceType: [],
      waste: [],
    });
  };

  return (
    <>
      {/* Filter Icon Button */}
      <Tooltip title="Filter" arrow>
        <IconButton
          color="inherit"
          aria-label="open filters"
          onClick={toggleDrawer(true)}
          sx={{ mr: 2 }}
        >
          <FilterListIcon />
        </IconButton>
      </Tooltip>

      {/* Drawer for Filter Options */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, p: 2 }} role="presentation">
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            {Object.keys(availableOptions).map((key) => (
              <Box key={key}>
                <Typography variant="subtitle2" gutterBottom>
                  {key.toUpperCase()}
                </Typography>
                <Stack spacing={0.5}>
                  {availableOptions[key].map((val) => (
                    <FormControlLabel
                      key={val}
                      control={
                        <Checkbox
                          checked={tempFilters[key]?.includes(val) || false}
                          onChange={() => handleToggle(key, val)}
                        />
                      }
                      label={val}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleReset}
              className="filter-button"
            >
              Reset
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleApply}
              className="filter-button"
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default Filter;
