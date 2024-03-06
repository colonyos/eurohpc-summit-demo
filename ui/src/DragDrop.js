import React, { useState, useCallback } from 'react';
import axios from 'axios';

const DragDrop = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:8000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      const newImageUrl = `http://localhost:8000/uploads/${response.data.filename}`;
      setUploadedImages(oldImages => [...oldImages, newImageUrl]);
      setUploadError('');
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      setUploadError('Error uploading file');
    });
  }, []);

  return (
    <div>
      <div
        onDrop={(e) => {
          e.preventDefault();
          onDrop(e.dataTransfer.files);
        }}
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
        }}>
        Drag and drop an image here!
      </div>
      {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
      <div>
        {uploadedImages.slice().reverse().map((imageUrl, index) => (
		  <div>
             <img key={index} src={imageUrl} alt={`Uploaded ${index}`} style={{ maxWidth: '300px', margin: '10px' }} />
		  </div>
        ))}
      </div>
    </div>
  );
};

export default DragDrop;
