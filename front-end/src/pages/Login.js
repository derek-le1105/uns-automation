import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { auth } from "../firebase";
import {
  setPersistence,
  signInWithEmailAndPassword,
  browserSessionPersistence,
} from "firebase/auth";

import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState("a");
  const { login } = useLogin();

  /*const firebaseErrorCodes = {
    "auth/missing-email": "Please enter a valid email",
    "auth/missing-password": "Please enter a valid password",
    "auth/invalid-login-credentials": "Please enter a valid email or password",
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPersistence(auth, browserSessionPersistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password)
        .then(async () => {
          await login(email, password);
          navigate("/home");
        })
        .catch((error) => {
          //alert("error" + error.code + " " + error.message);
          setError(error.code);
        });
    });
  };

  return (
    <div className="pages">
      <Form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="login"
      >
        <Form.Group className="mb-3">
          <h3 className="mb-3">Administrator Log In</h3>
          <FloatingLabel label="Email" className="mb-3">
            <Form.Control
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </FloatingLabel>
          <FloatingLabel label="Password" className="mb-3">
            <Form.Control
              type="password"
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </FloatingLabel>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Login;
