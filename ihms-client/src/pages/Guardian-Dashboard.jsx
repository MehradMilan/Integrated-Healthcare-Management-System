import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import axios from "axios";
import { fetchWithAuth } from '../lib/authfetch';
import Logout from '../lib/logout';
import { useNavigate } from 'react-router-dom';
import GuardianCalendar from '../components/GuardianCalendar';
import GuardianMap from '../components/GuardianMap';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const GuardianDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState({ phone_number: false, charity_org_name: false, address: false });
  const [user, setUser] = useState({
    user: {
      first_name: '',
      last_name: '',
      national_id: '',
      birth_date: '',
      gender: '',
    },
    password: '',
    city: '',
    phone_number: '',
    charity_org_name: '',
    national_id_card_image: '',
    is_active: false,
    address: '',
    latitude: undefined,
    longitude: undefined  
  });
  const [child, setChild] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    birth_date: '',
    gender: '',
    city: '',
    profile_picture: '',
  });
  const [children, setChildren] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // State for selected doctor
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState('');

  const fieldMap = { phone_number: 'شماره‌ی تماس', charity_org_name: 'موسسه‌ی خیریه', address: 'آدرس' };
  const childFieldMap = { first_name: 'نام', last_name: 'نام خانوادگی', national_id: 'کد ملی', birth_date: 'تاریخ تولد', gender: 'جنسیت', city: 'شهر', profile_picture: 'عکس پروفایل' };

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleInputChange = (event, field, type = 'user') => {
    if (type === 'user') {
      setUser({ ...user, [field]: event.target.value });
    } else if (type === 'child') {
      setChild({ ...child, [field]: event.target.value });
    }
  };

  const handleSaveClick = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    updateUserDetails(field);
  };

  const handleLogout = async () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/logout/', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        console.log('logout successful:', data);
        navigate('/login/');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const setUserDetails = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_user_info/', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setUser(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const fetchChildren = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_guardians_patients/', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setChildren(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const fetchDoctors = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_all_doctors/', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setDoctors(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const updateUserDetails = (field) => {
    const updatedField = { [field]: user[field] };
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/update_guardian/', {
      method: 'PATCH',
      body: JSON.stringify(updatedField),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Update successful:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const createChild = async () => {
    if (loading) return;
    if (file === "") {
      toast.error("لطفا تصویر پروفایل را آپلود کنید");
      return;
    }

    const { first_name, last_name, national_id, city, birth_date, gender } = child;
    if (!first_name || !last_name || !national_id || !city || !birth_date || !gender) {
      toast.error("لطفا همه فیلدهای الزامی را پر کنید");
      return;
    }

    const convertedBirthdate = new Date(birth_date.toDate()).toISOString().split("T")[0];

    const childData = {
      first_name,
      last_name,
      national_id,
      birth_date: convertedBirthdate,
      gender: gender === "آقا" ? "M" : "F",
      city,
      profile_picture: file,
    };

    try {
      await toast.promise(
        fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/patients/', {
          method: 'POST',
          body: JSON.stringify({...childData, medical_file: {}}),
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        {
          pending: "در حال ایجاد بیمار...",
          success: "بیمار با موفقیت ایجاد شد",
          error: "خطا در ایجاد بیمار",
        }
      );
      setChild({
        first_name: '',
        last_name: '',
        national_id: '',
        birth_date: '',
        gender: '',
        city: '',
        profile_picture: ''
      });
      setFile('');
      fetchChildren(); // Refresh children list after adding a new child
    } catch (error) {
      console.error('Error:', error);
    }
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

  useEffect(() => {
    setUserDetails();
    fetchChildren();
    fetchDoctors();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#dashboard">داشبورد</a></li>
          <li><a href="#add-child">اضافه کردن بیمار</a></li>
          <li><a href="#supported-children">فرزندان تحت حمایت</a></li>
          <li><a href="#doctors">دکترهای در دسترس</a></li>
          <li><a href="#reserve-visit">رزرو ویزیت</a></li>
          <li><a href="#location">موقعیت شما روی نقشه</a></li>
          <li><a href="#" onClick={handleLogout}>خروج</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 id="dashboard">داشبورد سرپرست</h1>
        </div>
        <div className="profile-section">
          <h2>پروفایل {user.user.gender === 'M' ? "آقای" : "خانوم"} {user.user.first_name} {user.user.last_name}</h2>
          <div className="profile-details">
            <div className="profile-info">
              {['phone_number', 'charity_org_name', 'address'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{fieldMap[field] + ":"}</label>
                  {isEditing[field] ? (
                    <input 
                      type="text" 
                      value={user[field]} 
                      onChange={(e) => handleInputChange(e, field)} 
                    />
                  ) : (
                    <p>{user[field]}</p>
                  )}
                  <button onClick={() => isEditing[field] ? handleSaveClick(field) : handleEditClick(field)}>
                    {isEditing[field] ? 'ذخیره' : 'ویرایش'}
                  </button>
                </div>
              ))}
            </div>
            <div className="profile-picture-container">
              <img className="profile-picture" src={user.national_id_card_image || "https://via.placeholder.com/150"} alt="profile" />
              <p></p>
              <button>ویرایش عکس</button>
            </div>
          </div>
          <h2 id="add-child">اضافه کردن بیمار</h2>
          <div className="map-section">
          <div className="child-form">
            <div className='form-row'>
            <div className="form-group">
              <label>نام:</label>
              <input 
                type="text" 
                value={child.first_name} 
                onChange={(e) => handleInputChange(e, 'first_name', 'child')} 
                required
              />
            </div>
            <div className="form-group">
              <label>نام خانوادگی:</label>
              <input 
                type="text" 
                value={child.last_name} 
                onChange={(e) => handleInputChange(e, 'last_name', 'child')} 
                required
              />
            </div>
            </div>
            <div className='form-row'>
            <div className="form-group">
              <label>کد ملی:</label>
              <input 
                type="text" 
                value={child.national_id} 
                onChange={(e) => handleInputChange(e, 'national_id', 'child')} 
                required
              />
            </div>
            <div className="form-group">
              <label>شهر:</label>
              <select 
                value={child.city} 
                onChange={(e) => handleInputChange(e, 'city', 'child')}
                required
              >
                <option value="">انتخاب کنید</option>
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
              <label>جنسیت:</label>
              <select 
                value={child.gender} 
                onChange={(e) => handleInputChange(e, 'gender', 'child')}
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="آقا">آقا</option>
                <option value="خانم">خانم</option>
              </select>
            </div>
            </div>
            <div className='form-row'>
            <div className="form-group">
              <label>تاریخ تولد:</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={child.birth_date}
                onChange={(date) => setChild({ ...child, birth_date: date })}
                format="YYYY/MM/DD"
                className="form-input"
                placeholder="تاریخ تولد"
                required
              />
            </div>
            <div className="form-group">
              <label>عکس:</label>
              <input 
                type="file" 
                onChange={(e) => onUpload(e.target.files[0])}
                required
              />
              {loading && <p>در حال بارگذاری...</p>}
              {file && <img src={file} alt="profile" className="uploaded-image" />}
            </div>
            </div>
            <button type="button" className="submit-button" onClick={createChild}>ایجاد بیمار</button>
          </div>
          </div>
          <h2 id="supported-children">فرزندان تحت حمایت</h2>
          <div className="map-section">
          <div className="children-container">
            {children.map((child, index) => (
              <div className="child-card" key={index}>
                <img src={child.profile_picture || "https://via.placeholder.com/150"} alt="child-profile" className="child-picture" />
                <p>{child.first_name} {child.last_name}</p>
                <p>{child.city}</p>
              </div>
            ))}
          </div>
          </div>
          <h2 id="doctors-list">دکترهای در دسترس</h2>
          <div id="doctors" className="map-section">
          <div className="doctors-container">
            {doctors.map((doctor, index) => (
              <div 
                className="doctor-card" 
                key={index} 
                onClick={() => setSelectedDoctor(doctor.user.national_id)} // Set selected doctor on click
              >
                <img src={doctor.practice_licence_image || "https://via.placeholder.com/150"} alt="doctor-profile" className="doctor-picture" />
                <p>{doctor.user.first_name} {doctor.user.last_name}</p>
                <p>{doctor.city}</p>
                <p>{doctor.specialty}</p>
              </div>
            ))}
          </div>
          </div>
          <h2 id="reserve-visit">رزرو ویزیت</h2>
          {selectedDoctor ? (
            <GuardianCalendar doctorId={selectedDoctor} />
          ) : (
            <p>لطفا یک دکتر را انتخاب کنید</p>
          )}
          <h2 id="location">موقعیت شما روی نقشه</h2>
          <GuardianMap />
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
