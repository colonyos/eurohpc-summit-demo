import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';
import { useImages } from './ImageProvider'

const ImageList = () => {
  const { uploadedImages, setUploadedImages } = useImages(); // Using global state

  useEffect(() => {
    const intervalId = setInterval(() => {
	  console.log('Fetching images');
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
	  hrehhre
      {uploadedImages.map((imageUrl, index) => (
        <ImageDisplay key={`${imageUrl}_${index}`} imageUrl={imageUrl} datapiplineUrl={`res_${imageUrl}`} />
      ))}
    </div>
  );
};

const ImageDisplay = ({ imageUrl, datapiplineUrl }) => {
  const [firstImageError, setFirstImageError] = useState(false);
  const [secondImageLoaded, setSecondImageLoaded] = useState(false);
  const [secondImageError, setSecondImageError] = useState(false);

  console.log(imageUrl, datapiplineUrl)	

  const handleFirstImageError = () => {
    setFirstImageError(true);
  };

  const handleSecondImageLoad = () => {
    setSecondImageLoaded(true);
    setSecondImageError(false); // Reset error state in case of successful load
  };

  const handleSecondImageError = () => {
    setSecondImageError(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {firstImageError ? (
        <div style={{ width: '300px', height: '200px', margin: '10px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Image not available</p>
        </div>
      ) : (
        <img
          src={`http://rocinante:8000/uploads/${imageUrl}`}
          alt="Uploaded"
          onError={handleFirstImageError}
          style={{ maxWidth: '300px', margin: '10px' }}
        />
      )}
      {secondImageError ? (
        <div style={{ width: '300px', height: '200px', margin: '10px', border: '2px dashed gray', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Processing...</p>
        </div>
      ) : (
        <img
          src={`http://rocinante:8000/uploads/${datapiplineUrl}`}
          alt="Processed"
          onLoad={handleSecondImageLoad}
          onError={handleSecondImageError}
          style={{
            maxWidth: '300px',
            margin: '10px',
            display: secondImageLoaded ? 'block' : 'none' // Initially hide the second image
          }}
        />
      )}
    </div>
  );
};

export default ImageList;
