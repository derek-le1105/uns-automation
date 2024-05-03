import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useState } from "react";
import ShipStationModal from "./PlantPackModal";

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

const ShipStationPage = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleModalClose = () => {
    setOpenModal(false);
  };

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
        Shipstation Upload
        <VisuallyHiddenInput type="file" accept=".xlsx, .xls, .csv" />
      </Button>
      {fileUpload && (
        <ShipStationModal
          file={fileUpload}
          openModal={openModal}
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
};

export default ShipStationPage;
