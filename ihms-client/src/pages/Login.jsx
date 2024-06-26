import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import axios from "axios";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_DOMAIN;

function Login() {
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [formDetails, setFormDetails] = useState({
    nationalCode: "",
    password: ""
  });
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const handleCaptchaChange = (value) => {
    setCaptcha(value);
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!captcha) {
      toast.error("لطفا کپچا را تایید کنید");
      return;
    }

    const { nationalCode, password } = formDetails;
    if (!nationalCode || !password) {
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      await toast.promise(
        axios.post("/user/login", {
          nationalCode,
          password,
          captcha
        }),
        {
          pending: "در حال ورود...",
          success: "ورود با موفقیت انجام شد",
          error: "خطا در ورود",
        }
      );
      navigate("/dashboard");
    } catch (error) {
      toast.error("خطایی رخ داده است");
    }
  };

  return (
    <div className="container">
      <h1 className="main-title">طرح پزشکان شریف</h1>
      <section className="login-section flex-center">
        <div className="login-container">
          <h2 className="form-heading">ورود به حساب کاربری</h2>
          <form onSubmit={formSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label>کد ملی <span className="required">*</span></label>
                <input
                  type="text"
                  name="nationalCode"
                  className="form-input"
                  placeholder="کد ملی"
                  value={formDetails.nationalCode}
                  onChange={inputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>رمز عبور <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="رمز عبور"
                  value={formDetails.password}
                  onChange={inputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <ReCAPTCHA
                  sitekey="6LdCrgEqAAAAAEQ108jp5Tr-2ntlq3Xr1d1yy9lH"
                  onChange={handleCaptchaChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <button
                  type="submit"
                  className="btn form-btn"
                  disabled={loading}
                >
                  ورود
                </button>
              </div>
            </div>
          </form>
          <p className="login-options">
            <a className="forgot-password-link" href="/forgot-password">
              رمز عبورم را فراموش کرده‌ام
            </a>
            <br />
            <a className="signup-link" href="/register">
              هنوز حساب کاربری نساخته‌اید؟
            </a>
          </p>
        </div>
      </section>
      <footer className="footer">
        <p>تمامی حقوق محفوظ است © 2024</p>
        <p>جانم فدای دکتر نظریانی</p>
      </footer>
    </div>
  );
}

export default Login;