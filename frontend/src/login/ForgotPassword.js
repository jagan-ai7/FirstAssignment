import axios from "axios";
import '../register/Register.css';
import { useFormik } from "formik";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import * as Yup from "yup";

export const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Valid email required').required('Email is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const res = await axios.post('http://localhost:5000/users/forgot-password', values);
                const { data } = res.data;
                console.log('resetUrl---------', data);
                toast.success(res.data.message);
            } catch (error) {
                if (error.response) {
                    toast.error(`Login failed : ${error.response.data.message}`);
                } else {
                    console.error('Unexpected error:', error.message);
                }
            } finally {
                setLoading(false);
            }
        }
    })
    return (
        <div className="main">
            <img style={{ position: "fixed", zIndex: "-1" }} src="/images/image.jpg" alt="image" />
            <form className="forgotchangepassword_container">
                <h2 className="legendText" >Forgot Password</h2>
                <label className="labelText" htmlFor="emailText">Email <span style={{ color: "red" }}>*</span></label>
                <input className="inputText" type="text" name="email" placeholder="Enter your email" {...formik.getFieldProps('email')} />
                {formik.touched.email && formik.errors.email ? <div style={{ color: 'red', marginRight: 'auto', fontSize: "13px" }}>{formik.errors.email}</div> : null}

                {loading ? <div style={{ margin: '28.5px', padding: '10px' }}></div> : <button className="forgotchangepassword_button" onClick={formik.handleSubmit} type="submit" disabled={loading}>{loading ? "" : "Submit"}</button>}              
            </form>
            <ToastContainer />
        </div>
    );
};