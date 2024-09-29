import React, { useRef, useState, useEffect } from 'react';
import Waveform from './Waveform';
import CameraRecorder from './cameraRecorder';

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
       
        if(allVideosPlayed && silentSeconds >= 5){
            stopRecording();
            console.log('Recording stopped');
        }
    }, [silentSeconds, allVideosPlayed]);

    return (
        <div className="h-screen w-screen">
            {/*Este boto lo usamos para inicar todo, la grabacion y el waveform*/}
            <div className={`flex items-center justify-center h-full w-full ${showInitialButton ? '' : 'hidden'}`}>
                <p>
                Gracias por tu interés en dar feedback sobre la charla que dio Gonzalo Arzuaga en tu grupo Vistage. Te voy a hacer 3 preguntas cortitas acerca de como fue tu experiencia para compartir con otros coordinadores que estén buscando un expositor para sus grupos. 
                Ah… cuando hagas una pausa en tu respuesta yo lo tomare como que terminaste, y acto seguido te hare la siguiente pregunta. Cuando estas listo, apreta el boton y empezamos!
                </p>
                <button
                    onClick={handleInitialButtonClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Iniciar
                </button>
            </div>
            {/*Esto se muestra despues que el boto desaparece*/}
            <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 h-screen w-screen ${showInitialButton ? 'hidden' : ''}`}>
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
                        className={`w-full h-full max-h-full object-cover ${index === currentVideoIndex ? 'block' : 'hidden'} blur-sm`}
                    />
                ))}

                <div className="flex flex-col">
                    <CameraRecorder ref={cameraRecorderRef} />
                    <div className='flex absolute items-center bottom-5 right-5'>
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
                            className='relative w-40 h-10 rounded-full border border-4 border-[#f230aa]'
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
    );
};

export default VideoPlayer;