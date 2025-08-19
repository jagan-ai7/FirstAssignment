import React from "react";
import "./Register.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setConfirm] = useState(false);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(3, "Must be more than 2 characters")
        .max(15, "Must be 15 character or less")
        .required("First Name is required"),
      lastName: Yup.string()
        .min(3, "Must be more than 2 characters")
        .max(15, "Must be 15 character or less")
        .required("Last Name is required"),
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Valid email required")
        .required("Email is required"),
      password: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (values, { setFieldError }) => {
      const { confirmPassword, ...userData } = values;
      try {
        const response = await axios.post(
          "http://localhost:5000/users/register",
          userData
        );
        console.log("response--", response.data.data);
        if (response?.status === 201) {
          navigate("/login");
        }
      } catch (error) {
        const serverError = error.response.data;
        if (error.status === 409) {
          setFieldError("email", serverError.error);
          console.log("Email already existed: ", serverError.error);
        } else {
          console.log("Error during submission : ", error);
        }
      }
    },
  });

  const changeShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const changeShowConfirm = (e) => {
    e.preventDefault();
    setConfirm((prev) => !prev);
  };

  return (
    <div className="main">
      <img
        style={{ position: "fixed", zIndex: "-1" }}
        src="/images/image.jpg"
        alt="image"
      />
      <form className="form_container">
        <h2 className="legendText">Register</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "space-evenly",
          }}
        >
          <div className="inputText_field">
            <label className="labelText" htmlFor="firstNameText">
              First Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="inputText"
              type="text"
              name="firstName"
              placeholder="Enter First Name"
              {...formik.getFieldProps("firstName")}
            />
            {formik.touched.firstName && formik.errors.firstName ? (
              <div className="input_error">{formik.errors.firstName}</div>
            ) : null}
          </div>
          <div className="inputText_field">
            <label className="labelText" htmlFor="lastNameText">
              Last Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="inputText"
              type="text"
              name="lastName"
              placeholder="Enter Last Name"
              {...formik.getFieldProps("lastName")}
            />
            {formik.touched.lastName && formik.errors.lastName ? (
              <div className="input_error">{formik.errors.lastName}</div>
            ) : null}
          </div>

          <div className="inputText_field">
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
              <div className="input_error">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="inputText_field">
            <label className="labelText" htmlFor="passwordText">
              Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className="password_container">
              <input
                className="password_class"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                {...formik.getFieldProps("password")}
              />
              <button
                className={showPassword ? "hide_button" : "show_button"}
                onClick={changeShowPassword}
              ></button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="input_error">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="inputText_field">
            <label className="labelText" htmlFor="confirmPasswordText">
              Confirm Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className="password_container">
              <input
                className="password_class"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                {...formik.getFieldProps("confirmPassword")}
              />
              <button
                className={showConfirm ? "hide_button" : "show_button"}
                onClick={changeShowConfirm}
              ></button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="input_error">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>
          <div className="inputText_field"></div>
        </div>
        <button
          className="submitButton"
          onClick={formik.handleSubmit}
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  );
};
