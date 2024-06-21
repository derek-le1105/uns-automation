import {
  List,
  ListItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Tooltip,
  Stack,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

import { isObjectIncluded } from "../../helper/dataFunctions";

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
      maxWidth={"sm"}
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        {"Generating excel files for the following orders"}
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {batch.map((order, idx) => {
            let isOrderExisting = isObjectIncluded(supabaseData[1], order);
            return (
              <ListItem key={order.order_name}>
                <Stack alignItems="center" direction="row" gap={2}>
                  <div style={{ display: "flex" }}>
                    <Typography
                      sx={{ alignItems: "center", justifyContent: "center" }}
                      paragraph
                      alignItems={"center"}
                    >{`${supabaseData[0] + idx}: ${
                      order.order_name
                    } `}</Typography>
                    {isOrderExisting && (
                      <Tooltip
                        title="This order exists already in a previous batch"
                        placement="right"
                        arrow
                      >
                        <ErrorIcon sx={{ color: "red", marginLeft: "20px" }} />
                      </Tooltip>
                    )}
                  </div>
                </Stack>
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
