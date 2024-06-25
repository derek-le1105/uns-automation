import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  DialogContentText,
  Typography,
  Grid,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const DeleteConfirmation = ({
  deleteClicked,
  onClose,
  packTitle,
  onConfirmation,
}) => {
  const theme = useTheme();
  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    onClose();
    onConfirmation();
  };

  return (
    <Dialog open={deleteClicked} onClose={handleClose}>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "100px",
        }}
      >
        <HighlightOffIcon
          className="delete-warning-logo"
          sx={{ color: "error.light" }}
        />
      </Grid>
      <DialogTitle>{`Are you sure you want to delete the ${packTitle}?`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>This action is irreversible</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: "0px 25px 25px 25px" }}>
        <Button
          onClick={handleClose}
          variant="contained"
          autoFocus
          sx={{ background: "#818181" }}
        >
          No
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          autoFocus
        >
          Yes delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmation;
