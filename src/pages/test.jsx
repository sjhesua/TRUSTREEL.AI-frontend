import React, { useState, useRef, useEffect } from 'react';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function VideoUpload() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [queue, setQueue] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (queue.length > 0 && !isUploading) {
      uploadFragment(queue[0]);
    }
  }, [queue, isUploading]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {

        setQueue((prevQueue) => [...prevQueue, event.data]);
      }
    };
    recorder.start(1000); // Graba en fragmentos de 1 segundo
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  const uploadFragment = async (fragment) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', `User Video`);
    formData.append('video_file', fragment, `video_${Date.now()}.webm`);

    try {
      const response = await fetch(`${backendUrl}/videos/api/upload/`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      
      setQueue((prevQueue) => prevQueue.slice(1));
    } catch (error) {
      console.error('Error uploading video fragment:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload Video</h1>
      <video ref={videoRef} autoPlay></video>
      <div>
        {!recording && <button onClick={startRecording}>Start Recording</button>}
        {recording && <button onClick={stopRecording}>Stop Recording</button>}
      </div>
    </div>
  );
}

export default VideoUpload;