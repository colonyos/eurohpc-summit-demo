import './App.css';
import DragDrop from './DragDrop';
import {ImageProvider} from './ImageProvider';
import ImageList from './ImageList';
import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
	  	<ImageProvider>
    		<DragDrop/>
    		<ImageList/> 
  		</ImageProvider>
      </header>
    </div>
  );
}

export default App;
