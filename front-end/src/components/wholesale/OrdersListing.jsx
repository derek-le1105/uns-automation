import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Box,
  Grid,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import UndoIcon from "@mui/icons-material/Undo";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import OrderRow from "./OrderRow";
import { useSnackbar } from "notistack";
import { getWholesaleDates } from "../../helper/getWholesaleDates";
import { compareData, objectUnion } from "../../helper/dataFunctions";
import { createWholesaleExcel } from "../../helper/createWholesaleExcel";

import { supabase } from "../../supabaseClient";

import dayjs from "dayjs";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [orders, setOrders] = useState(null);
  const [deleteStack, setDeleteStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editting, setEditting] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const wholesaleDates = getWholesaleDates();
  const [beforeDate, setBeforeDate] = useState(dayjs(wholesaleDates[1]));
  const [afterDate, setAfterDate] = useState(dayjs(wholesaleDates[0]));
  const [dateChanged, setDateChanged] = useState(false);

  useEffect(() => {
    getShopify();
  }, []);

  const getShopify = async () => {
    //TODO: account for case where saved data to the db does not contain all of the orders
    //      i.e: data was saved before all 'edit order' tagged orders were completed
    setLoading(true);
    var json;
    try {
      var is_recent_updated = false;
      const { data } = await supabase //see if there's an entry in the db with the wed date as the key
        .from("wholesale_shopify_dates")
        .select()
        .eq("wednesday_date", format(wholesaleDates[2], "yyyy-MM-dd"))
        .limit(1)
        .maybeSingle();

      if (data) {
        var supabase_data = data.data;
        setLoading(false);
        setOrders(supabase_data);
        if ((new Date() - new Date(data.updated_at)) / 60000 < 1) {
          is_recent_updated = true;
        }
      }

      enqueueSnackbar(
        `Pulling Shopify orders between dates ${formatDate(wholesaleDates)}`,
        {
          variant: "success",
        }
      );
      if (!is_recent_updated) {
        fetch("/orders", {
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
            json = res_data;

            //if (json.length) setOrders(json);
            if (data) {
              //if data already exists in db, don't 'insert'
              if (new Date(data.updated_at) < new Date(wholesaleDates[2])) {
                //if data is not the same, update
                //supabase upsert to update json information in db
                await supabase.from("wholesale_shopify_dates").upsert({
                  wednesday_date: format(wholesaleDates[2], "yyyy-MM-dd"),
                  data: json,
                  updated_at: new Date().toISOString(),
                });
              }
            } else {
              await supabase.from("wholesale_shopify_dates").insert({
                //create an entry in the db with the new wed date along with data from Shopify
                wednesday_date: format(wholesaleDates[2], "yyyy-MM-dd"),
                is_shopify_data_pulled: true,
                is_excel_file_created: false,
                data: json,
                updated_at: new Date().toISOString(),
              });
            }
            setLoading(false);
            setOrders(json);
          });
      }
    } catch (error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
      console.log(error);
    }
  };

  const generateExcel = async () => {
    try {
      await createWholesaleExcel(orders);
      await supabase.from("wholesale_shopify_dates").upsert({
        //create an entry in the db with the new wed date along with data from Shopify
        wednesday_date: format(wholesaleDates[2], "yyyy-MM-dd"),
        is_excel_file_created: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const inputShipping = async () => {};

  const handleDeleteRow = (order_id) => {
    try {
      let new_delete = orders[order_id - 1];

      enqueueSnackbar(`Deleted ${orders[order_id].order_name}`, {
        variant: "success",
      });
      const updatedArray = orders
        .filter((item, index) => index !== order_id - 1)
        .map((item, index) => ({
          ...item,
          id: index + 1, // Update the id based on the new order
        }));
      setOrders(updatedArray);
      setDeleteStack([...deleteStack, new_delete]);
    } catch (error) {
      console.log(error);
    }
  };

  const undoDelete = () => {
    try {
      const top = deleteStack[deleteStack.length - 1];
      const newArray = [
        ...orders.slice(0, top.id - 1),
        top,
        ...orders.slice(top.id - 1),
      ];
      setOrders(newArray.map((item, index) => ({ ...item, id: index + 1 })));
      setDeleteStack(deleteStack.slice(0, -1));
      enqueueSnackbar(`Recovered ${top.order_name}`, { variant: "success" });
    } catch (error) {
      if (error instanceof TypeError) {
        enqueueSnackbar(`Nothing to delete`, { variant: "error" });
      }
      console.log(error);
    }
  };

  const formatDate = (dates) => {
    return `${format(new Date(dates[1]), "MM/dd/yyyy")} - ${format(
      new Date(dates[0]),
      "MM/dd/yyyy"
    )}`;
  };

  const handleChecked = (event) => {
    if (checkedList.includes(event.target.name)) {
      setCheckedList(
        checkedList.filter((checked) => checked !== event.target.name)
      );
    } else {
      setCheckedList([...checkedList, event.target.name]);
    }
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
        <Grid container spacing={2} sx={{ padding: "25px 50px" }}>
          <Grid item xs={9}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
                <Grid container spacing={4} sx={{ maxWidth: "100%" }}>
                  <Grid item xs={3}>
                    <Typography align="left" variant="h4">
                      {"Wholesale Orders"}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <DateTimePicker
                      label="Start"
                      defaultValue={dayjs(wholesaleDates[1])}
                      onChange={(newValue) => {
                        setBeforeDate(newValue);
                        setDateChanged(true);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <DateTimePicker
                      label="End"
                      value={afterDate}
                      onChange={(newValue) => {
                        setAfterDate(newValue);
                        setDateChanged(true);
                      }}
                    />
                  </Grid>
                  {dateChanged && (
                    <Grid item xs={3}>
                      <Button
                        sx={{ height: "100%" }}
                        variant={"contained"}
                        size={"medium"}
                        onClick={() => {
                          getShopify();
                        }}
                      >
                        <Typography fontSize={14}>Edit</Typography>
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </DemoContainer>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={3} sx={{ alignItems: "end" }}>
            <ButtonGroup fullWidth sx={{ height: "100%" }}>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                onClick={() => {}}
              >
                <Typography fontSize={14}>Edit</Typography>
              </Button>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                onClick={generateExcel}
              >
                <Typography fontSize={14}>Create Excel</Typography>
              </Button>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                onClick={inputShipping}
              >
                <Typography fontSize={14}>Input Shipping</Typography>
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <Box sx={{ padding: "0px 50px 50px 50px" }}>
          {loading ? (
            <CircularProgress size={100} />
          ) : (
            orders && (
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>{`Customer (${orders.length})`}</TableCell>
                      <TableCell align="center">Fulfillment Number</TableCell>
                      <TableCell align="left">Store Name</TableCell>
                      <TableCell align="left">Shipping Method</TableCell>
                      <TableCell>
                        <IconButton
                          disabled={!deleteStack.length}
                          aria-label="undo"
                          onClick={() => {
                            undoDelete();
                          }}
                        >
                          <UndoIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {orders &&
                      orders.map((order) => {
                        return (
                          <OrderRow
                            key={order.order_name}
                            order={order}
                            handleDeleteRow={handleDeleteRow}
                            isEditting={editting}
                            handleChecked={handleChecked}
                          />
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </Box>
      </Box>
    </>
  );
};

export default OrdersListing;
