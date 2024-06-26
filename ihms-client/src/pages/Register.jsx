import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_DOMAIN;

function Register() {
  const [userType, setUserType] = useState("doctor");
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    medicalCode: "",
    nationalCode: "",
    specialization: "عمومی",
    city: "",
    charityName: "",
    password: "",
    birthdate: "",
    gender: "آقا",
    specialty: "ارتودنسی"
  });
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const onUpload = async (element) => {
    setLoading(true);
    if (element.type === "image/jpeg" || element.type === "image/png") {
      const data = new FormData();
      data.append("file", element);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
      data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      data.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);

      fetch(import.meta.env.VITE_CLOUDINARY_BASE_URL, {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error.message);
          }
          setFile(data.secure_url);
          toast.success("تصویر با موفقیت بارگذاری شد");
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          toast.error("خطا در بارگذاری تصویر");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      toast.error("لطفا یک تصویر با فرمت jpeg یا png انتخاب کنید");
    }
  };

  const removeImage = () => {
    setFile("");
    toast("تصویر حذف شد", { icon: '❌' });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (file === "") {
      toast.error("لطفا تصویر پروانه پزشکی یا کارت ملی را آپلود کنید");
      return;
    }

    const { firstname, lastname, medicalCode, nationalCode, city, charityName, password, birthdate, gender, specialty } = formDetails;
    if (userType === "doctor" && (!firstname || !lastname || !medicalCode || !nationalCode || !city || !password || !birthdate || !gender || !specialty)) {
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }
    if (userType === "supervisor" && (!firstname || !lastname || !nationalCode || !city || !charityName || !password || !birthdate || !gender)) {
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }

    // Convert birthdate from Shamsi to Gregorian
    const convertedBirthdate = new Date(birthdate).toISOString().split("T")[0];

    const userData = {
      user: {
        national_id: nationalCode,
        birthdate: convertedBirthdate,
        password,
        gender: gender === "آقا" ? "M" : "F",
      },
      specialty: userType === "doctor" ? specialty : "",
      city,
      medical_system_code: userType === "doctor" ? medicalCode : "",
      practice_licence_image: file,
    };

    try {
      console.log(userData);
      await toast.promise(
        axios.post("/doctors/", userData),
        {
          pending: "در حال ثبت نام...",
          success: "کاربر با موفقیت ثبت نام شد",
          error: "خطا در ثبت نام کاربر",
        }
      );
      navigate("/login");
    } catch (error) {
      toast.error("خطایی رخ داده است");
    }
  };

  return (
    <div className="container">
      <Toaster />
      <h1 className="main-title">طرح پزشکان شریف</h1>
      <section className="register-section flex-center">
        <div className="register-container">
          <h2 className="form-heading">ثبت‌نام</h2>
          <form onSubmit={formSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label>نوع کاربر: <span className="required">*</span></label>
                <select
                  name="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="form-choice"
                >
                  <option value="doctor">دکتر</option>
                  <option value="supervisor">سرپرست</option>
                </select>
              </div>
            </div>
            <hr className="separator" />
            <div className="form-row">
              <div className="form-group">
                <label>نام <span className="required">*</span></label>
                <input
                  type="text"
                  name="firstname"
                  className="form-input"
                  placeholder="نام"
                  value={formDetails.firstname}
                  onChange={inputChange}
                />
              </div>
              <div className="form-group">
                <label>نام خانوادگی <span className="required">*</span></label>
                <input
                  type="text"
                  name="lastname"
                  className="form-input"
                  placeholder="نام خانوادگی"
                  value={formDetails.lastname}
                  onChange={inputChange}
                />
              </div>
            </div>
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
              {userType === "doctor" && (
                <div className="form-group">
                  <label>کد نظام پزشکی <span className="required">*</span></label>
                  <input
                    type="text"
                    name="medicalCode"
                    className="form-input"
                    placeholder="کد نظام پزشکی"
                    value={formDetails.medicalCode}
                    onChange={inputChange}
                  />
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>شهر <span className="required">*</span></label>
                <select
                  name="city"
                  value={formDetails.city}
                  onChange={inputChange}
                  className="form-choice"
                >
                  <option value="تهران">تهران</option>
                  <option value="خرم‌آباد">خرم‌آباد</option>
                  <option value="لاهیجان">لاهیجان</option>
                  <option value="آمل">آمل</option>
                  <option value="اردبیل">اردبیل</option>
                  <option value="شیراز">شیراز</option>
                  <option value="اراک">اراک</option>
                  <option value="کرج">کرج</option>
                  <option value="اصفهان">اصفهان</option>
                  <option value="نظرآباد">نظرآباد</option>
                </select>
              </div>
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
                <label>تاریخ تولد <span className="required">*</span></label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={formDetails.birthdate}
                  onChange={(date) => setFormDetails({ ...formDetails, birthdate: date })}
                  format="YYYY/MM/DD"
                  className="form-input"
                  placeholder="تاریخ تولد"
                />
              </div>
              <div className="form-group">
                <label>جنسیت <span className="required">*</span></label>
                <select
                  name="gender"
                  value={formDetails.gender}
                  onChange={inputChange}
                  className="form-choice"
                >
                  <option value="آقا">آقا</option>
                  <option value="خانم">خانم</option>
                </select>
              </div>
            </div>
            {userType === "doctor" && (
              <div className="form-row">
                <div className="form-group">
                  <label>تخصص <span className="required">*</span></label>
                  <select
                    name="specialty"
                    value={formDetails.specialty}
                    onChange={inputChange}
                    className="form-choice"
                  >
                    <option value="ارتودنسی">ارتودنسی</option>
                    <option value="پریودنتولوژی">پریودنتولوژی</option>
                    <option value="دندانپزشکی کودکان">دندانپزشکی کودکان</option>
                    <option value="اندودنتیکس">اندودنتیکس</option>
                    <option value="پروتزهای دندانی">پروتزهای دندانی</option>
                    <option value="جراحی دهان، فک و صورت">جراحی دهان، فک و صورت</option>
                    <option value="پروتزهای دندانی ثابت و متحرک">پروتزهای دندانی ثابت و متحرک</option>
                    <option value="رادیولوژی دهان و دندان">رادیولوژی دهان و دندان</option>
                    <option value="دندانپزشکی ترمیمی">دندانپزشکی ترمیمی</option>
                    <option value="دندانپزشکی زیبایی">دندانپزشکی زیبایی</option>
                  </select>
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>تصویر پروانه پزشکی یا کارت ملی <span className="required">*</span></label>
                <input
                  type="file"
                  onChange={(e) => onUpload(e.target.files[0])}
                  className="form-input"
                />
                {file && (
                  <div className="uploaded-image">
                    <img src={file} alt="Uploaded" className="thumbnail" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <button
                  type="submit"
                  className="btn form-btn"
                  disabled={loading}
                >
                  ثبت نام
                </button>
              </div>
            </div>
          </form>
          <p className="note">
            بخش‌هایی که با <span className="required">*</span> مشخص شده‌اند الزامی هستند.
          </p>
          <p className="login-prompt">
            آیا قبلا ثبت‌نام کرده‌اید؟{" "}
            <a className="login-link" href="/login">
              وارد شوید
            </a>
          </p>
        </div>
      </section>
      <footer className="footer">
        <p>تمامی حقوق محفوظ است © 2024</p>
      </footer>
    </div>
  );
}

export default Register;
