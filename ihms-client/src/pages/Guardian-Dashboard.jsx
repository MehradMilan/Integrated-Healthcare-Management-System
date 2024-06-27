import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { getCookie } from '../lib/csrf';
import { fetchWithAuth } from '../lib/authfetch';

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
  const fieldMap = {phone_number: 'شماره‌ی تماس', charity_org_name: 'موسسه‌ی خیریه', address: 'آدرس'}

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleInputChange = (event, field) => {
    setUser({ ...user, [field]: event.target.value });
  };

  const handleSaveClick = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    updateUserDetails(field);
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

  useEffect(() => {
    setUserDetails();
  }, []);

  return (
    <div className="dashboard-container">
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
              <img src={user.national_id_card_image || "https://via.placeholder.com/150"} alt="profile" />
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
