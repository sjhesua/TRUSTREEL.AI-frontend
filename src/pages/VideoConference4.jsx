import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import VideoPlayer from './videoPlayer';
import 'animate.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const VideoApp = () => {
    //URL
    const [path, setPath] = useState("");
    const location = useLocation();

    useEffect(() => {
        const baseUrl = "/app/";
        const currentPath = location.pathname;
        if (currentPath.startsWith(baseUrl)) {
            const extractedPath = currentPath.slice(baseUrl.length);
            setPath(extractedPath);
        }
    }, [location]);

    useEffect(() => {
        const requestPermissions = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("Permissions granted");
            } catch (err) {
                console.error("Error requesting permissions", err);
            }
        };

        requestPermissions();
    }, []);
    //VIDEOS

    const [data, setData] = useState([]);
    const [videoName, setVideoName] = useState('');
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [videoId, setVideoId] = useState(null);

    useEffect(() => {
        const fetchVideoQueues = async () => {
            try {
                const response = await fetch(`${backendUrl}/videos/app/viedo-url?customeURL=${path}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setData(data);
                setVideoName(data[0].videoName);
                setItems(data[0].items);
                setVideoId(data[0].id);
                console.log(data[0].items);
            } catch (error) {
                setError(error);
            }
        };
        fetchVideoQueues();
    }, [path]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, []);

    return (
        <div className="bgx2">
            <div class="gradient-wrapper2"></div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="text-4xl font-bold text-white animate__animated animate__fadeInUp">
                        TrustReel
                    </p>
                    <p className="text-2xl text-white animate__animated animate__fadeInUp">
                        TrustReel Video Testimonial
                    </p>
                    <div className="w-full max-w-md mt-4">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 animate-progress"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <VideoPlayer videos={items} videoId={videoId} />
            )}
        </div>
    );
};

export default VideoApp;