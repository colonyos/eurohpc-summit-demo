import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { ImageContext } from './ImageProvider'; 
import { config } from './config'  

class ExecutorDropdown extends Component {
  static contextType = ImageContext;

  constructor(props) {
    super(props);
    this.state = {
      executors: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetch(config.backend  + '/executors', {
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
		  this.setState({ executors: data, isLoading: false })
	  })
      .catch(error => {
		  console.error("Fetch error:", error);
		  this.setState({ error, isLoading: false });
	  })
  }

  handleSelect = (executorName) => {
    const { setSelectedExecutor } = this.context;
    setSelectedExecutor(executorName); 

  };

  render() {
    const { executors, isLoading, error } = this.state;
    const { selectedExecutor } = this.context;

    return (
      <Dropdown onSelect={this.handleSelect}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {selectedExecutor}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {isLoading && <Dropdown.Item disabled>Loading executors...</Dropdown.Item>}
          {error && <Dropdown.Item disabled>Error loading executors</Dropdown.Item>}
          {!isLoading && !error && executors.map((executorName, index) => (
            <Dropdown.Item key={index} eventKey={executorName}>
              {executorName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

}

export default ExecutorDropdown;
