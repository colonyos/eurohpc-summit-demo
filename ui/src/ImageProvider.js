import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';

export const ImageContext = createContext();
export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analyzedImageVersion, setAnalyzedImageVersion] = useState(0); 

  return (
    <ImageContext.Provider value={{ uploadedImages, setUploadedImages, analyzedImageVersion, setAnalyzedImageVersion }}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageProvider;
