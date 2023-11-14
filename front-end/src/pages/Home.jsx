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

  const generateExcel = async () => {
    const response = await fetch("/excels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orders)
    });
  }

  const importOrder = async () => {
    //TODO: prompt user to enter order number
    const userPrompt = prompt("Enter order number(s) to add.\nEx: 'UNS-123456'")
    const reponse = await fetch("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPrompt)
    })
  }

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
      <button onClick={(generateExcel)}>Excel Files</button>
      <button onClick={(importOrder)}>Import</button>
      {orders && <OrdersListing orders={orders} />}
    </div>
  );
};

export default Home;
