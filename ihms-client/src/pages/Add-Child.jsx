import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AddChild = () => {
  const [childDetails, setChildDetails] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    birth_date: '',
    gender: 'M',
    city: '',
    profile_picture: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChildDetails({
      ...childDetails,
      [name]: value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);

      try {
        const response = await axios.post(import.meta.env.VITE_CLOUDINARY_BASE_URL, formData);
        const imageUrl = response.data.secure_url;
        setChildDetails({ ...childDetails, profile_picture: imageUrl });
        toast.success("تصویر با موفقیت بارگذاری شد");
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('خطا در بارگذاری تصویر');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/add_child`, childDetails);
      toast.success('Child added successfully');
      setChildDetails({
        first_name: '',
        last_name: '',
        national_id: '',
        birth_date: '',
        gender: 'M',
        city: '',
        profile_picture: '',
      });
    } catch (error) {
      console.error('Error adding child:', error);
      toast.error('Error adding child');
    }
  };

  return (
    <div className="add-child-container">
      <Toaster />
      <h2>اضافه کردن بیمار</h2>
      <form onSubmit={handleSubmit} className="add-child-form">
        <div className="form-group">
          <label>نام:</label>
          <input
            type="text"
            name="first_name"
            value={childDetails.first_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>نام خانوادگی:</label>
          <input
            type="text"
            name="last_name"
            value={childDetails.last_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>کد ملی:</label>
          <input
            type="text"
            name="national_id"
            value={childDetails.national_id}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>تاریخ تولد:</label>
          <input
            type="date"
            name="birth_date"
            value={childDetails.birth_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>جنسیت:</label>
          <select
            name="gender"
            value={childDetails.gender}
            onChange={handleInputChange}
            required
          >
            <option value="M">مرد</option>
            <option value="F">زن</option>
          </select>
        </div>
        <div className="form-group">
          <label>شهر:</label>
          <input
            type="text"
            name="city"
            value={childDetails.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>عکس:</label>
          <input type="file" onChange={handleFileChange} />
          {childDetails.profile_picture && (
            <img src={childDetails.profile_picture} alt="Profile" className="uploaded-image" />
          )}
        </div>
        <button type="submit" className="btn">اضافه کردن</button>
      </form>
    </div>
  );
};

export default AddChild;