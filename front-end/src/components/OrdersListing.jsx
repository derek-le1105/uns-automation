import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";

const OrdersListing = ({ orders, items }) => {
  const [shopifyOrders, setShopifyOrders] = useState(null);

  useEffect(() => {
    if (items) {
      const order_dict = {};
      orders.orders.map((order, idx) => {
        var orderLastName =
          order.customer.last_name.length > 4
            ? order.customer.last_name.slice(
                order.customer.last_name.length - 4
              )
            : order.customer.last_name;

        if (orderLastName in order_dict) {
          for (let i = 0; i < order.line_items.length; ++i) {
            order_dict[orderLastName].line_items.push(order.line_items[i]);
          }
        } else {
          order_dict[orderLastName] = { ...order, store_code: orderLastName };
        }
        return order_dict;
      });
      setShopifyOrders(Object.values(order_dict));
    }
  }, [orders, items]);

  return (
    <div className="order-listings">
      <Table striped bordered hover>
        <thead>
          {shopifyOrders &&
            shopifyOrders.map((order, idx) => {
              //console.log(order);
            })}
        </thead>
      </Table>
    </div>
  );
};

export default OrdersListing;
