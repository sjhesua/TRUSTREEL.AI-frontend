import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AiFillVideoCamera, AiOutlineVideoCamera } from 'react-icons/ai';
import Webcam from "react-webcam";

function Test() {
  //CAMARA-----------------------------------------
  const webcamRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  //Filtra los dispositivos de video
  const handleDevices = useCallback((mediaDevices) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
  }, [])
  //Al iniciar la camara se obtienen los dispositivos
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [])
  //----------------
  //END CAMARA-------------------------------------

  return (
    <div className="bgx3">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-10">
        <div className="flex flex-col w-full max-w-2xl">
          {isCameraOn ? (
            <div className="h-64 bg-gray-600 flex justify-center items-center">
              <Webcam
                className="max-h-full max-w-full"
                audio={false}
                ref={webcamRef}
                videoConstraints={{
                  deviceId: selectedDevice,
                }}
              />
            </div>
          ) : (
            <div className="h-64 bg-gray-600 flex justify-center items-center">
              <p className="text-white text-center">Webcam Disabled</p>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className="mr-2 w-12 h-12 bg-gray-500 text-white rounded flex items-center justify-center"
            >
              {isCameraOn ? <AiFillVideoCamera /> : <AiOutlineVideoCamera />}
            </button>
          </div>

          {devices.length > 0 && (
            <div className="flex justify-center mt-4">
              <select
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="p-2 border rounded"
              >
                {devices.map((device, index) => (
                  <option key={index} value={device.deviceId}>
                    {`Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Test;