import React, { useState, useEffect } from 'react';
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { fetchWithAuth } from '../lib/authfetch';
import Logout from '../lib/logout';
import Calendar from '../components/Calendar';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale'; // Import the correct locale from date-fns

axios.defaults.withCredentials = true;

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState({ phone_number: false, charity_org_name: false, address: false, medical_system_code: false });
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
  const [reservedTimes, setReservedTimes] = useState([]);

  const fieldMap = { phone_number: 'شماره‌ی تماس', charity_org_name: 'موسسه‌ی خیریه', address: 'آدرس', medical_system_code: 'کد نظام پزشکی' };

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

  const fetchReservedTimes = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_doctors_schedule/', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const currentDate = new Date();
        const reserved = data.filter(time => time.patient !== null).map(time => {
          const visitDate = new Date(time.time);
          return {
            id: time.id,
            time: format(visitDate, 'yyyy/MM/dd HH:mm', { locale: faIR }),
            patient: time.patient,
            status: visitDate > currentDate ? 'در انتظار' : 'گذشته'
          };
        });
        setReservedTimes(reserved);
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
    fetchReservedTimes();
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
          <h2>پروفایل {user["user"]["gender"] === 'M' ? "آقای" : "خانوم"} {user["user"] != undefined ? user["user"]["first_name"] + " " + user["user"]["last_name"] : "رئیس"}</h2>
          <div className="profile-details">
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
          <Calendar />
          <h2 id="reserved-times">زمان‌های رزرو شده</h2>
          <div className="reserved-times-container">
            {reservedTimes.map((time, index) => (
              <div className="reserved-time-card" key={index}>
                <p>کد: {time.id}</p>
                <p>زمان: {time.time}</p>
                <p>کد بیمار: {time.patient}</p>
                <p>وضعیت: {time.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
