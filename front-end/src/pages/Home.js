import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { Table } from "react-bootstrap";
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
      /*const response = await axios.get(
        "https://ultumnaturesystems.myshopify.com/admin/api/2023-07/orders.json",
        [options]
      );*/
      //const response = await axios.get("/pullShopifyOrders", [options]);
      const response = await fetch("/pullShopifyOrders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      setOrders(json);
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
