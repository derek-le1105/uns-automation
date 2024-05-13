import { Button, Dialog, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useState, useEffect } from "react";
import ShipStationModal from "./PlantPackModal";
import BulkEditDialog from "./BulkEditDialog";
import { supabase } from "../../supabaseClient";
import { format_data } from "../../helper/supabaseHelpers";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [supabasePacks, setSupabasePacks] = useState();

  useEffect(() => {
    async function fetchSupabase() {
      let { data: plant_packs } = await supabase
        .from("plant_packs")
        .select("*");
      let formatted_packs = format_data(plant_packs);
      setSupabasePacks(formatted_packs);
    }
    fetchSupabase();
  });

  const handleClose = () => {
    setOpenDialog(false);
    setFileUpload(null);
  };

  return (
    <>
      <Grid container>
        <Grid container item sx={{ margin: "50px" }}>
          <Grid xs item />
          <Grid xs={1} item>
            <Button
              variant="contained"
              size="large"
              sx={{ height: "100%", width: "100%" }}
              onClick={(e) => {
                setOpenDialog(true);
              }}
            >
              Edit Packs
            </Button>
          </Grid>
        </Grid>
        <Grid container item>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<FileUploadIcon />}
            sx={{
              margin: "0px 50px",
              padding: "100px",
              width: "100%",
              border: "1px dashed grey",
              borderRadius: "5px",
            }}
          >
            Shipstation Upload
            <VisuallyHiddenInput
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                setOpenDialog(true);
                setFileUpload(e.target.files[e.target.files.length - 1]);
              }}
              onClick={(event) => {
                event.target.value = null;
              }}
            />
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        sx={{ padding: "50px", minHeight: "5vh" }}
        maxWidth={fileUpload ? "md" : "lg"}
        fullWidth
      >
        {fileUpload ? (
          <ShipStationModal
            file={fileUpload}
            openModal={openDialog}
            handleModalClose={handleClose}
          />
        ) : (
          <BulkEditDialog
            title={"Edit Packs"}
            supabasePacks={supabasePacks}
            handleModalClose={handleClose}
          />
        )}
      </Dialog>
    </>
  );
};

export default ShipStationPage;
