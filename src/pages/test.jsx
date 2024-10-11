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
      <div className="h-screen w-screen overflow-y flex items-center justify-center p-10">
        <div className='flex flex-col'>
          {isCameraOn ? (
            <div className="h-[480px] w-[640px] max-h-full max-w-full bg-gray-600">
            <Webcam
              className='max-height-full max-width-full'
              audio={false}
              ref={webcamRef}
              videoConstraints={{
                width: 640,
                height: 480,
                deviceId: selectedDevice,
              }}
            />
            </div>
          ) : (
            <div className='h-[480px] w-[640px] max-h-full max-w-full bg-gray-600' >
              <p style={{ color: '#fff', textAlign: 'center', paddingTop: '200px' }}>Webcam Disabled</p>
            </div>
          )}

          <button onClick={() => setIsCameraOn(!isCameraOn)} className="mr-2 w-12 h-12 bg-gray-500 text-white rounded flex items-center justify-center">
            {isCameraOn ? <AiFillVideoCamera className="" /> : <AiOutlineVideoCamera />}
          </button>
          {
            devices.length > 0 && (
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
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Test;