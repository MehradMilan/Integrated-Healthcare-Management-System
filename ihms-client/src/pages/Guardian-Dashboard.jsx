import React, { useState } from 'react';
import '../styles/dashboard.css';
import GoogleMapReact from "google-map-react";
import axios from "axios";

axios.defaults.withCredentials = true;

const GuardianDashboard = () => {
  const [isEditing, setIsEditing] = useState({ name: false, charityName: false, address: false});
  const [profile, setProfile] = useState({ name: 'نام', charityName: 'موسسه‌ی خیریه', address: 'آدرس'});
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const fieldMap = { name: 'نام حامی', charityName: 'موسسه‌ی خیریه', address: 'آدرس'}

  const handleEditClick = (field) => {
    console.log(profile)
    console.log(field)
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleInputChange = (event, field) => {
    setProfile({ ...profile, [field]: event.target.value });
  };

  const handleSaveClick = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Add API call to save changes here
  };

  const fetchWithAuth = (url, options = {}) => {
    const csrfToken = localStorage.getItem('csrfToken');
    const headers = {
      ...options.headers,
      'X-CSRFToken': csrfToken,
      'Content-Type': 'application/json',
    };
  
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure cookies are sent with every request
    });
  };

  const setUserDetails = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_user_info/', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setProfile(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="dashboard-container" onLoad={setUserDetails}>
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#">داشبورد</a></li>
          <li><a href="#">اضافه کردن بیمار</a></li>
          <li><a href="#">فرزندان تحت حمایت</a></li>
          <li><a href="#">رزرو ویزیت</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>داشبورد سرپرستان</h1>
        </div>
        <div className="profile-section">
          <h2>پروفایل</h2>
          <div className="profile-details">
            <div className="profile-info">
              {['name', 'charityName', 'address'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{fieldMap[field] + ":"}</label>
                  {isEditing[field] ? (
                    <input 
                      type="text" 
                      value={profile[field]} 
                      onChange={(e) => handleInputChange(e, field)} 
                    />
                  ) : (
                    <p>{profile[field]}</p>
                  )}
                  <button onClick={() => isEditing[field] ? handleSaveClick(field) : handleEditClick(field)}>
                    {isEditing[field] ? 'ذخیره' : 'ویرایش'}
                  </button>
                </div>
              ))}
            </div>
            <div className="profile-picture-container">
              <img src="https://via.placeholder.com/150" alt="profile" />
              <p></p>
              <button>ویرایش عکس</button>
            </div>
          </div>
          <div className="map-section">
            <h3>موقعیت</h3>
            {/* <div className="google-map">
              <GoogleMapReact
                bootstrapURLKeys={{ key: "YOUR_API_KEY" }}
                defaultCenter={location}
                defaultZoom={17}>
                <LocationPin
                  lat={location.lat}
                  lng={location.lng}
                  text={location.address}
                />
              </GoogleMapReact>
            </div> */}
            <button>ویرایش نقشه</button>
            {/* Add map component here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
