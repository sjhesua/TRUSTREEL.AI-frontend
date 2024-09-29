// VideoModal.js
import React, { useState, useEffect } from 'react';
const backendUrl = process.env.REACT_APP_BACKEND_URL
const replacePort = (url, oldPort, newPort) => {
    return url.replace(`:${oldPort}`, `:${newPort}`);
};

const VideoModal = ({ video, onClose,customeUrl,videoName, data }) => {
    const [items, setItems] = useState([]);
    const updatedBackendUrl = replacePort(backendUrl, 8000, 3000);
    useEffect(() => {
        console.log(data)
        setItems(data);
    }, [data]);
    
    

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-3/4">
                <h2 className="text-xl mb-4">{videoName}</h2>
                <h2 className="text-xl mb-4">{`${updatedBackendUrl}/app/${customeUrl}`}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="border p-4 rounded-lg">
                            <p>{item.videoText}</p>
                            {item.url ? (
                                <video controls className="w-full">
                                    <source src={item.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <p>Generando video</p>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};

export default VideoModal;