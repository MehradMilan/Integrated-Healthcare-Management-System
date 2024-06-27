import React from 'react';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { fetchWithAuth } from '../lib/authfetch';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const pieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#">مشاهده‌ی نمودارها</a></li>
          <li><a href="#" onClick={handleLogout}>خروج</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>داشبورد مدیر</h1>
        </div>
        <div className="charts-container">
          <div className="chart-section">
            <h2>نمودار خطی</h2>
            <LineChart width={600} height={300} data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
          </div>
          <div className="chart-section">
            <h2>نمودار میله‌ای</h2>
            <BarChart width={600} height={300} data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
          </div>
          <div className="chart-section">
            <h2>نمودار دایره‌ای</h2>
            <PieChart width={400} height={400}>
              <Pie
                data={pieData}
                cx={200}
                cy={200}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
