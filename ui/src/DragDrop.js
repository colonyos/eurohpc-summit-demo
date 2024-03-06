import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';
import { useImages } from './ImageProvider'

const DragDrop = () => {
  const { uploadedImages, setUploadedImages } = useImages(); // Using global state
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      axios.post('http://rocinante:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        const newImageUrl = response.data.filename;
        setUploadedImages(oldImages => [...oldImages, newImageUrl]);
        setUploadError('');
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        setUploadError('Error uploading file');
      });
    }
  }, [setUploadedImages]);

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '20px',
          width: '300px',
          height: '75px',
          padding: '20px',
          position: 'sticky',
          top: 0,
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: '20px',
          zIndex: 1000,
        }}
      >
        Drag and drop an image here!
      </div>
      {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
    </div>
  );
};

export default DragDrop;
