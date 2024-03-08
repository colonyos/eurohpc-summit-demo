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
                    <div>Water detection jobs</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}> {/* Container for all image pairs */}
                        {[...uploadedImages].reverse().map((imageUrl, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}> {/* Container for each image pair */}
                                <ImageDisplay imageUrl={`http://rocinante:8000/images/${imageUrl}`} />
                                <ImageDisplay imageUrl={`http://rocinante:8000/generated-images/${imageUrl}`} />
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
      processingDots: '',
    };
    this.retryInterval = null; // Initialize a variable for the retry interval
  }

  updateProcessingDots = () => {
 	 this.setState(prevState => {
    	const dots = prevState.processingDots;
    	return { processingDots: dots.length < 3 ? dots + '.' : '' }; // Cycle from '' to '...' and back
  	});
  };

  componentDidMount() {
    this.fetchFirstImage();
	this.processingInterval = setInterval(this.updateProcessingDots, 1000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.imageUrl !== this.props.imageUrl) {
      this.clearRetryInterval();
      this.fetchFirstImage();
    }
  }

  componentWillUnmount() {
    this.clearRetryInterval();
    clearInterval(this.processingInterval);
  }

  fetchFirstImage = () => {
    fetch(`${this.props.imageUrl}`)
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
      const { firstImageSrc, firstImageError, processingDots } = this.state;
    
      return (
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px' }}>
          {firstImageError ? (
            <div style={{ width: '400px', height: '400px', border: '2px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>Processing</p>
                <p style={{ margin: 0, height: '20px' }}>&nbsp;{processingDots}</p>
              </div>
            </div>
          ) : (
            <img src={firstImageSrc} alt="Uploaded" style={{ maxWidth: '400px' }} />
          )}
        </div>
      );
   }
}

export default ImageList;
