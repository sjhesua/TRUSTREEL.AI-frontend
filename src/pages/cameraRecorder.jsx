import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const CameraRecorder = forwardRef(({ StartRecording, StopRecording }, ref) => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                videoRef.current.srcObject = stream;
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setRecordedChunks((prev) => [...prev, event.data]);
                    }
                };
            } catch (err) {
                console.error('Error accessing camera: ', err);
            }
        };

        startCamera();
    }, []);

    const handleStartRecording = () => {
        setRecording(true);
        mediaRecorderRef.current.start();
    };

    const handleStopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current.stop();
    };

    useImperativeHandle(ref, () => ({
        startRecording: handleStartRecording,
        stopRecording: handleStopRecording,
    }));

    useEffect(() => {
        if (!recording && recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recording.mp4';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }, [recording, recordedChunks]);

    return (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full max-h-full object-cover block" />
    );
});

export default CameraRecorder;