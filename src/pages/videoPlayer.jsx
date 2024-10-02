import React, { useRef, useState, useEffect } from 'react';
import Waveform from './Waveform';
import CameraRecorder from './cameraRecorder';
import { AiFillAudio, AiOutlineAudio } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';

const VideoPlayer = ({ videos }) => {
    const [showInitialButton, setShowInitialButton] = useState(true);


    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [currentVideoIndex2, setCurrentVideoIndex2] = useState(0);
    const [allVideosPlayed, setAllVideosPlayed] = useState(false);
    const videoRefs = useRef([]);
    //Video

    const cameraRecorderRef = useRef(null);

    const waveformRef = useRef(null);

    const startMic = () => {
        if (waveformRef.current) {
            waveformRef.current.startToggleMic();
        }
    };

    const startRecording = () => {
        if (cameraRecorderRef.current) {
            cameraRecorderRef.current.startRecording();
        }
    };

    const stopRecording = () => {
        if (cameraRecorderRef.current) {
            cameraRecorderRef.current.stopRecording();
        }
    };

    // waveform
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [silentSeconds, setSilentSeconds] = useState(0);
    const [audioStarted, setAudioStarted] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    const playNextVideo = () => {
        if (isPlaying || currentVideoIndex2 >= videos.length) {
            return;
        }
        setIsPlaying(true);
        const currentVideo = videoRefs.current[currentVideoIndex2];
        currentVideo.play();
        currentVideo.onended = () => {
            setIsPlaying(false);
            setCurrentVideoIndex2((prevIndex) => prevIndex + 1);
            if (currentVideoIndex + 1 >= videos.length) {
                setAllVideosPlayed(true);
            }
        };
    };

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1 < videos.length ? prevIndex + 1 : prevIndex));
    };

    const handleInitialButtonClick = () => {
        setShowInitialButton(false);
        startRecording();
        startMic();
        playNextVideo();
    };

    const toggleMicrophone = () => {
        if (waveformRef.current) {
            waveformRef.current.startToggleMic();
        }
        setIsMicrophoneActive(!isMicrophoneActive);
    };

    useEffect(() => {
        if (silentSeconds >= 5 && audioStarted) {
            if (!isPlaying || !allVideosPlayed) {
                playNextVideo();
            }
        }
        if (isPlaying) {
            setSilentSeconds(0);
        }
    }, [silentSeconds, isPlaying]);

    useEffect(() => {

        if (allVideosPlayed && silentSeconds >= 5) {
            stopRecording();
            console.log('Recording stopped');
        }
    }, [silentSeconds, allVideosPlayed]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, []);
    const navigate = useNavigate();

    useEffect(() => {
        if(allVideosPlayed && !isPlaying)
        {
            if (silentSeconds >= 5) {
                window.location.href = '/';
            }
        }
    }, [allVideosPlayed,isPlaying,silentSeconds]);

    return (
        <div className="h-screen w-screen">
            {/*Este boto lo usamos para inicar todo, la grabacion y el waveform*/}
            <div className={`flex flex-col items-center justify-center h-full w-full ${showInitialButton ? '' : 'hidden'}`}>
                <p className='p-10'>
                    Gracias por tu interés en dar feedback sobre la charla que dio Gonzalo Arzuaga en tu grupo Vistage. Te voy a hacer 3 preguntas cortitas acerca de como fue tu experiencia para compartir con otros coordinadores que estén buscando un expositor para sus grupos.
                    Ah… cuando hagas una pausa en tu respuesta yo lo tomare como que terminaste, y acto seguido te hare la siguiente pregunta. Cuando estas listo, apreta el boton y empezamos!
                </p>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <button
                        onClick={handleInitialButtonClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Iniciar
                    </button>
                )}
            </div>
            {/*Esto se muestra despues que el boto desaparece*/}
            <div className={`grid grid-cols-1 md:grid-cols-2 h-screen w-screen ${showInitialButton ? 'hidden' : ''}`}>
                <div className="relative overflow-hidden w-full h-full">
                    {videos.map((video, index) => (
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
                            className={`absolute top-1/2 left-1/2 w-[200%] h-[200%] max-w-none max-h-none object-cover transform -translate-x-1/2 -translate-y-1/2 ${index === currentVideoIndex ? 'block' : 'hidden'} blur-sm`}
                            style={{ transform: 'translate(-50%, -30%)',minHeight:'50vh' }}
                        />
                    ))}
                </div>
                <div className="flex flex-col">

                    <CameraRecorder ref={cameraRecorderRef} />

                    <div className='flex absolute items-center bottom-5 right-5'>
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

export default VideoPlayer;