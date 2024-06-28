import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';
import { getCookie } from '../lib/csrf';
import { fetchWithAuth } from '../lib/authfetch';

const GuardianCalendar = ({ doctorId }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState('');

  useEffect(() => {
    fetchChoices();
    updateCalendar();
  }, [weekOffset]);

  useEffect(() => {
    updateCalendar();
  }, [choices, selectedChoice]);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const fetchChoices = () => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_guardians_patients/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setChoices(data);
        if (data.length > 0) {
          setSelectedChoice(data[0].national_id);
        }
      })
      .catch(error => console.error('Error fetching choices:', error));
  };

  const updateCalendar = () => {
    const calendar = document.querySelector('.calendar');
    const weekHeader = document.getElementById('week-header');
    const currentDate = new Date(new Date().toISOString());
    currentDate.setDate(currentDate.getDate() + weekOffset * 7);

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 0);

    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const startOfWeekFormatted = startOfWeek.toLocaleDateString(undefined, options);
    const endOfWeekFormatted = endOfWeek.toLocaleDateString(undefined, options);

    weekHeader.textContent = `${startOfWeekFormatted} - ${endOfWeekFormatted}`;

    calendar.innerHTML = `
        <div class="header header-time"></div>
        <div class="header">یک‌شنبه</div>
        <div class="header">دوشنبه</div>
        <div class="header">سه‌شنبه</div>
        <div class="header">چهارشنبه</div>
        <div class="header">پنج‌شنبه</div>
        <div class="header">جمعه</div>
        <div class="header">شنبه</div>
    `;

    for (let hour = 0; hour < 24; hour++) {
      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = `${hour}:00`;
      calendar.appendChild(timeLabel);

      for (let day = 0; day < 7; day++) {
        const hourCell = document.createElement('div');
        hourCell.classList.add('hour-cell');
        calendar.appendChild(hourCell);
      }
    }

    fetchSchedule(startOfWeek, endOfWeek);
  };

  const fetchSchedule = (startOfWeek, endOfWeek) => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + `/get_doctors_schedule/?doctor_id=${doctorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setSchedule(data);
        updateSchedule(data, startOfWeek, endOfWeek);
      })
      .catch(error => console.error('Error fetching schedule:', error));
  };

  const updateSchedule = (data, start, end) => {
    const calendar = document.querySelector('.calendar');
    let timed_indices = [];

    data.forEach(schedule => {
      const time = new Date(schedule.time);

      if (time >= start && time <= end) {
        const dayIndex = (time.getDay() % 7) + 1;
        const hour = time.getHours();
        const cellIndex = (hour + 1) * 8 + dayIndex;
        timed_indices.push(cellIndex);
        const cell = calendar.children[cellIndex];
        cell.innerHTML = ''; // Clear any existing content
        if (schedule.patient === null) {
          const button = document.createElement('button');
          button.textContent = 'reserve';
          button.classList.add('reserve');
          button.addEventListener('click', () => handleReserve(schedule.id));
          cell.appendChild(button);
        } else {
          cell.textContent = 'full';
          cell.classList.add('full');
        }
      }
    });
  };

  const handleReserve = (id) => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/reserve_time/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        'Cookie': `sessionid=${getCookie('sessionid')}`
      },
      body: JSON.stringify({ doctor_time_id: id, patient_national_id: selectedChoice })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Time reserved:', data);
        updateCalendar();
      })
      .catch(error => console.error('Error reserving time:', error));
  };

  return (
    <div className="calendar-container">
      <div className="week-header">
        <button id="prev-week" onClick={() => setWeekOffset(weekOffset - 1)}>&lt;</button>
        <div id="week-header"></div>
        <button id="next-week" onClick={() => setWeekOffset(weekOffset + 1)}>&gt;</button>
      </div>
      <select id="choice-box" value={selectedChoice} onChange={(e) => setSelectedChoice(e.target.value)}>
        {choices.map(choice => (
          <option key={choice.national_id} value={choice.national_id}>
            {`${choice.first_name} ${choice.last_name} - ${choice.national_id}`}
          </option>
        ))}
      </select>
      <div className="calendar">
        <div className="header header-time"></div>
        <div className="header">Sunday</div>
        <div className="header">Monday</div>
        <div className="header">Tuesday</div>
        <div className="header">Wednesday</div>
        <div className="header">Thursday</div>
        <div className="header">Friday</div>
        <div className="header">Saturday</div>
      </div>
    </div>
  );
};

export default GuardianCalendar;
