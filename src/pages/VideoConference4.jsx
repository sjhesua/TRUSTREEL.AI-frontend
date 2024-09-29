import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import VideoPlayer from './videoPlayer';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                console.log(data[0].items);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideoQueues();
    }, [path]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <VideoPlayer videos={items} />
        </div>
    );
};

export default VideoApp;