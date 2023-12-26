import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import OrderRow from "./OrderRow";
import { useSnackbar } from "notistack";
import { getFridayDates } from "../../helper/getFridays";

const OrdersListing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [orders, setOrders] = useState(null);
  const [deleteStack, setDeleteStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const fridayDates = getFridayDates();

  useEffect(() => {
    if (orders !== null) console.log(orders.length);
  }, [orders]);

  const getShopify = async () => {
    try {
      setLoading(true);
      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fridayDates),
      });
      setLoading(false);
      const json = await response.json();
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
              Wholesale Orders{" "}
              {orders
                ? `${format(new Date(fridayDates[1]), "MM/dd/yyyy")} - ${format(
                    new Date(fridayDates[0]),
                    "MM/dd/yyyy"
                  )}`
                : ""}
            </Typography>
          </Grid>
          <Grid item xs={3} sx={{ alignItems: "end" }}>
            <ButtonGroup fullWidth sx={{ height: "100%" }}>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                onClick={getShopify}
              >
                <Typography fontSize={14}>Shopify</Typography>
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
