import axios from "axios";
import '../register/Register.css';
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as Yup from "yup";

export const ResetPassword = () => {
    const { id, token } = useParams();
    const [validLink, setValidLink] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const validateLink = async () => {
            try {
                await axios.get(`http://localhost:5000/users/reset-password/${id}/${token}`);
                setValidLink(true);
            } catch (err) {
                setMessage('Invalid or expired link.');
            }
        };

        validateLink();
    }, [id, token]);

    const formik = useFormik({
        initialValues: {
            password: '',
        },
        validationSchema: Yup.object({
            password: Yup.string().min(5, "Must 5 characters or more").required('Password is required'),
            confirmPassword: Yup.string().min(5, "Must 5 characters or more").required('Confirm Password is required').oneOf([Yup.ref('password')], 'Passwords must match')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const res = await axios.post(`http://localhost:5000/users/reset-password/${id}/${token}`, values);
                navigate('/login', { state: { toast: res.data.message } });
                console.log('ResetData---------', res);
            } catch (error) {
                if (error.response) {
                    toast.error(`Failed : ${error.response.data.message}`);
                } else {
                    console.error('Unexpected error:', error.message);
                }
            } finally {
                setLoading(false);
            }
        }
    })

    const changeShowPassword = (e) => {
        e.preventDefault();
        setShowPassword(prev => !prev);
    }

    const changeShowConfirm = (e) => {
        e.preventDefault();
        setConfirm(prev => !prev);
    }

    return validLink ? (
        <div className="main">
            <img style={{ position: "fixed", zIndex: "-1" }} src="/images/image.jpg" alt="image" />
            <form className="forgotchangepassword_container">
                <h2 className="legendText" >Reset Password</h2>
                <label className="labelText" htmlFor="passwordText">Password <span style={{ color: "red" }}>*</span></label>
                <div className="password_container">
                    <input className="password_class" type={showPassword ? "type" : "password"} name="password" placeholder="Enter Password" {...formik.getFieldProps('password')} />
                    <button className={showPassword ? "hide_button" : "show_button"} onClick={changeShowPassword}></button>
                </div>
                {formik.touched.password && formik.errors.password ? <div className="input_error">{formik.errors.password}</div> : null}
                <label className="labelText" htmlFor="confirmPasswordText">Confirm Password <span style={{ color: "red" }}>*</span></label>
                <div className="password_container">
                    <input className="password_class" type={showConfirm ? "type" : "password"} name="confirmPassword" placeholder="Confirm your password" {...formik.getFieldProps('confirmPassword')} />
                    <button className={showConfirm ? "hide_button" : "show_button"} onClick={changeShowConfirm}></button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? <div className="input_error">{formik.errors.confirmPassword}</div> : null}

                {loading ? <div style={{ margin: '28.5px', padding: '10px' }}></div> : <button className="forgotchangepassword_button" onClick={formik.handleSubmit} type="submit" disabled={loading}>{loading ? "" : "Submit"}</button>}
            </form>
            <ToastContainer />
        </div>
    ) : (
        <p>{message || 'Validating reset link...'}</p>
    );
};