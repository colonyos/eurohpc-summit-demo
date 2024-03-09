import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';
import { useImages } from './ImageProvider'

const DragDrop = () => {
  const {uploadedImages, setUploadedImages, analyzedImages, setAnalyzedImages, setAnalyzedImageVersion } = useImages();
  const [uploadError, setUploadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

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
          const uploadedImageUrl = response.data.filename;
          setUploadedImages(oldImages => [...oldImages, uploadedImageUrl]);
		  //setRefreshKey(prevKey => prevKey + 1); // Increment the key to force re-render
		  setAnalyzedImageVersion(prevVersion => prevVersion + 1);
	  	  return axios.post(`http://rocinante:8000/analyze`, { filename: uploadedImageUrl }, {
             headers: {
                'Content-Type': 'application/json',
             },
		  })
        })
        .then(analysisResponse => {
          const analyzedImageUrl = analysisResponse.data.generated_filename;
		  setAnalyzedImageVersion(prevVersion => prevVersion + 1);
          //setAnalyzedImages(oldImages => [...oldImages, analyzedImageUrl]);
		  setRefreshKey(prevKey => prevKey + 1); // Increment the key to force re-render
          setUploadError('');
        })
        .catch(error => {
          console.error('Error processing file:', error);
          setUploadError('Error processing file');
        });
      }
  }, [setUploadedImages, setAnalyzedImages]);

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
