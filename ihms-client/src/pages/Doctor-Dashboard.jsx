import React, { useState, useEffect, useRef } from 'react';
import '../styles/dashboard.css';
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { getCookie } from '../lib/csrf';
import { fetchWithAuth } from '../lib/authfetch';
import Logout from '../lib/logout';

axios.defaults.withCredentials = true;

const DoctorDashboard = () => {
  const [isEditing, setIsEditing] = useState({ phone_number: false, charity_org_name: false, address: false, medical_system_code: false});
  const [user, setUser] = useState({
    user: {
      first_name: '',
      last_name: '',
      national_id: '',
      birthdate: '',
      gender: '',
      password: '',
    },
    city: '',
    phone_number: '',
    medical_system_code: '',
    practice_licence_image: '',
    is_active: false,
    address: '',
    latitude: undefined,
    longitude: undefined  
  });
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const fieldMap = {phone_number: 'شماره‌ی تماس', charity_org_name: 'موسسه‌ی خیریه', address: 'آدرس', medical_system_code: 'کد نظام پزشکی'}

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleInputChange = (event, field, type = 'user') => {
    if (type === 'user') {
      setUser({ ...user, [field]: event.target.value });
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
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/update_doctor/', {
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

  useEffect(() => {
    setUserDetails();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#dashboard">داشبورد</a></li>
          <li><a href="#visit-time">تعیین زمان‌های ویزیت</a></li>
          <li><a href="#reserved-times">زمان‌های رزرو شده</a></li>
          <li><a href="#" onClick={handleLogout}>خروج</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 id="dashboard">داشبورد دکتر</h1>
        </div>
        <div className="profile-section">
          <h2>پروفایل {user["gender"] === 'M' ? "آقای": "خانوم"} {user["user"] != undefined ? user["user"]["first_name"] + " " 
          + user["user"]["last_name"]: "رئیس"}</h2>
          <div className="profile-details">
            <div className="profile-info">
                <div className="profile-info">
                {['medical_system_code'].map((field) => (
                    <div className="form-group" key={field}>
                    <label>{fieldMap[field] + ":"}</label>
                    {isEditing[field] ? (
                        <input 
                        type="text" 
                        value={user[field]} 
                        />
                    ) : (
                        <p>{user[field]}</p>
                    )}
                    </div>
                ))}
                </div>
              {['phone_number', 'address'].map((field) => (
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
              <img className="profile-picture" src={user.practice_licence_image || "https://via.placeholder.com/150"} alt="profile" />
              <p></p>
              <button>ویرایش عکس</button>
            </div>
          </div>
          <h2 id="visit-time">تعیین زمان‌های ویزیت</h2>
          <div className="map-section">
          </div>
          <h2 id="reserved-times">زمان‌های رزرو شده</h2>
          <div className="map-section">
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
