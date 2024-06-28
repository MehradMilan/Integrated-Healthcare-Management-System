import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { fetchWithAuth } from '../lib/authfetch';

const GuardianMap = () => {
  const [guardianCoordinates, setGuardianCoordinates] = useState({ latitude: 32.4279, longitude: 53.6880 });
  const [doctorCoordinates, setDoctorCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateGuardianCoordinates = (position) => {
    setGuardianCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    setLoading(false);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateGuardianCoordinates(position);
        },
        (error) => {
          console.error('Error getting guardian coordinates:', error);
          setLoading(false); // Set loading to false even if there is an error
        }
      );
    } else {
      setLoading(false); // Set loading to false if geolocation is not supported
    }
  };

  useEffect(() => {
    // Fetch guardian's initial coordinates
    fetchLocation();

    // Fetch and place doctor markers
    fetchWithAuth(import.meta.env.VITE_SERVER_DOMAIN + '/get_doctors_coordinates/')
      .then(response => {
        setDoctorCoordinates(response.data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        console.error('Error fetching doctor coordinates:', error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MapContainer center={[guardianCoordinates.latitude, guardianCoordinates.longitude]} zoom={5.5} style={{ height: "500px", width: "100%" }}>
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
