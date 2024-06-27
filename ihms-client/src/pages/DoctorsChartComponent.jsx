import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';

const csvFile = "../assets/DoctorsData.csv"

const DoctorsChartComponent = ({ csvFile }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    Papa.parse(csvFile, {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data;
        const cityCounts = data.reduce((acc, curr) => {
          const city = curr.City;
          acc[city] = acc[city] ? acc[city] + 1 : 1;
          return acc;
        }, {});

        const chartLabels = Object.keys(cityCounts);
        const chartValues = Object.values(cityCounts);

        setChartData({
          labels: chartLabels,
          datasets: [{
            label: 'Number of Doctors',
            data: chartValues,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }]
        });
      }
    });
  }, [csvFile]);

  return (
    <div>
      <h2>Number of Doctors per Cities</h2>
      <Bar 
        data={chartData}
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: 'Cities'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Number of Doctors'
              },
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

export default DoctorsChartComponent;