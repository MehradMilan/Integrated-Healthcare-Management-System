import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { fetchWithAuth } from '../lib/authfetch';
import * as regression from 'regression';
import Counter from '../lib/Counter';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [specializationData, setSpecializationData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [regressionLine, setRegressionLine] = useState([]);
  const [counters, setCounters] = useState({ patients: 0, doctors: 0, guardians: 0 });

  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/DoctorsData−new.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data;
            const specializationCounts = {};
            const cityCounts = {};
            const yearCounts = {};

            data.forEach(doctor => {
              specializationCounts[doctor.Specialization] = (specializationCounts[doctor.Specialization] || 0) + 1;
              cityCounts[doctor.City] = (cityCounts[doctor.City] || 0) + 1;
              yearCounts[doctor['Start Year']] = (yearCounts[doctor['Start Year']] || 0) + 1;
            });

            setSpecializationData(Object.keys(specializationCounts).map(key => ({ name: key, value: specializationCounts[key] })));
            setCityData(Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]).map(key => ({ name: key, value: cityCounts[key] })));
            setPieData(Object.keys(specializationCounts).map(key => ({ name: key, value: specializationCounts[key] })));
            const yearData = Object.keys(yearCounts).map(key => ({ name: key, value: yearCounts[key] }));
            setYearData(yearData);

            // Calculate the regression line
            const regressionData = yearData.map((d, i) => [i, d.value]);
            const result = regression.linear(regressionData);
            const regressionLineData = yearData.map((d, i) => ({ name: d.name, value: result.predict(i)[1] }));
            setRegressionLine(regressionLineData);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching the data:', error);
      });

    fetch('/counter.json')
    .then(response => response.json())
    .then(data => setCounters(data))
    .catch(error => {
      console.error('Error fetching the counter data:', error);
    });
  }, []);

  

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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <ul>
          <li><a href="#statistics">مشاهده‌ی آمار</a></li>
          <li><a href="#doctors-charts"> نمودارهای دکترها</a></li>
          <li><a href="#patients-charts"> نمودارهای بیماران</a></li>
          <li><a href="#" onClick={handleLogout}>خروج</a></li>
        </ul>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>داشبورد مدیر</h1>
        </div>
        <div className="charts-container">
        <h2 id="statistics">مشاهده‌ی آمار</h2>
        <hr className="separator" />
        <div className="chart-section">
        <h3>تعداد اعضای پیوسته به طرح تاکنون</h3>
          <div className="counters-row">
              <Counter label="بیماران" value={counters.patients} color="#8884d8" />
              <Counter label="دکترها" value={counters.doctors} color="#82ca9d" />
              <Counter label="سرپرستان" value={counters.guardians} color="#ffc658" />
          </div>
        </div>
        <h2 id="doctors-charts">نمودارهای دکترها</h2>
        <hr className="separator" />
          <div className="chart-section">
            <h3>نمودار تعداد دکترها بر اساس سال شروع</h3>
            <BarChart width={800} height={400} data={yearData}
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tick={{ dx: -20 }} /> {/* Moves Y-axis labels to the left */}
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="   تعداد دکتر"/>
              <Line type="monotone" dataKey="value" data={regressionLine} stroke="#ff0000" dot={false} />
            </BarChart>
          </div>
          <div className="chart-section">
            <h3>نمودار تعداد دکترها بر اساس سال شروع</h3>
            <ResponsiveContainer width={800} height={500}>
              <LineChart data={yearData}
                margin={{ top: 90, right: 30, left: 50, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tick={{ dx: -20 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={{ r: 4 }} name="تعداد دکتر"/>
                <Line type="monotone" dataKey="value" data={regressionLine} stroke="#ff0000" dot={false} name="مورد انتظار"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-section">
            <h3>نمودار دایره‌ای تخصص‌ دکترها</h3>
            <PieChart width={500} height={500}>
              <Pie
                data={pieData}
                cx={250}
                cy={250}
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={200}
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
          <div className="chart-section">
            <h3>نمودار میله‌ای تعداد دکترها در هر شهر (مرتب‌شده)</h3>
            <BarChart width={800} height={400} data={cityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tick={{ dx: -20 }}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="   تعداد دکتر"/>
            </BarChart>
          </div>
          <h2 id="patients-charts">نمودارهای بیماران</h2>
        <hr className="separator" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
