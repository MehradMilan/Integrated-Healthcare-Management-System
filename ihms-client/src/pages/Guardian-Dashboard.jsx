import React, { useState, useEffect, useRef } from 'react';
import '../styles/dashboard.css';
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { getCookie } from '../lib/csrf';
import { fetchWithAuth } from '../lib/authfetch';
import Logout from '../lib/logout';

axios.defaults.withCredentials = true;

const GuardianDashboard = () => {
  const [isEditing, setIsEditing] = useState({ phone_number: false, charity_org_name: false, address: false });
  const [user, setUser] = useState({
    user: {
      first_name: '',
      last_name: '',
      national_id: '',
      birthdate: '',
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
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [child, setChild] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    birthdate: '',
    gender: '',
    city: '',
    profile_image: ''
  });

  const fieldMap = {phone_number: 'شماره‌ی تماس', charity_org_name: 'موسسه‌ی خیریه', address: 'آدرس'}
  const childFieldMap = {first_name: 'نام', last_name: 'نام خانوادگی', national_id: 'کد ملی', birthdate: 'تاریخ تولد', gender: 'جنسیت', city: 'شهر', profile_image: 'عکس پروفایل'}

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
        navigate('/login/')
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

  const createChild = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/create_child/', {
      method: 'POST',
      body: JSON.stringify(child),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Child created successfully:', data);
      // Reset child form
      setChild({
        first_name: '',
        last_name: '',
        national_id: '',
        birthdate: '',
        gender: '',
        city: '',
        profile_image: ''
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createChild();
  };

  useEffect(() => {
    setUserDetails();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#dashboard">داشبورد</a></li>
          <li><a href="#add-child">اضافه کردن بیمار</a></li>
          <li><a href="#supported-children">فرزندان تحت حمایت</a></li>
          <li><a href="#reserve-visit">رزرو ویزیت</a></li>
          <li><a href="#" onClick={handleLogout}>خروج</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 id="dashboard">داشبورد سرپرستان</h1>
        </div>
        <div className="profile-section">
          <h2>پروفایل {user["gender"] === 'M' ? "آقای": "خانوم"} {user["user"] != undefined ? user["user"]["first_name"] + " " 
          + user["user"]["last_name"]: "رئیس"}</h2>
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
          <form onSubmit={handleSubmit}>
            {Object.keys(childFieldMap).map((field) => (
              <div className="form-group" key={field}>
                <label>{childFieldMap[field]}:</label>
                <input
                  type="text"
                  value={child[field]}
                  onChange={(e) => handleInputChange(e, field, 'child')}
                />
              </div>
            ))}
            <button type="submit">ایجاد بیمار</button>
          </form>
          <h2 id="supported-children">فرزندان تحت حمایت</h2>
          <div className="map-section">
            <button>ویرایش نقشه</button>
            {/* Add map component here */}
          </div>
          <h2 id="reserve-visit">رزرو ویزیت</h2>
          <div className="map-section">
            <button>ویرایش نقشه</button>
            {/* Add map component here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
