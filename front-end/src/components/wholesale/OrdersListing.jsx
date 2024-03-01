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
import { compareData, objectUnion } from "../../helper/dataFunctions";
import { createWholesaleExcel } from "../../helper/createWholesaleExcel";

import { supabase } from "../../supabaseClient";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [orders, setOrders] = useState(null);
  const [deleteStack, setDeleteStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editting, setEditting] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const wholesaleDates = getWholesaleDates();

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
      /*const { data } = await supabase //see if there's an entry in the db with the wed date as the key
        .from("wholesale_shopify_dates")
        .select()
        .eq("wednesday_date", wholesaleDates[2])
        .limit(1)
        .maybeSingle();

      if (data) {
        var supabase_data = data.data;
        setLoading(false);
        setOrders(supabase_data);
        if ((new Date() - new Date(data.updated_at)) / 60000 < 5) {
          is_recent_updated = true;
        }
      }*/

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
          body: JSON.stringify(wholesaleDates),
        })
          .then((res) => {
            return res.json();
          })
          .then(async (res_data) => {
            json = res_data;

            //if (json.length) setOrders(json);
            /*if (data) {
              //if data already exists in db, don't 'insert'
              if (new Date(data.updated_at) < new Date(wholesaleDates[2])) {
                //if data is not the same, update
                //supabase upsert to update json information in db
                await supabase.from("wholesale_shopify_dates").upsert({
                  wednesday_date: wholesaleDates[2],
                  data: json,
                  updated_at: new Date().toISOString(),
                });
              }
            } else {
              await supabase.from("wholesale_shopify_dates").insert({
                //create an entry in the db with the new wed date along with data from Shopify
                wednesday_date: wholesaleDates[2],
                is_shopify_data_pulled: true,
                is_excel_file_created: false,
                data: json,
                updated_at: new Date().toISOString(),
              });
            }*/
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
    //TODO: fix fulfillment codes on each order
    //      allow users to specify where they want to fulfillment code to start on
    //      e.g: 0 being default and start of beginning of batch
    //           position 5 meaning there were 4 orders created in a prior batch

    try {
      await createWholesaleExcel(batchList);
      await supabase.from("wholesale_shopify_dates").upsert({
        //create an entry in the db with the new wed date along with data from Shopify
        wednesday_date: wholesaleDates[2],
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
    if (batchList.includes(orders[event.target.name - 1])) {
      setBatchList(
        batchList.filter((checked) => checked !== orders[event.target.name - 1])
      );
    } else {
      setBatchList([...batchList, orders[event.target.name - 1]]);
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
