import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import OrderRow from "./OrderRow";
import CustomToolbar from "../CustomToolbar";

const drawerWidth = 180;

const OrdersListing = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleDeleteRow = (order_id) => {};

  return (
    <>
      <CustomToolbar
        drawerWidth={drawerWidth}
        generateExcel={generateExcel}
        getShopify={getShopify}
      />

      {orders && (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Customer</TableCell>
                <TableCell align="left">Fulfillment Number</TableCell>
                <TableCell align="left">Store Name</TableCell>
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
      )}
    </>
  );
};

export default OrdersListing;
