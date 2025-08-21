import React from "react";
import "../register/Register.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useContext, useEffect } from "react";
import { UserContext } from "../UserContext";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   if (location.state?.showRegisterToast) {
  //     toast.success(location.state.showRegisterToast);
  //     navigate(location.pathname, { replace: true });
  //   }
  // }, [location, navigate]);

  // useEffect(() => {
  //   if (location.state?.toast) {
  //     toast.success(location.state.toast);
  //   } else if (location.state?.toast2) {
  //     toast.success(location.state.toast2);
  //   }
  // }, [location]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Valid email required")
        .required("Email is required"),
      password: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/users/login",
          values
        );

        //--------------------------------without otp----------------------------
        const token = response.data.token;
        const id = response.data.user.id;
        localStorage.setItem("token", token);
        localStorage.setItem("id", id);
        console.log("User-----------", response);
        setToken(token);
        navigate("/layout", { state: { showLoginToast: "Login Successful" } });

        //------------------------------with otp---------------------------------
        // navigate('/verification')
      } catch (error) {
        if (error.response) {
          toast.error(`Login failed : ${error.response.data.message}`);
        } else {
          console.error("Unexpected error:", error.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const changeShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="main">
      <img
        style={{ position: "fixed", zIndex: "-1" }}
        src="/images/image1.jpg"
        alt="image"
      />
      <form className="loginForm_container">
        <h2 className="legendText">Login</h2>
        <label className="labelText" htmlFor="emailText">
          Email <span style={{ color: "red" }}>*</span>
        </label>
        <input
          className="inputText"
          type="text"
          name="email"
          placeholder="Enter your email"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email ? (
          <div style={{ color: "red", marginRight: "auto", fontSize: "13px" }}>
            {formik.errors.email}
          </div>
        ) : null}

        <label className="labelText" htmlFor="passwordText">
          Password <span style={{ color: "red" }}>*</span>
        </label>
        <div className="password_container">
          <input
            className="password_class"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            {...formik.getFieldProps("password")}
          />
          <button
            className={showPassword ? "hide_button" : "show_button"}
            onClick={changeShowPassword}
          ></button>
        </div>
        {formik.touched.password && formik.errors.password ? (
          <div style={{ color: "red", marginRight: "auto", fontSize: "13px" }}>
            {formik.errors.password}
          </div>
        ) : null}

        {loading ? (
          <div style={{ margin: "28.5px", padding: "10px" }}></div>
        ) : (
          <button
            className="loginSubmit_button"
            onClick={formik.handleSubmit}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        )}
        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
          <Link className="linkfp" to={"/register"}>
            Signup
          </Link>
          <Link className="linkfp" to={"/forgotpassword"}>
            Forgot Password
          </Link>
        </div>
      </form>
    </div>
  );
};
