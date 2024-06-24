import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  Collapse,
  DialogTitle,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Stack,
  Paper,
  ListItemText,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";

import { supabase } from "../../supabaseClient";

const HeaderItem = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "black",
  width: "100%",
}));

const BatchEdits = ({ openEditModal, onClose, shipoutDate, supabaseData }) => {
  const [batches, setBatches] = useState([]);
  const [day, setDay] = useState(0);
  const [order, setOrder] = useState(0);

  useEffect(() => {
    const fetchSupabase = async () => {
      let { data: batch_data, error } = await supabase
        .from("batch_data")
        .select("*")
        .eq("wednesday_date", shipoutDate);
      const formattedBatch = Object.keys(batch_data[0])
        .filter((key) => key !== "wednesday_date")
        .sort()
        .map((key) => batch_data[0][key]);
      setBatches(formattedBatch);
    };
    fetchSupabase().catch((err) => console.log(err));
  }, [shipoutDate]);

  const handleClose = () => {
    onClose();
  };

  const handleDay = (e, newDay) => {
    setDay(newDay);
  };

  const handleOrder = (e, newOrder) => {
    setOrder(newOrder);
  };
  return (
    <>
      <Dialog
        open={openEditModal}
        fullWidth
        maxWidth={"lg"}
        onClose={handleClose}
      >
        <DialogTitle>{`Editting batches for ${shipoutDate}`}</DialogTitle>
        <DialogContent dividers>
          <Grid
            container
            sx={{ border: "1px solid black", borderRadius: "4px" }}
          >
            <Grid item container xs={4}>
              <Stack sx={{ width: "100%" }}>
                <HeaderItem>Batches</HeaderItem>
                <ToggleButtonGroup
                  value={day}
                  exclusive
                  onChange={handleDay}
                  orientation="vertical"
                  sx={{ height: "100%" }}
                >
                  {batches.map((batch, idx) => {
                    return (
                      <ToggleButton
                        value={idx}
                        key={idx}
                        sx={{ width: "100%" }}
                      >
                        {idx}
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Stack>
            </Grid>
            {batches[day] !== undefined && (
              <>
                <Grid item container xs={4}>
                  <Stack sx={{ width: "100%" }}>
                    <HeaderItem>Orders</HeaderItem>
                    <ToggleButtonGroup
                      value={order}
                      exclusive
                      onChange={handleOrder}
                      orientation="vertical"
                      sx={{ height: "100%" }}
                    >
                      {batches[day].map((batch, idx) => {
                        return (
                          <ToggleButton
                            value={idx}
                            key={idx}
                            sx={{ width: "100%" }}
                          >
                            {idx}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Stack>
                </Grid>
                <Grid item container xs={4}>
                  <Stack sx={{ width: "100%" }}>
                    <HeaderItem>Order</HeaderItem>
                    <List>
                      {batches[day][order] !== undefined && (
                        <ListItem sx={{ width: "100%" }}>
                          <ListItemText>
                            {batches[day][order]["order_name"]}
                          </ListItemText>
                        </ListItem>
                      )}
                    </List>
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button variant="contained" onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BatchEdits;
