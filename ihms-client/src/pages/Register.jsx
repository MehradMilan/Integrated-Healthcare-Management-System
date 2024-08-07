import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { getCookie } from "../lib/csrf";

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
    city: "تهران",
    charityName: "",
    phoneNumber: "",
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

    const { firstname, lastname, medicalCode, nationalCode, city, charityName, phoneNumber, password, birthdate, gender, specialty } = formDetails;
    if (userType === "doctor" && (!firstname || !lastname || !medicalCode || !nationalCode || !city || !password || !birthdate || !gender || !specialty)) {
      console.log(formDetails)
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }
    if (userType === "guardian" && (!firstname || !lastname || !nationalCode || !city || !charityName || !password || !birthdate || !gender)) {
      console.log(formDetails)
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }

    const convertedBirthdate = new Date(birthdate).toISOString().split("T")[0];

    const userData = {
      user: {
        national_id: nationalCode,
        birthdate: convertedBirthdate,
        password,
        gender: gender === "آقا" ? "M" : "F",
        first_name: firstname,
        last_name: lastname,
      },
      city,
    };

    if (userType === "guardian") {
      userData.charity_org_name = charityName;
      userData.phone_number = phoneNumber;
      userData.national_id_card_image = file;
    }
    if (userType === "doctor") {
      userData.medical_system_code = medicalCode;
      userData.specialty = specialty;
      userData.practice_licence_image = file;
    }

    try {
      console.log(userData);
      var urlType = userType === "doctor" ? "/doctors/" : "/guardians/";
      await toast.promise(
        axios.post(urlType, userData, {
            headers: {
              'X-CSRFToken': getCookie('csrftoken'),
            }})
          ,
        {
          pending: "در حال ایجاد حساب کاربری...",
          success: "حساب کاربری با موفقیت ایجاد شد و پس از بررسی کارشناسان ما، تایید یا رد خواهد شد.",
          error: "خطا در ایجاد حساب کاربری",
        })
      navigate("/login");
    } catch (error) {
      console.log(error)
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
                  <option value="guardian">سرپرست</option>
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
              {userType === "guardian" && (
                <div className="form-group">
                <label>شماره‌ی تلفن همراه<span className="required">*</span></label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="مثلا: 09123456789"
                  value={formDetails.phoneNumber}
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
                <div className="form-group"></div>
              </div>
            )}
            {userType === "guardian" && (
              <div className="form-row">
                <div className="form-group">
                  <label>نام موسسه‌ی خیریه<span className="required">*</span></label>
                  <input
                    type="text"
                    name="charityName"
                    className="form-input"
                    placeholder="مثلا: خیریه‌ی محبان"
                    value={formDetails.charityName}
                    onChange={inputChange}
                  />
                </div>
                <div className="form-group"></div>
              </div>
            )}
            {userType === "doctor" && (
            <div className="form-row">
              <div className="form-group">
                <label>تصویر پروانه پزشکی <span className="required">*</span></label>
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
            )}
            {userType === "guardian" && (
            <div className="form-row">
              <div className="form-group">
                <label>تصویر کارت ملی <span className="required">*</span></label>
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
            )}
            <hr className="separator" />
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
