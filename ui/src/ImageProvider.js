import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';

export const ImageContext = createContext();
export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analyzedImageVersion, setAnalyzedImageVersion] = useState(0); 
  const [selectedExecutor, setSelectedExecutor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  return (
    <ImageContext.Provider value={{ uploadedImages, setUploadedImages, analyzedImageVersion, setAnalyzedImageVersion, selectedExecutor, setSelectedExecutor, selectedModel, setSelectedModel }}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageProvider;
