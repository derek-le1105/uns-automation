import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";

const OrdersListing = ({ orders }) => {
  return (
    <div className="order-listings">
      {orders && Object.keys(orders).map((order, idx) => {
        return(<div className={`order ${idx}`} key={idx}>
          <div className={`customer ${order}`} onClick={() => {

          }}>{order} {idx+1}</div>
          <Table className="">
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Plant Name</th>  
                  <th>Barcode</th>
                  <th>Fulfillment Number</th>
                  <th>Vendor</th> 
                  <th>SKU</th>
                  <th>Customer Code</th>
                </tr>
              </thead>
              <tbody>
                {orders[order].map((item, key) => {
                  return (<tr key={key}>
                    <td>{item.quantity}</td>
                    <td>{item.title}</td>
                    <td>{item.barcode}</td>
                    <td>{item.fulfillment_number}</td>
                    <td>{item.vendor}</td>
                    <td>{item.sku}</td>
                    <td>{item.customer_code}</td>
                  </tr>)
                })}
              </tbody>
            </Table>
          
        </div>)
        
      })}
    </div>
  );
};

export default OrdersListing;
