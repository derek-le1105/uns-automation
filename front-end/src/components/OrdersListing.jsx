import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";

const OrdersListing = ({ orders }) => {


  return (
    <div className="order-listings">
      {orders && Object.keys(orders).map((order, idx) => {
        return(<div className={`order ${idx}`}>
          <div className="customer">{order}</div>
          <Table>
              <thead>
                <tr>
                  <th>Plant Name</th>
                  <th>Quantity</th>
                  <th>Vendor</th>
                  <th>Barcode</th>
                </tr>
              </thead>
              <tbody>
                {orders[order].map((item, key) => {
                  return (<tr>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>{item.vendor}</td>
                    <td>{item.barcode}</td>
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
