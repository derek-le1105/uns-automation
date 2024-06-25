import { Grid, Tooltip, Typography, Button } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const WholesaleHeader = ({
  beforeDate,
  afterDate,
  shipoutDate,
  onDateChange,
  onRefreshClick,
  onCreateClick,
  validSelection,
  onEditClick,
}) => {
  const theme = useTheme();
  const DatePickerSettings = [
    {
      type: "before",
      sessionItem: "before_date",
      label: "Start",
      value: beforeDate,
    },
    {
      type: "after",
      sessionItem: "after_date",
      label: "End",
      value: afterDate,
    },
    {
      type: "shipout",
      sessionItem: "shipout_date",
      label: "Shipout Date",
      value: shipoutDate,
    },
  ];
  return (
    <>
      <Grid container sx={{ padding: "25px 50px" }}>
        {DatePickerSettings.map((datePicker) => (
          <Grid item xs="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
                <DateTimePicker
                  label={datePicker.label}
                  defaultValue={datePicker.value}
                  onChange={(newValue) => {
                    onDateChange(newValue, datePicker.type);
                  }}
                  sx={{ background: `${theme.palette.common.white}` }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
        ))}
        <Grid item xs={0.5}></Grid>

        <Grid item xs>
          <Button
            sx={{ height: "100%" }}
            variant={"contained"}
            size={"medium"}
            onClick={() => {
              onRefreshClick();
            }}
          >
            <Typography fontSize={14}>Refresh</Typography>
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button
            sx={{ height: "100%" }}
            variant={"contained"}
            size={"medium"}
            onClick={() => {
              onEditClick();
            }}
          >
            <Typography fontSize={14}>Edit batch</Typography>
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Tooltip
            title="Please select at least one order"
            disableHoverListener={validSelection}
          >
            <div style={{ height: "100%" }}>
              <Button
                disabled={!validSelection}
                sx={{ height: "100%" }}
                variant={"contained"}
                size={"medium"}
                onClick={() => {
                  onCreateClick();
                }}
              >
                <Typography fontSize={14}>Create Excel</Typography>
              </Button>
            </div>
          </Tooltip>
        </Grid>
      </Grid>
    </>
  );
};

export default WholesaleHeader;
