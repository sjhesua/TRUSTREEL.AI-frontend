import React, { useEffect, useRef, useState,useImperativeHandle, forwardRef } from 'react';

const Waveform = forwardRef(({ silentSeconds, setSilentSeconds, isSpeaking, setIsSpeaking, audioStarted, setAudioStarted }, ref) => {
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationIdRef = useRef(null);
    const streamRef = useRef(null);
    //const [isSpeaking, setIsSpeaking] = useState(false);
    const [micActive, setMicActive] = useState(false);

    const setupAudio = async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        setAudioStarted(true);
        draw();
    };
    const stopAudio = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            //setAudioStarted(false);
        }
    };

    const toggleMic = () => {
        if (micActive) {
            stopAudio();
        } else {
            setupAudio();
        }
        setMicActive(!micActive);
    };

    const handletoggleMic = () => {
        toggleMic();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
    
        analyser.getByteTimeDomainData(dataArray);
    
        // Usar color de fondo transparente
        canvasCtx.fillStyle = 'rgb(255, 255, 255)'; // Fondo transparente
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height); // Rectángulo invisible
    
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(242, 48, 170)';
    
        canvasCtx.beginPath();
    
        const sliceWidth = (canvas.width * 1.0) / analyser.fftSize;
        let x = 0;
        let isSpeakingNow = false;
    
        for (let i = 0; i < analyser.fftSize; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
    
            if (v > 1.05 || v < 0.95) {
                isSpeakingNow = true;
            }
    
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
    
            x += sliceWidth;
        }
        setIsSpeaking(isSpeakingNow);
    
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    
        animationIdRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        if (audioStarted) {
            let intervalId;
            if ( !isSpeaking) {
                intervalId = setInterval(() => {
                    setSilentSeconds(prev => Math.min(prev + 1, 5));
                }, 1000);
            } else {
                setSilentSeconds(0);
            }

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }

    }, [isSpeaking]);
    
    useImperativeHandle(ref, () => ({
        startToggleMic: handletoggleMic,
    }));

    return (
        <>
            <canvas ref={canvasRef} width="50" height="50" style={{borderRadius: '50%'}} className='border border-4 border-[#f230aa] cursor-pointer' onClick={toggleMic} />
        </>
    );
});

export default Waveform;