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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import OrderRow from "./OrderRow";
import BatchModal from "./BatchModal";
import { useSnackbar } from "notistack";
import { getWholesaleDates } from "../../helper/getWholesaleDates";
import { isObjectIncluded, objectLength } from "../../helper/dataFunctions";
import { createWholesaleExcel } from "../../helper/createWholesaleExcel";

import { supabase } from "../../supabaseClient";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const wholesaleDates = getWholesaleDates();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [batchList, setBatchList] = useState([]);

  useEffect(() => {
    getShopify();
  }, []);

  const getShopify = async () => {
    setLoading(true);
    var json;
    try {
      var is_recent_updated = false;
      const { data } = await supabase //see if there's an entry in the db with the wed date as the key
        .from("wholesale_shopify_dates")
        .select()
        .eq("wednesday_date", format(wholesaleDates[2], "MM/dd/yyyy"))
        .limit(1)
        .maybeSingle();

      if (data) {
        setLoading(false);
        setOrders(data.data);
        if ((new Date() - new Date(data.updated_at)) / 60000 < 5) {
          is_recent_updated = true;
        }
      }

      enqueueSnackbar(
        `Pulling Shopify orders between dates ${format(
          wholesaleDates[1],
          "MM/dd/yyyy"
        )} - ${format(wholesaleDates[0], "MM/dd/yyy")}`,
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

            if (data) {
              //if data already exists in db, don't 'insert'
              if (new Date(data.updated_at) < new Date(wholesaleDates[2])) {
                //if data is not the same, update
                //supabase upsert to update json information in db
                await supabase.from("wholesale_shopify_dates").upsert({
                  wednesday_date: format(wholesaleDates[2], "MM/dd/yyyy"),
                  data: json,
                  updated_at: new Date().toISOString(),
                });
              }
            } else {
              await supabase.from("wholesale_shopify_dates").insert({
                //create an entry in the db with the new wed date along with data from Shopify
                wednesday_date: format(wholesaleDates[2], "MM/dd/yyyy"),
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
    //TODO: uncheck all checked boxes after generating
    const { data } = await supabase
      .from("batch_data")
      .select()
      .eq("wednesday_date", format(wholesaleDates[2], "MM/dd/yyyy"))
      .limit(1)
      .maybeSingle();
    var [batch_length] = objectLength(data);

    var new_batch = batchList.map((order, index) => {
      return { ...order, id: index + batch_length };
    });

    if (data[new Date().getDay()])
      new_batch = [...data[new Date().getDay()], ...new_batch];

    try {
      await createWholesaleExcel(batchList, batch_length);

      await supabase.from("batch_data").upsert({
        //create an entry in the db with the new wed date along with data from Shopify
        wednesday_date: format(wholesaleDates[2], "MM/dd/yyyy"),
        [new Date().getDay()]: new_batch,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const inputShipping = async () => {};

  const handleChecked = (event) => {
    let new_batch_list = [...batchList, orders[event.target.name - 1]];

    if (isObjectIncluded(batchList, orders[event.target.name - 1])) {
      new_batch_list = new_batch_list.filter(
        (checked) =>
          checked.order_name !== orders[event.target.name - 1].order_name
      );
    }
    setBatchList(new_batch_list);
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
                      <TableCell align="left">Store Name</TableCell>
                      <TableCell align="left">Shipping Method</TableCell>
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
                            handleChecked={handleChecked}
                          />
                        );
                      })}
                  </TableBody>
                  {openModal && (
                    <BatchModal
                      openModal={openModal}
                      onClose={handleDialogClose}
                      batch={batchList}
                      row_date={format(wholesaleDates[2], "MM/dd/yyyy")}
                    />
                  )}
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
