import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { fetchWithAuth } from '../lib/authfetch';

const GuardianMap = () => {
  const [guardianCoordinates, setGuardianCoordinates] = useState({ latitude: 32.4279, longitude: 53.6880 });
  const [doctorCoordinates, setDoctorCoordinates] = useState([]);

//   useEffect(() => {
//     // Fetch and place the base marker
//     fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_guardian_coordinates/')
//       .then(response => {
//         setGuardianCoordinates(response.data);
//       })
//       .catch(console.error);

//     // Fetch and place doctor markers
//     fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_doctors_coordinates/')
//       .then(response => {
//         setDoctorCoordinates(response.data);
//       })
//       .catch(console.error);
//   }, []);

  return (
    <MapContainer center={[32.4279, 53.6880]} zoom={5.5} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <CircleMarker
        center={[guardianCoordinates.latitude, guardianCoordinates.longitude]}
        pathOptions={{ color: 'red' }}
        radius={10}
      >
        <Popup>موقعیت شما</Popup>
      </CircleMarker>
      {doctorCoordinates.map((location, index) => (
        <CircleMarker
          key={index}
          center={[location.latitude, location.longitude]}
          pathOptions={{ color: 'blue' }}
          radius={5}
        >
          <Popup>{`${location.user__first_name} ${location.user__last_name}`}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default GuardianMap;