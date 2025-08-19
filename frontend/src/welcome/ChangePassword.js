import React from "react";
import "../register/Register.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

export const ChangePassword = () => {
  const [showNew, setShowNew] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showConfirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const formik = useFormik({
    initialValues: {
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Valid email required")
        .required("Email is required"),
      oldPassword: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Password is required"),
      newPassword: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .min(5, "Must 5 characters or more")
        .required("Confirm Password is required")
        .oneOf([Yup.ref("newPassword")], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const { confirmPassword, ...userData } = values;
      try {
        const response = await axios.patch(
          "http://localhost:5000/users/change-password",
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.removeItem("token");
        navigate("/login", { state: { toast2: response.data.message } });
      } catch (error) {
        toast.error(error.response.data.error);
      } finally {
        setLoading(false);
      }
    },
  });

  const changeShowOld = (e) => {
    e.preventDefault();
    setShowOld((prev) => !prev);
  };

  const changeShowNew = (e) => {
    e.preventDefault();
    setShowNew((prev) => !prev);
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
        <h2 className="legendText">Change Password</h2>
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
              Old Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className="password_container">
              <input
                className="password_class"
                type={showOld ? "text" : "password"}
                name="oldPassword"
                placeholder="Enter Password"
                {...formik.getFieldProps("oldPassword")}
              />
              <button
                className={showOld ? "hide_button" : "show_button"}
                onClick={changeShowOld}
              ></button>
            </div>
            {formik.touched.oldPassword && formik.errors.oldPassword ? (
              <div className="input_error">{formik.errors.oldPassword}</div>
            ) : null}
          </div>

          <div className="inputText_field">
            <label className="labelText" htmlFor="passwordText">
              New Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className="password_container">
              <input
                className="password_class"
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder="Enter Password"
                {...formik.getFieldProps("newPassword")}
              />
              <button
                className={showNew ? "hide_button" : "show_button"}
                onClick={changeShowNew}
              ></button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <div className="input_error">{formik.errors.newPassword}</div>
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
          disabled={loading}
        >
          {loading ? "...Changing..." : "Change"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};
