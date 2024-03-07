import React, { useState, useEffect, useCallback, useContext, createContext, Component } from 'react';
import axios from 'axios';
import { ImageContext } from './ImageProvider'

class ImageList extends Component {
  static contextType = ImageContext;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
        <ImageContext.Consumer>
            {({ uploadedImages }) => (
                <div>
                    <div>Image List Here</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}> {/* Container for all image pairs */}
                        {uploadedImages.map((imageUrl, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}> {/* Container for each image pair */}
                                <ImageDisplay imageUrl={imageUrl} dataPipelineUrl={`res_${imageUrl}`} />
                                <ImageDisplay imageUrl={`res_${imageUrl}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ImageContext.Consumer>
    );
  }
}

class ImageDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstImageSrc: null,
      firstImageError: false,
    };
    this.retryInterval = null; // Initialize a variable for the retry interval
  }

  componentDidMount() {
    this.fetchFirstImage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.imageUrl !== this.props.imageUrl) {
      this.clearRetryInterval();
      this.fetchFirstImage();
    }
  }

  componentWillUnmount() {
    this.clearRetryInterval();
  }

  fetchFirstImage = () => {
    fetch(`http://rocinante:8000/uploads/${this.props.imageUrl}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        this.setState({ firstImageSrc: URL.createObjectURL(blob), firstImageError: false });
        this.clearRetryInterval(); // Clear the retry interval on successful fetch
      })
      .catch(() => {
        this.setState({ firstImageError: true });
        this.setRetryInterval(); // Set up an interval to retry fetching the image
      });
  };

  setRetryInterval = () => {
    if (!this.retryInterval) {
      this.retryInterval = setInterval(this.fetchFirstImage, 1000); // Retry every second
    }
  };

  clearRetryInterval = () => {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  };

  render() {
    const { firstImageSrc, firstImageError } = this.state;

    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px' }}>
        {firstImageError ? (
          <div style={{ width: '300px', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Image not available</p>
          </div>
        ) : (
          <img src={firstImageSrc} alt="Uploaded" style={{ maxWidth: '300px' }} />
        )}
      </div>
    );
  }
}


class ImageDisplayOld extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstImageSrc: null,
      firstImageError: false,
    };
  }

  componentDidMount() {
    this.fetchFirstImage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.imageUrl !== this.props.imageUrl) {
      this.fetchFirstImage();
    }
  }

  fetchFirstImage = () => {
    fetch(`http://rocinante:8000/uploads/${this.props.imageUrl}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        this.setState({ firstImageSrc: URL.createObjectURL(blob), firstImageError: false });
      })
      .catch(() => {
        this.setState({ firstImageError: true });
      });
  };

  render() {
     const { firstImageSrc, firstImageError } = this.state;
   
     return (
       <div style={{ display: 'flex', alignItems: 'center', margin: '10px' }}> {/* Flex container for each pair of images */}
         {firstImageError ? (
           <div style={{ width: '300px', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <p>Image not available</p>
           </div>
         ) : (
           <img src={firstImageSrc} alt="Uploaded" style={{ maxWidth: '300px' }} />
         )}
       </div>
     );
  }

}

export default ImageList;
