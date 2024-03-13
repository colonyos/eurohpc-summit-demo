import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { ImageContext } from './ImageProvider'; 
import { config } from './config'  

class ModelDropdown extends Component {
  static contextType = ImageContext;

  constructor(props) {
    super(props);
    this.state = {
      models: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetch(config.backend + '/models', {
  		headers: {
   	 		'Accept': 'application/json',
  		},
	})
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }
        return response.json();
      })
      .then(data => { 
		  console.log("data:", data)
		  this.setState({ models: data, isLoading: false })
	  })
      .catch(error => {
		  console.error("Fetch error:", error);
		  this.setState({ error, isLoading: false });
	  })
  }

  handleSelect = (modelName) => {
    const { setSelectedModel } = this.context;
    setSelectedModel(modelName); 

  };

  render() {
    const { models, isLoading, error } = this.state;
    const { selectedModel } = this.context;

    return (
      <Dropdown onSelect={this.handleSelect}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {selectedModel}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {isLoading && <Dropdown.Item disabled>Loading models...</Dropdown.Item>}
          {error && <Dropdown.Item disabled>Error loading models</Dropdown.Item>}
          {!isLoading && !error && models.map((modelName, index) => (
            <Dropdown.Item key={index} eventKey={modelName}>
              {modelName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

}

export default ModelDropdown;
