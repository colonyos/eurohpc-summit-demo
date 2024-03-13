import './App.css';
import DragDrop from './DragDrop';
import {ImageProvider} from './ImageProvider';
import ImageList from './ImageList';
import ExecutorDropdown from './ExecutorDropdown';
import ModelDropdown from './ModelDropdown';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
	  	<ImageProvider>
  	    	<div className="container text-center" style={{ marginTop: '20px' }}> 
               <div className="row justify-content-center">
                 <div className="col-auto"> 
                   <div>Executor</div>
                   <ExecutorDropdown/>
                 </div>
                 <div className="col-auto">
                   <div style={{ width: '20px' }}></div>
                 </div>
                 <div className="col-auto"> 
                   <div>Model</div>
                   <ModelDropdown/>
                 </div>
               </div>
             </div>
    		<DragDrop/>
    		<ImageList/> 
  		</ImageProvider>
      </header>
    </div>
  );
}

export default App;
