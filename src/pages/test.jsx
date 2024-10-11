import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from "react-webcam";

const backendUrl = process.env.REACT_APP_BACKEND_URL;



function Test() {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleDevices = useCallback((mediaDevices) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
  }, [])

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices])

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={{
          facingMode: facingMode,
          deviceId: selectedDevice,
        }}
      />
      {
        devices.length > 0 && (
          <select
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="p-2 border rounded"
          >
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label || `Cámara ${index + 1}`}
              </option>
            ))}
          </select>
        )
      }
      <button onClick={()=>setFacingMode(prevMode => prevMode === "user" ? "environment" : "user")} className="mr-2 w-12 h-12 bg-gray-500 text-white rounded flex items-center justify-center">cambiar camara</button>
    </div>
  );
}

export default Test;