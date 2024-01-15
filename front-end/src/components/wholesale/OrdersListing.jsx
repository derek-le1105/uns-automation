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
  Checkbox,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UndoIcon from "@mui/icons-material/Undo";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import OrderRow from "./OrderRow";
import { useSnackbar } from "notistack";
import { getWholesaleDates } from "../../helper/getWholesaleDates";

import { supabase } from "../../supabaseClient";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [orders, setOrders] = useState(null);
  const [deleteStack, setDeleteStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editting, setEditting] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const wholesaleDates = getWholesaleDates();

  useEffect(() => {
    getShopify();
  }, []);

  const getShopify = async () => {
    //TODO: account for case where saved data to the db does not contain all of the orders
    //      i.e: data was saved before all 'edit order' tagged orders were completed
    setLoading(true);
    var response, json;
    try {
      const { data } = await supabase //see if there's an entry in the db with the wed date as the key
        .from("wholesale_shopify_dates")
        .select()
        .eq("wednesday_date", wholesaleDates[2]);

      if (!data.length) {
        //if no such entry is in db, returned 'data' value will be an empty array
        enqueueSnackbar(
          `Pulling Shopify orders between dates ${formatDate(wholesaleDates)}`,
          {
            variant: "success",
          }
        );
        response = await fetch("/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wholesaleDates),
        });

        json = await response.json();

        await supabase.from("wholesale_shopify_dates").insert({
          //create an entry in the db with the new wed date along with data from Shopify
          wednesday_date: wholesaleDates[2],
          is_shopify_data_pulled: true,
          data: json,
        });
      } else {
        json = data[0].data;
      }

      setLoading(false);
      setOrders(json);
    } catch (error) {
      console.log(error);
    }
  };

  const generateExcel = async () => {
    const response = await fetch("/excels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orders),
    });
  };

  const editOrders = async () => {
    setEditting(!editting);
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
        <Grid container sx={{ padding: "25px 50px" }}>
          <Grid item xs={9}>
            <Typography align="left" variant="h4">
              {orders
                ? `Wholesale Orders | ${format(
                    new Date(wholesaleDates[1]),
                    "MM/dd/yyyy"
                  )} - ${format(new Date(wholesaleDates[0]), "MM/dd/yyyy")}`
                : "Wholesale Orders"}
            </Typography>
          </Grid>

          <Grid item xs={3} sx={{ alignItems: "end" }}>
            <ButtonGroup fullWidth sx={{ height: "100%" }}>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                onClick={editOrders}
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
