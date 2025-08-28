import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Register } from "./register/Register";
import { Login } from "./login/Login";
import { Welcome } from "./welcome/Welcome";
import { OtpVerification } from "./login/OtpVerification";
import { PrivateRoute } from "./PrivateRoute";
import { ForgotPassword } from "./login/ForgotPassword";
import { ResetPassword } from "./login/ResetPassword";
import { ChangePassword } from "./welcome/ChangePassword";
import { Homepage } from "./Homepage";
import { Side } from "./side/Side";
import { Chat } from "./side/Chat";
// import { Message } from "./message/Message";
// import { MessageExample } from "./MessageExample";
import { Layout } from "./Layout";
import { UserProvider } from "./UserContext";
import { ToastContainer } from "react-toastify";
import { Provider } from 'react-redux';

const App = () => {
  return (
    <div className="App">

      <UserProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verification" element={<OtpVerification />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:id/:token"
              element={<ResetPassword />}
            />
            <Route element={<PrivateRoute />}>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/layout" element={<Layout />} />
              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/homepage" element={<Homepage />} />
              {/* <Route path='/message' element={<Message />} /> */}
              {/* <Route path="/side" element={<Side />} />
              <Route path="/chat" element={<Chat />} /> */}
              {/* <Route path="/messagexample" element={<MessageExample />} /> */}
            </Route>
          </Routes>
        </Router>
      <ToastContainer />
      </UserProvider>

      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
};

export default App;
