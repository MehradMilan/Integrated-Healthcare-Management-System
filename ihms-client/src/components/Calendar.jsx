import React, { useEffect, useState } from 'react';
import '../styles//Calendar.css';
import { getCookie } from '../lib/csrf';
import { fetchWithAuth } from '../lib/authfetch';

const Calendar = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    updateCalendar();
  }, [weekOffset]);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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
        <div class="header">یک‌‌شنیه</div>
        <div class="header">دوشنیه</div>
        <div class="header">سه‌شنبه</div>
        <div class="header">چهارشنبه</div>
        <div class="header">پنجشنبه</div>
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
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_doctors_schedule/', {
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
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
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
        if (schedule.patient === null) {
          cell.textContent = 'empty';
          cell.classList.add('empty-cell');
          cell.addEventListener('click', () => handleDelete(schedule.id));
        } else {
          cell.textContent = 'full';
        }
      }
    });

    for (let i = 0; i < calendar.children.length; i++) {
      const cell = calendar.children[i];
      if (timed_indices.includes(i) || cell.textContent !== "") {
        continue;
      }
      if (i !== 0) {
        const day = (i % 8) - 1;
        const hour = Math.floor(i / 8) - 1;
        const cellDate = new Date(start);
        cellDate.setDate(cellDate.getDate() + day);
        cellDate.setHours(hour);
        cellDate.setMinutes(0);
        cellDate.setSeconds(0);
        cellDate.setMilliseconds(0);
        const now = new Date();
        let limit = new Date();
        limit.setDate(now.getDate() + 14);
        if (cellDate >= now && cellDate <= limit) {
          const button = document.createElement('button');
          button.textContent = 'volunteer';
          button.classList.add('volunteer');
          button.addEventListener('click', () => handleVolunteer(cellDate));
          cell.appendChild(button);
        }
      }
    }
  };

  const handleDelete = (scheduleId) => {
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/delete_doctor_time/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        'Cookie': `sessionid=${getCookie('sessionid')}`
      },
      body: JSON.stringify({ id: scheduleId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        updateCalendar();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  };

  const handleVolunteer = (cellDate) => {
    const timeString = formatDateTime(cellDate);
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/add_doctor_time/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        'Cookie': `sessionid=${getCookie('sessionid')}`
      },
      body: JSON.stringify({ time: timeString })
    })
      .then(response => response.json())
      .then(data => {
        updateCalendar();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  };

  return (
    <div className="calendar-container">
      <div className="week-header">
        <button id="prev-week" onClick={() => setWeekOffset(weekOffset - 1)}>&lt;</button>
        <div id="week-header"></div>
        <button id="next-week" onClick={() => setWeekOffset(weekOffset + 1)}>&gt;</button>
      </div>
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

export default Calendar;
