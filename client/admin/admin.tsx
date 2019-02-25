import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

const appElement = document.getElementById('app');
if (!appElement) throw new Error('Root element not found');
ReactDOM.render(<App />, appElement);
