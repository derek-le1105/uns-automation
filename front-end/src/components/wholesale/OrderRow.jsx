import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState, useEffect } from "react";

const OrderRow = (props) => {
  const { order, handleDeleteRow, isEditting, handleChecked } = props;
  const [open, setOpen] = useState(false);
  const [shipping, setShipping] = useState("Fedex");

  const handleChange = (event) => {
    setShipping(event.target.value);
    order.shipping = event.target.value;
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "none" } }}>
        <TableCell>
          {isEditting ? (
            <Checkbox
              name={order.id.toString()}
              onChange={handleChecked}
            ></Checkbox>
          ) : (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {order.order_name}
        </TableCell>
        <TableCell align="center">{order.id}</TableCell>
        <TableCell align="left">{order.customer.first_name}</TableCell>
        <TableCell align="left">
          <FormControl sx={{ m: 1 }} size="small" fullWidth>
            <InputLabel id="demo-simple-select-label">Shipping</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={shipping}
              label="Shipping"
              onChange={handleChange}
            >
              <MenuItem value={"Airport"}>Airport</MenuItem>
              <MenuItem value={"Fedex"}>Fedex</MenuItem>
              <MenuItem value={"GLS"}>GLS</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="delete row"
            size="small"
            onClick={() => handleDeleteRow(order.id)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Plant</TableCell>
                    <TableCell align="left">SKU</TableCell>
                    <TableCell align="left">Vendor</TableCell>
                    <TableCell align="left">Barcode</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.title}>
                      <TableCell component="th" scope="row">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell align="left">{item.sku}</TableCell>
                      <TableCell align="left">{item.vendor}</TableCell>
                      <TableCell align="left">{item.barcode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default OrderRow;
