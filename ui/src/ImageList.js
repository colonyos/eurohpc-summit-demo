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
          {({ uploadedImages, analyzedImageVersion }) => (
            <div>
              <div>Water detection jobs</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[...uploadedImages].reverse().map((imageUrl, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <ImageDisplay
                      imageUrl={`http://rocinante:8000/images/${imageUrl}`}
                      refreshKey={analyzedImageVersion} // Pass analyzedImageVersion as refreshKey prop
                    />
                    <ImageDisplay
                      imageUrl={`http://rocinante:8000/generated-images/${imageUrl}`}
                      refreshKey={analyzedImageVersion} // Also pass it here to ensure both images can refresh
                    />
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
  static contextType = ImageContext;

  constructor(props) {
    super(props);
    this.state = {
      firstImageSrc: null,
      firstImageError: false,
      processingDots: '',
    };
  }

  updateProcessingDots = () => {
 	 this.setState(prevState => {
    	const dots = prevState.processingDots;
    	return { processingDots: dots.length < 3 ? dots + '.' : '' };
  	});
  };

  componentDidMount() {
    this.fetchFirstImage();
	this.processingInterval = setInterval(this.updateProcessingDots, 1000);
  }

  componentDidUpdate(prevProps) {
    const { analyzedImageVersion } = this.context; 

    // if (prevProps.imageUrl !== this.props.imageUrl) {
    //   URL.revokeObjectURL(this.state.firstImageSrc); // Revoke the old blob URL
    //   this.fetchFirstImage(); // Fetch the new image
    // }

	if (prevProps.imageUrl !== this.props.imageUrl || prevProps.refreshKey !== this.props.refreshKey) {
        this.fetchFirstImage(); // Trigger the fetch for the new image
    }
  }
  
  componentWillUnmount() {
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
		console.log("XXXXXXXXXXXXXXXXXXXXXXXXX")
        this.setState({ firstImageSrc: URL.createObjectURL(blob), firstImageError: false });
    	clearInterval(this.processingInterval);
      })
      .catch(() => {
        this.setState({ firstImageError: true });
      });
  };

  render() {
      const { firstImageSrc, firstImageError, processingDots } = this.state;
      const { analyzedImageVersion } = this.context; 
   
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
			 <img src={firstImageSrc} style={{ width: '400px', height: '400px'}} />
          )}
        </div>
      );
   }
}

ImageDisplay.contextType = ImageContext;

export default ImageList;
