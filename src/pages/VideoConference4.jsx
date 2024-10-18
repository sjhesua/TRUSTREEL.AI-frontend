import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AiFillVideoCamera, AiOutlineVideoCamera, AiFillAudio, AiOutlineAudio } from 'react-icons/ai';
import { Link, useLocation } from 'react-router-dom';
import Webcam from "react-webcam";
import Waveform from './Waveform';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function VideoApp() {
    const videoRefs = useRef([]);
    const [isLoading, setIsLoading] = useState(true);
    //CAMARA-----------------------------------------
    const [camaraFrontalTracera, setCamaraFrontalTracera] = useState("user");
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [tienePermisosCamara, setTienePermisosCamara] = useState(false);
    //END CAMARA-------------------------------------
    //Microfono
    const waveformRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [silentSeconds, setSilentSeconds] = useState(0);
    const [audioStarted, setAudioStarted] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    //TERMS AND CONDITIONS
    const [isChecked, setIsChecked] = useState(false);
    //END TERMS AND CONDITIONS

    //MENSAJE DE DESPEDIDA
    const [respuestFinal, SetRespuestaFinal] = useState(false);
    //END MENSAJE DE DESPEDIDA

    //PAGINAS
    const [configCameraDone, setConfigCameraDone] = useState(false);
    const [termsAndConditions, setTermsAndConditions] = useState(false);
    //END PAGINAS
    //videos y grabaciones
    const [isPlaying, setIsPlaying] = useState(false);
    const [inicioReproduccion, SetInicioReproduccion] = useState(false);
    const [allVideosPlayed, setAllVideosPlayed] = useState(false);

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [currentVideoIndex2, setCurrentVideoIndex2] = useState(0);
    const [path, setPath] = useState("");
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [videoId, setVideoId] = useState(null)
    //FUNCION PARA CAMBIAR DE VIDEO
    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1 < items.length ? prevIndex + 1 : prevIndex));
    };
    //FUNCION PARA OBTENER LOS DISPOSITIVOS DE VIDEO
    const handleDevices = useCallback((mediaDevices) => {
        setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
    });
    //FUNCION PARA VERIFICAR PERMISOS DE CAMARA
    const checkCameraPermissions = async () => {
        //optienes los permisos de la camara
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        //si los permisos cambian, recarga la pagina
        permissionStatus.onchange = () => {
            window.location.reload();
        }
        //si los permisos estan permitidos, esto se utilizara para mostrar el loading
        if (permissionStatus.state === 'granted') {
            setTienePermisosCamara(true);
        }
    };
    //FUNCION PARA INICIAR EL MICROFONO
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
    //FUNCION QUE REPORDUCE LOS VIDEOS SIGUIENTES
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
    const startMic = () => {
        if (waveformRef.current) {
            waveformRef.current.startToggleMic();
        }
    };
    //FUNCION PARA COMENZAR A REPRODUCIR LOS VIDEOS Y GRABAR LA CAMARA
    const handleSetConfigCameraDone = () => {
        setConfigCameraDone(true)
        startMic();
        playNextVideo();
        SetInicioReproduccion(true);
    }

    useEffect(() => {
        const baseUrl = "/app/";
        const currentPath = location.pathname;
        if (currentPath.startsWith(baseUrl)) {
            const extractedPath = currentPath.slice(baseUrl.length);
            setPath(extractedPath);
        }
        setIsMobile(window.innerWidth <= 768);
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
        checkCameraPermissions();
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);
    //MONITOREO DE MICROFONO
    useEffect(() => {
        if (silentSeconds >= 4 && audioStarted) {
            if ((!isPlaying && inicioReproduccion) || (!allVideosPlayed && inicioReproduccion)) {
                playNextVideo();
            }
            if (allVideosPlayed) {
                SetRespuestaFinal(true);
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
    //ENDMONITOREO DE MICROFONO
    useEffect(() => {
        const fetchVideoQueues = async () => {
            try {
                const response = await fetch(`${backendUrl}/videos/app/viedo-url?customeURL=${path}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(response)
                const data = await response.json();
                setItems(data[0].items);
                setVideoId(data[0].id);
                console.log(data[0].items);
            } catch (error) {
                console.log(error);
            }
        };
        fetchVideoQueues();
    }, [path]);
    return (
        <div className="bg-fondo">
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
                        <div className="h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-[#f230aa] animate-progress"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/*TERMS AND CONDITIONS*/}
                    {(termsAndConditions === false && configCameraDone === false) ? (
                        <div className={`flex flex-wrap h-screen absolute bg-fondo`}>
                            <div className="w-full h-1/2 md:w-1/2 md:h-full md:p-20 animate__animated animate__fadeInUp">
                                <div className='flex flex-col items-center justify-center h-full'>
                                    <p className='p-10 text-white'>
                                        Thank you for your interest in providing feedback on the talk given by Gonzalo Arzuaga in your Vistage group. I’m going to ask you 3 short questions about your experience to share with other coordinators who may be looking for a speaker for their groups. Ah…
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
                                                        <div className="flex items-center mb-4 pt-2">
                                                            <input
                                                                id="default-checkbox"
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => { setIsChecked(e.target.checked); }}
                                                                className="w-4 h-4 text-[#f230aa] bg-gray-100 border-gray-300 rounded focus:ring-[#f230aa] dark:focus:ring-[#f230aa] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                            <label for="default-checkbox" className="ms-2 text-sm font-medium text-white select-none">
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
                                                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto   ${isChecked ? 'bg-good' : 'bg-base cursor-not-allowed '
                                                    }`}
                                                disabled={!isChecked}
                                                onClick={() => setTermsAndConditions(true)}
                                            >
                                                Let's Go
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                    {/*ENDTERMS AND CONDITIONS*/}
                    {/*CONFIG CAMERA*/}
                    {(configCameraDone === false && termsAndConditions === true) ? (
                        <div className="flex items-center justify-center min-h-screen  py-12 bg-pepe">
                            <div className="max-w-lg mx-auto p-6 rounded-lg shadow-md space-y-6 md:max-w-lg">
                                {/*<!-- Row 1: Video/Text Container -->*/}
                                <div className="flex justify-center items-center h-64 w-[22rem] bg-gray-100 rounded-lg overflow-hidden">
                                    <div className="relative w-full h-full">
                                        {isCameraOn ? (
                                            <Webcam
                                                className={`absolute inset-0 w-full h-full object-cover`}
                                                videoConstraints={{
                                                    width: 1280,
                                                    height: 720,
                                                    facingMode: camaraFrontalTracera,
                                                    deviceId: selectedDevice
                                                }} />) :
                                            (
                                                <p className={`absolute inset-0 flex items-center justify-center text-gray-700 text-lg`}>
                                                    Camera Off
                                                </p>)
                                        }
                                    </div>
                                </div>
                                {/*<!-- Row 2: Two Buttons -->*/}
                                <div className="flex justify-left space-x-4">
                                    <button onClick={() => setIsCameraOn(!isCameraOn)} className={`mr-2 w-12 h-12 text-white rounded flex items-center justify-center ${isCameraOn ? 'bg-good' : 'bg-danger'}`}>
                                        {isCameraOn ? <AiFillVideoCamera className="" /> : <AiOutlineVideoCamera />}
                                    </button>
                                    <button onClick={() => setIsMicrophoneActive(!isMicrophoneActive)} className={`w-12 h-12 text-white rounded flex items-center justify-center ${isMicrophoneActive ? 'bg-good' : 'bg-danger'}`}>
                                        {isMicrophoneActive ? <AiFillAudio /> : <AiOutlineAudio />}
                                    </button>
                                </div>
                                {/*<!-- Row 3: Select Box -->*/}
                                <div>
                                    {isMobile ? (
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                                            onChange={(e) => setCamaraFrontalTracera(e.target.value)} value={camaraFrontalTracera}>
                                            <option value="user">Front Camera</option>
                                            <option value="environment">Rear camera</option>
                                        </select>
                                    ) : (
                                        devices.length > 0 && (
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                                                onChange={(e) => setSelectedDevice(e.target.value)} value={selectedDevice}>
                                                {devices.map((device, index) => (
                                                    <option key={index} value={device.deviceId}>
                                                        {device.label || `Camera ${index + 1}`}
                                                    </option>
                                                ))}
                                            </select>
                                        )
                                    )}
                                </div>
                                {/*<!-- Row 4: Label and Button -->*/}
                                <div className="flex justify-between items-center">
                                    <label for="inputField" className="text-gray-700">Are you ready to join?</label>
                                    <button
                                        disabled={!isCameraOn && !tienePermisosCamara}
                                        onClick={handleSetConfigCameraDone}
                                        className="ml-4 py-2 px-4 text-white font-semibold rounded-lg bg-base hover:bg-good">
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                    {/*END CONFIG CAMERA*/}
                    {/*MENSAJE DE DESPEDIDA*/}
                    {(respuestFinal === true) ? (
                        <div className={`flex flex-wrap h-screen absolute bg-fondo min-w-full`}>
                            <div className="w-full h-1/2 md:h-full md:p-20 animate__animated animate__fadeInUp">
                                <div className='flex flex-col items-center justify-center h-full'>
                                    <p className='p-10 text-white'>
                                        Thank you for taking the time to fill out this questionnaire. Any feedback or comments will be greatly appreciated! You can write to us at @TrustReel.
                                    </p>
                                    <a
                                        href="/"
                                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto   ${isChecked ? 'hover-grow btnx' : 'bg-gray-400 cursor-not-allowed btnxd '
                                            }`}
                                    >
                                        Goodbye!
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                    {/*END MENSAJE DE DESPEDIDA*/}
                </>
            )}
            {/*Lo siguiente es para que comience a cargar los videos desde el principio*/}
            <div className={`flex items-center justify-center min-h-screen bg-fondo ${((termsAndConditions === true && configCameraDone === true)) ? "" : "hidden"} ${(respuestFinal === true) ? "hidden" : ""}`}>
                <div className="relative w-full max-w-4xl rounded-lg shadow-md">
                    <div className="absolute top-4 left-4 w-[36%] z-10">
                        <div className="flex items-center justify-center w-full h-full overflow-hidden pt-[28vh] min-w-[30vh] max-h-[20vh] rounded-md" >
                            
                            <video 
                                src="/videos/loop.mp4"
                                autoPlay
                                loop
                                className={`max-w-full max-h-full shadow-md min-w-[100vh] ${isPlaying === false ? 'block' : 'hidden'}`}></video>
                            {items.map((video, index) => (
                                <video
                                    key={index}
                                    ref={(el) => (videoRefs.current[index] = el)}
                                    src={video.url}
                                    onEnded={() => {
                                        handleVideoEnd();
                                        //videoRefs.current[index].classList.add('blur-sm');
                                    }}
                                    onPlay={() => {
                                        //videoRefs.current[index].classList.remove('blur-sm');
                                    }}
                                    className={`max-w-full max-h-full shadow-md min-w-[100vh] ${index === currentVideoIndex ? 'block' : 'hidden'} ${isPlaying === true ? 'block' : 'hidden'}`}
                                    style={{ ...video.style }}
                                    onLoadedMetadata={() => {
                                        console.log(video);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="relative w-full rounded-lg overflow-hidden min-h-screen lg:min-h-0">
                        {configCameraDone ? (
                            <Webcam
                                className="w-full h-full object-cover md:object-contain min-h-screen lg:min-h-0"
                                audio={false}
                                videoConstraints={{
                                    facingMode: camaraFrontalTracera,
                                    deviceId: selectedDevice,
                                    width: { max: 9999 },
                                    height: { max: 9999 },
                                    frameRate: { ideal: 60 },
                                }}
                            />) :
                            (<></>)}
                        <div className="w-full py-[1rem] bg-fondo flex grid grid-cols-3">
                            <div className="hidden sm:flex  items-center justify-center col-span-1"></div>
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                                <button
                                    className={`mr-2 ${isMicrophoneActive ? 'bg-danger h-10 w-10' : 'bg-good  w-10 h-10'} text-white p-3 shadow-lg rounded-md flex items-center justify-center`}
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
                                        className='text-white relative w-40 h-10 rounded-md'
                                        style={{
                                            background: `linear-gradient(to right, rgb(68, 142, 254) ${silentSeconds * 25}%, transparent 0%)`
                                        }}
                                    >
                                        {silentSeconds >= 4 ? 'Respuesta enviada' : 'Repondiendo'}
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center justify-end">
                                <a
                                    href="/"
                                    className='flex items-center justify-center text-white relative w-40 h-10 rounded-md bg-danger'
                                >
                                    Leave Meet
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default VideoApp;