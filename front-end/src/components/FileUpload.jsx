import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useTheme } from "@mui/material/styles";
import { useState } from "react";

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

const FileUpload = ({ fileHandler, componentString = "Upload File" }) => {
  const theme = useTheme();
  const [filename, setFilename] = useState(componentString);
  return (
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
        fileHandler(e.target.files[e.target.files.length - 1]);
        setFilename(e.target.files[e.target.files.length - 1].name);
      }}
    >
      {filename}
      <VisuallyHiddenInput type="file" accept=".xlsx, .csv" />
    </Button>
  );
};

export default FileUpload;
