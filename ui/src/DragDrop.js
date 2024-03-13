import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';
import { useImages } from './ImageProvider'
import { Card } from 'react-bootstrap'; 
import { config } from './config'  

const DragDrop = () => {
  const {uploadedImages, setUploadedImages, analyzedImages, setAnalyzedImages, setAnalyzedImageVersion, selectedExecutor, selectedModel } = useImages();
  const [uploadError, setUploadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const onDrop = useCallback((event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files.length) {
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
    
        axios.post(config.backend + '/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => {
          const uploadedImageUrl = response.data.filename;
          setUploadedImages(oldImages => [...oldImages, uploadedImageUrl]);
		  setAnalyzedImageVersion(prevVersion => prevVersion + 1);

	  	  return axios.post(config.backend  + `/analyze`, { filename: uploadedImageUrl, executor: selectedExecutor, model: selectedModel }, {
             headers: {
                'Content-Type': 'application/json',
             },
		  })
        })
        .then(analysisResponse => {
          const analyzedImageUrl = analysisResponse.data.generated_filename;
		  setAnalyzedImageVersion(prevVersion => prevVersion + 1);
		  setRefreshKey(prevKey => prevKey + 1); // Increment the key to force re-render
          setUploadError('');
        })
        .catch(error => {
          console.error('Error processing file:', error);
          setUploadError('Error processing file');
        });
      }
  }, [setUploadedImages, setAnalyzedImages, selectedExecutor, selectedModel]);

  return (
    <Card 
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '20px',
        width: '500px',
        height: '90px',
        padding: '4px',
        textAlign: 'center',
        marginTop: '20px',
        marginBottom: '20px',
      }}
    >
      <Card.Body>
        Drag and drop an image here!
        {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
      </Card.Body>
    </Card>
  );
};

export default DragDrop;
