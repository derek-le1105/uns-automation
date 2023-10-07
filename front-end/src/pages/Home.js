import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { Table } from "react-bootstrap";
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
      /*const response = await axios.get(
        "https://ultumnaturesystems.myshopify.com/admin/api/2023-07/orders.json",
        [options]
      );*/
      //const response = await axios.get("/orders", [options]);
      const response = await fetch("/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      var line_items = new Set();
      var line_item_mapping = [];

      for (let i = 0; i < json.orders.length; ++i) {
        for (let j = 0; j < json.orders[i].line_items.length; ++j) {
          line_items.add(json.orders[i].line_items[j].product_id);
        }
      }

      setOrders(json);

      for (let i = 0; i < line_items.size / 50; ++i) {
        let curr_items = await getItems(
          Array.from(line_items).slice(i * 50, (i + 1) * 50)
        );

        for (const [key, value] of Object.entries(curr_items)) {
          line_item_mapping.push({ [key]: value });
        }
      }

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
      <OrdersListing orders={orders} />
    </div>
  );
};

export default Home;
