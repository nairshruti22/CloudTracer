import React from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * CommonModal - Reusable modal component for dashboard
 * @param {boolean} open - Modal open state
 * @param {function} onClose - Handler to close modal
 * @param {React.ReactNode} children - Modal content
 */
const CommonModal = ({ open, onClose, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1000,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: "none",
        }}
      >
        {/* Close button */}
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>

        {/* Modal content */}
        {children}
      </Box>
    </Modal>
  );
};

export default CommonModal;
