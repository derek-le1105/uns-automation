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
import CloseIcon from "@mui/icons-material/Close";

import { useState } from "react";
import OrderRow from "./OrderRow";
import { useSnackbar } from "notistack";

const OrdersListing = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletedRows, setDeletedRows] = useState([]);

  const action = (snackbarId) => {
    return (
      <>
        <Button
          variant={"text"}
          size={"small"}
          style={{ color: "#e3f2fd" }}
          onClick={() => {
            alert(`I belong to snackbar with id ${snackbarId}`);
          }}
        >
          Undo
        </Button>
        <IconButton
          aria-label="close"
          onClick={() => {
            closeSnackbar(snackbarId);
          }}
          style={{ color: "#e3f2fd" }}
        >
          <CloseIcon color={"inherit"} />
        </IconButton>
      </>
    );
  };

  const getShopify = async () => {
    try {
      setLoading(true);
      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleDeleteRow = (order_id) => {
    try {
      const newArray = orders.filter((item, index) => index !== order_id - 1);
      const updatedArray = newArray.map((item, index) => ({
        ...item,
        id: index + 1, // Update the id based on the new order
      }));
      enqueueSnackbar(`Deleted ${orders[order_id].order_name}`, { action });
      setOrders(updatedArray);
    } catch (error) {
      console.log(error);
    }
  };

  const undoDelete = () => {
    try {
      let recent_delete = deletedRows[-1];
      for (let i = 0; i < orders.length; i++) {}
    } catch (error) {}
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
              Wholesale Orders
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
              <Button fullWidth variant={"contained"} size={"medium"}>
                <Typography fontSize={14}>Create Order</Typography>
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
