import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

const PlantPackList = ({ plantList, listName }) => {
  return (
    <>
      <FormGroup>
        <FormLabel>{listName}</FormLabel>

        {plantList.map((plant, idx) => {
          return (
            <FormControlLabel
              control={<Checkbox />}
              label={<Typography fontSize={12}>{plant}</Typography>}
              key={idx}
            ></FormControlLabel>
          );
        })}
      </FormGroup>
    </>
  );
};

export default PlantPackList;
