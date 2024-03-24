import { Container, Box, Grid, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useTheme } from "@mui/material/styles";

import { useState } from "react";
import ShipStationModal from "./ShipStationModal";
import { readRetailExcel } from "../../helper/readRetailExcel";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Tools = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const modalClose = () => {
    setOpenModal(false);
  };

  const theme = useTheme();
  return (
    <>
      <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<FileUploadIcon />}
        sx={{
          margin: "50px",
          padding: "100px",
          width: "100%",
          border: "1px dashed grey",
          borderRadius: "5px",
        }}
        onChange={(e) => {
          setFileUpload(e.target.files[e.target.files.length - 1]);
          setOpenModal(true);
        }}
      >
        Upload file
        <VisuallyHiddenInput type="file" />
      </Button>
      <ShipStationModal
        file={fileUpload}
        openModal={openModal}
        modalClose={modalClose}
      />
    </>
  );
};

export default Tools;
