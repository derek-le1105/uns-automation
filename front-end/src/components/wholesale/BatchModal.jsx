import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { List, ListItem } from "@mui/material";

import { supabase } from "../../supabaseClient";
import { useState, useEffect } from "react";

const BatchModal = ({ openModal, onClose, batch, row_date }) => {
  const [prevBatchLength, setPrevBatchLength] = useState();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("batch_data")
        .select()
        .eq("wednesday_date", row_date)
        .limit(1)
        .maybeSingle();

      var batchLength = 1;

      for (let batch in data) {
        if (batch === "wednesday_date") continue;
        if (data[batch]) batchLength += data[batch].length;
      }

      setPrevBatchLength(batchLength);
    }
    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  const handleClose = () => {
    onClose(false);
  };
  const handleConfirmation = () => {
    onClose(true);
  };
  return (
    <Dialog
      open={openModal}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Generating excel files for the following orders"}
      </DialogTitle>
      <DialogContent>
        <List>
          {batch &&
            batch.map((order, index) => {
              return (
                <ListItem key={order.order_name}>
                  <DialogContentText id="alert-dialog-description">
                    {order.order_name}
                  </DialogContentText>
                </ListItem>
              );
            })}
        </List>
        <DialogContentText id="alert-dialog-description">
          {`The fulfillment code for this batch will start with code: ${prevBatchLength}`}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleConfirmation} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchModal;
