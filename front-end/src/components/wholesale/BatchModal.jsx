import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { List, ListItem } from "@mui/material";

import { isObjectIncluded, objectLength } from "../../helper/dataFunctions";

const BatchModal = ({ openModal, onClose, batch, supabaseData }) => {
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
            batch.map((order, _) => {
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
          {`The fulfillment code for this batch will start with code: ${supabaseData[0]}`}
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
