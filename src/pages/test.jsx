import React, { useEffect, useState } from 'react';

const BunnyCDNVideoList = ({ backendUrl, apiKey, storageZoneName, folderPath }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener todos los archivos de la carpeta en BunnyCDN
    const fetchVideos = async () => {
        const url = `https://storage.bunnycdn.com/trustreel/35a9557a-9e90-4323-985b-a679ab80f0c9/1/124/`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'AccessKey': '0fd94989-65b4-4d8e-a95672c97c26-4132-4f8c', // Clave de acceso de BunnyCDN
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }

            const files = await response.json();
            const videoFiles = files; // Filtrar solo archivos de video (mp4)
            console.log(videoFiles)
            setVideos(videoFiles);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    return (
        <div>
            <h1>Lista de Videos</h1>
            {loading ? (
                <p>Cargando videos...</p>
            ) : (
                <div>
                    {videos.length > 0 ? (
                        videos.map((video, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                                <video width="320" height="240" controls>
                                    <source
                                        src={`https://trustreel.b-cdn.net/35a9557a-9e90-4323-985b-a679ab80f0c9/1/63/${video.ObjectName}`}
                                        type="video/mp4"
                                    />
                                    Tu navegador no soporta la etiqueta de video.
                                </video>
                                <p>{video.ObjectName}</p>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron videos.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BunnyCDNVideoList;
