import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { List, ListItem } from "@mui/material";

import { supabase } from "../../supabaseClient";
import { useState, useEffect } from "react";

import { isObjectIncluded } from "../../helper/dataFunctions";

const BatchModal = ({ openModal, onClose, batch, row_date }) => {
  const [prevBatchLength, setPrevBatchLength] = useState();
  const [supabaseData, setSupabaseData] = useState([]);

  useEffect(() => {
    //TODO: add precaution if selected order was in a previous batch
    async function fetchData() {
      const { data } = await supabase
        .from("batch_data")
        .select()
        .eq("wednesday_date", row_date)
        .limit(1)
        .maybeSingle();

      var batchLength = 1;
      var all_batches = [];
      for (let batch in data) {
        if (batch === "wednesday_date") continue;
        if (data[batch]) {
          all_batches = [...all_batches, ...data[batch]];
          batchLength += data[batch].length;
        }
      }
      console.log(all_batches);
      setSupabaseData(all_batches);
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
                  <DialogContentText>
                    {`${order.order_name} ${
                      isObjectIncluded(supabaseData, order)
                        ? "This order already exists in a previous batch"
                        : ""
                    }`}
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
