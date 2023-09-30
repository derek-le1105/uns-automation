import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

const Home = () => {
  const [fileUpload, setFileUpload] = useState(null);
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
  return (
    <>
      <input
        onChange={(e) => {
          setFileUpload(e.target.files[0]);
        }}
        type="file"
      ></input>
      <button onClick={uploadFile}>Upload</button>
    </>
  );
};

export default Home;
