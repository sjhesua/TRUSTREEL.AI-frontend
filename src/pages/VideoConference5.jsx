import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AiFillVideoCamera, AiOutlineVideoCamera } from 'react-icons/ai';
import VideoPlayer from './videoPlayer';
import Webcam from "react-webcam";
import Waveform from './Waveform';

import 'animate.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const VideoApp = () => {
    //URL
    const webcamRef = useRef(null);
    const [path, setPath] = useState("");
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [videoId, setVideoId] = useState(null);


    const [termsAndConditions, setTermsAndConditions] = useState(false);
    const [configCameraDone, setConfigCameraDone] = useState(false);

    const [isChecked, setIsChecked] = useState(false);

    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(true);
    //Reproductor de video
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [currentVideoIndex2, setCurrentVideoIndex2] = useState(0);
    const videoRefs = useRef([]);
    const [allVideosPlayed, setAllVideosPlayed] = useState(false);

    //Filtra los dispositivos de video
    const handleDevices = useCallback((mediaDevices) => {
        setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
    }, [])
    //Al iniciar la camara se obtienen los dispositivos
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [])
    //Optenemos 
    useEffect(() => {
        const baseUrl = "/app/";
        const currentPath = location.pathname;
        if (currentPath.startsWith(baseUrl)) {
            const extractedPath = currentPath.slice(baseUrl.length);
            setPath(extractedPath);
        }
    }, [location]);
    //VIDEOS

    useEffect(() => {
        const fetchVideoQueues = async () => {
            try {
                const response = await fetch(`${backendUrl}/videos/app/viedo-url?customeURL=${path}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setItems(data[0].items);
                setVideoId(data[0].id);
                console.log(data[0].items);
            } catch (error) {
                console.log(error);
            }
        };
        fetchVideoQueues();
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    //simulacion de carga
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, []);

    const handleSetConfigCameraDone = () => {
        setConfigCameraDone(true)
    }

    const handleSetTermsAndConditions = () => {
        setTermsAndConditions(true)
        setShowInitialButton(false);
        //startRecording();
        startMic();
        playNextVideo();

    }
    //xxxxxxx
    const playNextVideo = () => {
        if (isPlaying || currentVideoIndex2 >= items.length) {
            return;
        }
        setIsPlaying(true);
        const currentVideo = videoRefs.current[currentVideoIndex2];
        currentVideo.play();
        setAudioStarted(false)
        currentVideo.onended = () => {
            setIsPlaying(false);
            setAudioStarted(false)
            setCurrentVideoIndex2((prevIndex) => prevIndex + 1);
            if (currentVideoIndex + 1 >= items.length) {
                setAllVideosPlayed(true);
            }
        };
    };

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1 < items.length ? prevIndex + 1 : prevIndex));
    };
    //Microfono
    const waveformRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [silentSeconds, setSilentSeconds] = useState(0);
    const [audioStarted, setAudioStarted] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    const [showInitialButton, setShowInitialButton] = useState(true);

    const startMic = () => {
        if (waveformRef.current) {
            waveformRef.current.startToggleMic();
        }
    };

    const toggleMicrophone = () => {
        if (waveformRef.current) {
            try {
                waveformRef.current.startToggleMic();
                setIsMicrophoneActive(!isMicrophoneActive);
            } catch (err) {
                console.error("Error al alternar el micrófono: ", err);
                alert("Ocurrió un error al alternar el micrófono. Por favor, inténtalo de nuevo.");
            }
        } else {
            console.warn("waveformRef.current es nulo. Asegúrate de que el componente esté montado correctamente.");
            alert("No se pudo acceder al micrófono. Asegúrate de que el componente esté montado correctamente.");
        }
    };

    useEffect(() => {
        if (silentSeconds >= 5 && audioStarted) {
            if ((!isPlaying && !showInitialButton) || (!allVideosPlayed && !showInitialButton)) {
                playNextVideo();
            }
        }
        if (isPlaying) {
            setSilentSeconds(0);
            setAudioStarted(true)
        }
    }, [silentSeconds, isPlaying, audioStarted]);

    useEffect(() => {
        setAudioStarted(true)
    }, [isSpeaking])
    
    return (
        <div className="bgx3 h-auto">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="up-down-animation">
                        <p className="text-4xl font-bold text-white animate__animated animate__fadeInUp">
                            TrustReel
                        </p>
                        <p className="text-2xl text-white animate__animated animate__fadeInUp">
                            TrustReel Video Testimonial
                        </p>
                    </div>
                    <div className="w-full max-w-md mt-4">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 animate-progress"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {(configCameraDone === false) ? (
                        <div className={`min-h-screen flex items-center justify-center p-2 sm:p-2 `}>
                            <div className="flex flex-col w-full">
                                <div class="grid md:grid-cols-2 sm:grid-row-2 gap-2">

                                    <div className="bg-white rounded-lg shadow-md p-2 animate__animated animate__fadeIn" style={{ animationDelay: "0.9s" }}>
                                        {isCameraOn ? (
                                            <div className="h-[16rem] bg-gray-600 flex justify-center items-center">
                                                <Webcam
                                                    className="max-h-full max-w-full"
                                                    audio={false}
                                                    ref={webcamRef}
                                                    videoConstraints={{
                                                        deviceId: selectedDevice,
                                                    }}
                                                    disablePictureInPicture
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-[16rem] bg-gray-600 flex justify-center items-center">
                                                <p className="text-white text-center">Webcam Disabled</p>
                                            </div>
                                        )}
                                        {devices.length > 0 && (
                                            <div className="flex justify-center mt-4 ">
                                                <select
                                                    onChange={(e) => setSelectedDevice(e.target.value)}
                                                    className="p-2 border rounded w-full"
                                                >
                                                    {devices.map((device, index) => (
                                                        <option key={index} value={device.deviceId}>
                                                            {`Camera ${index + 1}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <ul class="flex justify-center space-x-4 mt-4">
                                            <li>
                                                <button
                                                    onClick={() => setIsCameraOn(!isCameraOn)}
                                                    className="text-gray-500 hover:text-[#f230aa] text-4xl"
                                                >
                                                    {isCameraOn ? <AiFillVideoCamera /> : <AiOutlineVideoCamera />}
                                                </button>
                                            </li>
                                        </ul>
                                        <button disabled={!isCameraOn} className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${isCameraOn ? 'hover-grow btnx' : 'bg-gray-400 cursor-not-allowed btnxd '}`} onClick={handleSetConfigCameraDone}>Done</button>
                                    </div>
                                    <div className="p-10 rounded-lg shadow-lg text-center">
                                        <div className="up-down-animation">
                                            <p className="text-4xl font-bold text-white animate__animated animate__fadeInUp">
                                                TrustReel
                                            </p>
                                            <p className="text-2xl text-white mb-6 animate__animated animate__fadeInUp">
                                                TrustReel Video Testimonial
                                            </p>
                                        </div>
                                        <ul className="list-disc pl-5 space-y-4">
                                            <li className="text-white text-justify text-lg leading-relaxed animate__animated animate__fadeInUp">
                                                Pick a quiet and well-lit place
                                            </li>
                                            <li className="text-white text-justify text-lg leading-relaxed animate__animated animate__fadeInUp">
                                                Relax &amp; be yourself – it doesn't have to be perfect
                                            </li>
                                            <li className="text-white text-justify text-lg leading-relaxed animate__animated animate__fadeInUp">
                                                You can redo your recording if you're not happy with it
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}

                    {(termsAndConditions === false && configCameraDone === true) ? (
                        <div className={`flex flex-wrap h-screen absolute`}>
                            <div className="w-full h-1/2 md:w-1/2 md:h-full md:p-20 animate__animated animate__fadeInUp">
                                <div className='flex flex-col items-center justify-center h-full'>
                                    <p className='p-10 text-white'>
                                        Gracias por tu interés en dar feedback sobre la charla que dio Gonzalo Arzuaga en tu grupo Vistage. Te voy a hacer 3 preguntas cortitas acerca de como fue tu experiencia para compartir con otros coordinadores que estén buscando un expositor para sus grupos.
                                        Ah…
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1/2 md:w-1/2 md:h-full md:p-20 animate__animated animate__fadeInUp">
                                <div className='flex flex-col items-center justify-center h-full'>
                                    <div className="relative transform rounded-lg text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
                                        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                            <div className="sm:flex sm:items-start">
                                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                    <h3 as="h3" className="text-base font-semibold leading-6 text-white ">
                                                        How it Works
                                                    </h3>
                                                    <div className="mt-2">
                                                        <p className="text-sm text-white">
                                                            Our human avatar will ask you a few short questions about our service and how satisfied you're.
                                                        </p>
                                                        <p className="text-sm text-white">
                                                            After you accept our terms, just click the Start Recording button.
                                                        </p>
                                                        <div class="flex items-center mb-4 pt-2">
                                                            <input
                                                                id="default-checkbox"
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => setIsChecked(e.target.checked)}
                                                                class="w-4 h-4 text-[#f230aa] bg-gray-100 border-gray-300 rounded focus:ring-[#f230aa] dark:focus:ring-[#f230aa] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                            <label for="default-checkbox" class="ms-2 text-sm font-medium text-white select-none">
                                                                Accept Terms and Conditions. Basically we can use the recording in social networks, emails, etc. <a href='#' className='text-[#f230aa] font-bold'> Link to T&C</a>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 flex flex-col sm:px-6">
                                            <button
                                                type="button"
                                                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto   ${isChecked ? 'hover-grow btnx' : 'bg-gray-400 cursor-not-allowed btnxd '
                                                    }`}
                                                disabled={!isChecked}
                                                onClick={handleSetTermsAndConditions}
                                            >
                                                Let's Go
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                </>


            )}
            <div className={`grid md:grid-cols-2 h-screen w-screen ${(termsAndConditions === true && configCameraDone === true) ? "" : "hidden"}`}>
                <div className="overflow-hidden w-full h-full">
                    {items.map((video, index) => (
                        <video
                            key={index}
                            ref={(el) => (videoRefs.current[index] = el)}
                            src={video.url}
                            onEnded={() => {
                                handleVideoEnd();
                                videoRefs.current[index].classList.add('blur-sm');
                            }}
                            onPlay={() => {
                                videoRefs.current[index].classList.remove('blur-sm');
                            }}
                            className={`w-[150%] h-[150%] min-h-[50vh] max-w-none max-h-none object-cover ${index === currentVideoIndex ? 'block' : 'hidden'} blur-sm`}
                            style={{ ...video.style, transform: 'translate(-14%, 0%)' }}
                            onLoadedMetadata={() => {
                                console.log(video);
                            }}
                        />
                    ))}
                </div>
                <div className="overflow-hidden w-full h-full flex justify-center items-center">
                    <Webcam
                        className="min-w-fit min-h-full max-h-full max-w-full"
                        audio={false}
                        ref={webcamRef}
                        videoConstraints={{
                            deviceId: selectedDevice,
                        }}
                    />

                    <div className='flex absolute items-center bottom-5 right-5 z-20'>
                        <div>
                            <button
                                className={`mr-2 ${isMicrophoneActive ? 'bg-gray-600 hover:bg-gray-600 h-10 w-10' : 'bg-[#f230aa] hover:bg-[#f46bbd] w-10 h-10'} text-white p-3 shadow-lg rounded-full flex items-center justify-center`}
                                onClick={toggleMicrophone}
                            >
                                {isMicrophoneActive ? (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                        <path d="M15 9.4V5C15 3.34315 13.6569 2 12 2C10.8224 2 9.80325 2.67852 9.3122 3.66593M12 19V22M8 22H16M3 3L21 21M5.00043 10C5.00043 10 3.50062 19 12.0401 19C14.51 19 16.1333 18.2471 17.1933 17.1768M19.0317 13C19.2365 11.3477 19 10 19 10M12 15C10.3431 15 9 13.6569 9 12V9L14.1226 14.12C13.5796 14.6637 12.8291 15 12 15Z" stroke="#ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                        <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="#ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div>
                            <Waveform
                                ref={waveformRef}
                                isSpeaking={isSpeaking}
                                setIsSpeaking={setIsSpeaking}
                                silentSeconds={silentSeconds}
                                setSilentSeconds={setSilentSeconds}
                                audioStarted={audioStarted}
                                setAudioStarted={setAudioStarted}
                            />

                            <button
                                className='text-[#fbd8e7] relative w-40 h-10 rounded-full border border-4 border-[#f230aa]'
                                style={{
                                    background: `linear-gradient(to right, #f230aa ${silentSeconds * 20}%, transparent 0%)`
                                }}
                            >
                                {silentSeconds >= 5 ? 'Respuesta enviada' : 'Repondiendo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoApp;