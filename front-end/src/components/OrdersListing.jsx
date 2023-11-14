import CustomizedTable from "./CustomizedTable";

const OrdersListing = ({ orders }) => {
  return (
    <div className="order-listings">
      {orders && orders.map((order, idx) => {
        return(
          <>
            <div className={`customer ${order.customer}`}>{order.customer} {idx+1}</div>
            <CustomizedTable order={order}/>
          </>
          
          /*<div className={`order ${idx+1}`} key={idx}>
            <div className={`customer ${order.customer}`}>{order.customer} {idx+1}</div>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Quantity</TableCell>
                    <TableCell align="left">Plant Name</TableCell>
                    <TableCell align="left">Barcode</TableCell>
                    <TableCell align="left">Fulfillment Number</TableCell>
                    <TableCell align="left">Vendor</TableCell>
                    <TableCell align="left">SKU</TableCell>
                    <TableCell align="left">Customer Code</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {order.items.map((item, key) => {
                    return (<TableRow key={key}>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="left">{item.title}</TableCell>
                      <TableCell align="left">{item.barcode}</TableCell>
                      <TableCell align="left">{item.fulfillment_number}</TableCell>
                      <TableCell align="left">{item.vendor}</TableCell>
                      <TableCell align="left">{item.sku}</TableCell>
                      <TableCell align="left">{item.customer_code}</TableCell>
                    </TableRow>)
                  })}
                </TableBody>
              </Table>
            </TableContainer>       
                </div>*/)
        })}
    </div>
  );
};

export default OrdersListing;
