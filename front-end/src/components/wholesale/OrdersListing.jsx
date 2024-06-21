import {
  Box,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import { useTheme } from "@mui/material/styles";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import BatchModal from "./BatchModal";
import CustomNoRowsOverlay from "./CustomNoRowsOverlay";
import { useSnackbar } from "notistack";
import { getWholesaleDates } from "../../helper/getWholesaleDates";
import { objectLength, isObjectIncluded } from "../../helper/dataFunctions";
import { createWholesaleExcel } from "../../helper/createWholesaleExcel";

import { supabase } from "../../supabaseClient";

import dayjs from "dayjs";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const wholesaleDates = getWholesaleDates();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beforeDate, setBeforeDate] = useState(dayjs(wholesaleDates[0]));
  const [afterDate, setAfterDate] = useState(dayjs(new Date()));
  const [shipoutDate, setShipoutDate] = useState(dayjs(wholesaleDates[1]));
  const [dateChanged, setDateChanged] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [supabaseData, setSupabaseData] = useState([]);

  async function fetchData() {
    const { data } = await supabase
      .from("batch_data")
      .select()
      .eq("wednesday_date", format(wholesaleDates[1], "MM/dd/yyyy"))
      .limit(1)
      .maybeSingle();

    setSupabaseData(objectLength(data));
  }

  useEffect(() => {
    fetchData().catch((error) => {
      console.log(error);
    });

    if (JSON.parse(sessionStorage.getItem("orders")) !== null)
      setOrders(JSON.parse(sessionStorage.getItem("orders")));
    else getShopify();
  }, []);

  useEffect(() => {
    fetchData().catch((error) => {
      console.log(error);
    });
  }, [shipoutDate]);

  const getShopify = async () => {
    setLoading(true);
    try {
      getWholesaleDates(afterDate, beforeDate);
      enqueueSnackbar(
        `Pulling Shopify orders between dates ${format(
          beforeDate.$d,
          "MM/dd/yyyy"
        )} - ${format(afterDate.$d, "MM/dd/yyy")}`,
        {
          variant: "success",
        }
      );

      await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([afterDate, beforeDate]),
      })
        .then((res) => {
          return res.json();
        })
        .then(async (res_data) => {
          let json = res_data;
          setLoading(false);
          setOrders(json);
          sessionStorage.setItem("orders", JSON.stringify(json));
        })
        .catch((error) => {
          enqueueSnackbar(error, {
            variant: "error",
          });
          console.log(error);
        });
    } catch (error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
      console.log(error);
    }
  };

  const generateExcel = async () => {
    try {
      //TODO: allow user to download excel files without uploading to db
      let batch_day = [new Date().getDay()].toString();
      var batch_length = supabaseData[0];
      var new_batch = batchList.map((order, index) => {
        return {
          ...orders[order],
          batch: batch_day,
        };
      });

      if (supabaseData !== null) {
        let curr_batch = supabaseData[1].filter(
          (order) => order.batch === batch_day
        );
        new_batch =
          curr_batch.length < 1
            ? [...new_batch]
            : [...curr_batch, ...new_batch];
      }
      new_batch.sort((a, b) => {
        return (
          parseInt(a.order_name.slice(-5)) - parseInt(b.order_name.slice(-5))
        );
      });

      await createWholesaleExcel(
        orders.filter((_, idx) => batchList.includes(idx)),
        batch_length,
        format(shipoutDate.$d, "MM/dd/yyyy")
      );
      await supabase.from("batch_data").upsert({
        //create an entry in the db with the new wed date along with data from Shopify
        wednesday_date: format(shipoutDate.$d, "MM/dd/yyyy"),
        [batch_day]: new_batch,
      });
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDialogClose = (valid_confirmation) => {
    setOpenModal(false);
    if (valid_confirmation) generateExcel();
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          background: `${theme.palette.grey[100]}`,
        }}
      >
        <Grid container sx={{ padding: "25px 50px" }}>
          <Grid item xs="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
                <DateTimePicker
                  label="Start"
                  defaultValue={
                    sessionStorage.getItem("before_date")
                      ? dayjs(sessionStorage.getItem("before_date"))
                      : dayjs(wholesaleDates[0])
                  }
                  onChange={(newValue) => {
                    sessionStorage.setItem("before_date", newValue);
                    setBeforeDate(newValue);
                    setDateChanged(true);
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>

          <Grid item xs="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
                <DateTimePicker
                  label="End"
                  value={afterDate}
                  onChange={(newValue) => {
                    sessionStorage.setItem("after_date", newValue);
                    setAfterDate(newValue);
                    setDateChanged(true);
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker", "DatePicker"]}>
                <DatePicker
                  label="Shipout Date"
                  value={shipoutDate}
                  onChange={(newValue) => {
                    sessionStorage.setItem("shipout_date", newValue);
                    setShipoutDate(newValue);
                    setDateChanged(true);
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={0.5}></Grid>

          <Grid item xs>
            <Button
              disabled={!dateChanged}
              sx={{ height: "100%" }}
              variant={"contained"}
              size={"medium"}
              onClick={() => {
                if (beforeDate - afterDate > 0) {
                  enqueueSnackbar("Please pick a valid date range", {
                    variant: "error",
                  });
                } else getShopify();
              }}
            >
              <Typography fontSize={14}>Update</Typography>
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Tooltip
              title="Please select at least one order"
              disableHoverListener={batchList.length > 0}
            >
              <Button
                disabled={batchList.length <= 0}
                sx={{ height: "100%" }}
                variant={"contained"}
                size={"medium"}
                onClick={() => {
                  if (batchList.length < 1) {
                    enqueueSnackbar("Please select at least one order", {
                      variant: "error",
                    });
                  } else setOpenModal(true);
                }}
              >
                <Typography fontSize={14}>Create Excel</Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Box
          sx={{
            padding: "0px 50px 50px 50px",
            display: "grid",
          }}
        >
          <DataGrid
            hideFooter
            autoHeight
            editMode="row"
            loading={loading}
            slots={{
              loadingOverlay: LinearProgress,
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            rows={orders.map((order, idx) => {
              return {
                id: idx,
                order_name: order.order_name,
                customer: order.customer.first_name,
                shipping: order.shipping,
              };
            })}
            columns={[
              {
                field: "order_name",
                headerName: "Order Name",
                flex: 0.5,
                align: "right",
                headerAlign: "right",
              },
              {
                field: "customer",
                headerName: "Customer",
                flex: 1,
              },
              {
                field: "status",
                headerName: "Is in previous batch?",
                flex: 0.5,
                align: "center",
                headerAlign: "center",
                renderCell: (params) =>
                  isObjectIncluded(supabaseData[1], params.row) ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  ),
              },
              {
                field: "shipping",
                headerName: "Shipping Method",
                flex: 1,
                editable: true,
                type: "singleSelect",
                valueOptions: ["Fedex", "GLS", "Airport", "Local"],
                align: "left",
                headerAlign: "left",
              },
            ]}
            checkboxSelection={true}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setBatchList(newRowSelectionModel);
            }}
            rowSelectionModel={batchList}
          ></DataGrid>
          <BatchModal
            openModal={openModal}
            onClose={handleDialogClose}
            batch={orders.filter((_, idx) => batchList.includes(idx))}
            supabaseData={supabaseData}
          />
        </Box>
      </Box>
    </>
  );
};

export default OrdersListing;
