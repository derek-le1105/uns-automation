import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import OrdersListing from "../components/OrdersListing";

const Home = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [orders, setOrders] = useState(null);
  const [items, setItems] = useState(null);
  const uploadFile = () => {
    if (fileUpload == null) return;

    const fileRef = ref(storage, `files/${fileUpload.name + v4()}`);

    uploadBytes(fileRef, fileUpload).then(
      () => {
        alert("File uploaded");
      },
      (error) => {
        alert(error);
      }
    );
  };

  const getShopify = async () => {
    try {
      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      var line_items = new Set();
      var line_item_mapping = [];
      var orders = []
      console.log(json)
      
      json.orders.forEach((order) => {
        if(!(order.tags.includes("Edit Order"))){
          orders.push(order)
        }
      }) 
      console.log(orders)

      for (let i = 0; i < orders.length; ++i) {
        for (let j = 0; j < orders[i].line_items.length; ++j) {
          line_items.add(orders[i].line_items[j].product_id);
        }
      }

      //setOrders(orders);

      for (let i = 0; i < line_items.size / 50; ++i) {
        let curr_items = await getItems(
          Array.from(line_items).slice(i * 50, (i + 1) * 50)
        );

        for (const [key, value] of Object.entries(curr_items)) {
          line_item_mapping.push({ [key]: value });
        }
      }
      console.log(line_item_mapping)

      setItems(line_item_mapping);
    } catch (error) {
      console.log(error);
    }
  };

  const getItems = async (line_items) => {
    try {
      const response = await fetch(`/item?ids=${[...line_items].join(", ")}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="">
      {/*<input
          onChange={(e) => {
            setFileUpload(e.target.files[0]);
          }}
        type="file"
        ></input>
      <button onClick={uploadFile}>Upload</button>*/}
      <button onClick={getShopify}>Shopify</button>
      {orders && items && <OrdersListing orders={orders} items={items} />}
    </div>
  );
};

export default Home;
