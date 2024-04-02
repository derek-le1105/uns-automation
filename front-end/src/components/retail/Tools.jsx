import { styled } from "@mui/material/styles";

import { useTheme } from "@mui/material/styles";

import { useState } from "react";
import ShipStationModal from "./ShipStationModal";
import FileUpload from "../FileUpload";

const Tools = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const modalClose = () => {
    setOpenModal(false);
  };

  const handleFileUpload = (file) => {
    if (file !== null) setOpenModal(true);
    setFileUpload(file);
  };

  const theme = useTheme();
  return (
    <>
      <FileUpload fileHandler={handleFileUpload} />
      <ShipStationModal
        file={fileUpload}
        openModal={openModal}
        modalClose={modalClose}
      />
    </>
  );
};

export default Tools;
