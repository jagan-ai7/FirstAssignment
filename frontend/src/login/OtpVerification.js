import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../register/Register.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const OtpVerification = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.number()
        .typeError("Must be a number")
        .required("Enter the OTP")
        .test(
          "len",
          "OTP must be exactly 6 digits",
          (val) => val && val.toString().length === 6
        ),
    }),
    onSubmit: async (value) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/users/verify-otp",
          value
        );
        const token = response.data.token;
        const id = response.data.user.id;
        localStorage.setItem("token", token);
        localStorage.setItem("id", id);
        console.log("User-----------", response);
        navigate(`/layout`);
      } catch (error) {
        if (error.response) {
          toast.error(`Login failed : ${error.response.data.error}`);
          localStorage.removeItem("token");
          // navigate('/login')
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    },
  });

  return (
    <>
      <div style={{ display: "flex" }}>
        <button className="back_login" onClick={(e) => navigate("/login")}>
          Back To Login
        </button>
      </div>
      <div className="main">
        <img
          style={{ position: "fixed", zIndex: "-1" }}
          src="/images/image1.jpg"
          alt="image"
        />
        <form className="loginForm_container">
          <h2 className="legendText">OTP VERIFICATION</h2>
          <input
            className="inputText"
            type="text"
            name="otp"
            placeholder="Enter your otp...."
            {...formik.getFieldProps("otp")}
          />{" "}
          <br />
          {formik.touched.otp && formik.errors.otp ? (
            <div
              style={{ color: "red", marginRight: "auto", fontSize: "13px" }}
            >
              {formik.errors.otp}
            </div>
          ) : null}{" "}
          <br />
          <button
            className="loginSubmit_button"
            type="submit"
            onClick={formik.handleSubmit}
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};
