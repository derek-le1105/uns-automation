import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { useState } from "react";
import OrderRow from "./OrderRow";

const OrdersListing = ({ orders }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Customer</TableCell>
            <TableCell align="left">Fulfillment Number</TableCell>
            <TableCell align="left">Store Name</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {orders &&
            orders.map((order) => {
              return <OrderRow key={order.order_name} order={order} />;
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersListing;
