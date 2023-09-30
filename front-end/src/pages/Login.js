import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  setPersistence,
  signInWithEmailAndPassword,
  browserSessionPersistence,
} from "firebase/auth";
import { Form, Button, FloatingLabel } from "react-bootstrap";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const handleSubmit = async (e) => {
    //console.log(email, password);
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      alert(error);
    }

    // setPersistence(auth, browserSessionPersistence).then(() => {
    //   return signInWithEmailAndPassword(auth, email, password)
    //     .then(() => {
    //       navigate("/home");
    //     })
    //     .catch((error) => {
    //       alert(error.message);
    //     });
    // });
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
              type="text"
              label="Email"
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
          {/* {<Button variant="secondary" onClick={homeSubmit}>
            Home
          </Button>} */}
        </Form.Group>
      </Form>
    </div>
  );
};

export default Login;
