import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import OrdersListing from "../components/OrdersListing";

const Home = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [orders, setOrders] = useState(null);
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
      setOrders(json)
      
      
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
      <button onClick={(getShopify)}>Shopify</button>
      {orders && <OrdersListing orders={orders} />}
    </div>
  );
};

export default Home;
