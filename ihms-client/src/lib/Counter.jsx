import React from 'react';
import CountUp from 'react-countup';
import '../styles/counter.css';

const Counter = ({ label, value, color }) => {
  return (
    <div className="counter-container">
      <div className="counter-ring" style={{ borderColor: color }}>
        <CountUp className="counter-value" end={value} duration={2} />
      </div>
      <div className="counter-label">{label}</div>
    </div>
  );
};

export default Counter;
