import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import MusicPlayer from './components/MusicPlayer'
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MusicPlayer />, document.getElementById('root'));
registerServiceWorker();
