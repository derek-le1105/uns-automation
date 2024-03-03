import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { List, ListItem } from "@mui/material";

import { useState } from "react";

const BatchModal = ({ openModal, onClose, batch }) => {
  const handleClose = () => {
    onClose(false);
  };
  const handleConfirmation = () => {
    onClose(true);
  };
  return (
    <Dialog
      open={openModal}
      onClose={onClose}
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
        <DialogContentText id="alert-dialog-description"></DialogContentText>
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
