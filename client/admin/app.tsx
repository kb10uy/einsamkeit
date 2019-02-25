import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import TopBar from './components/top-bar';

export default () => (
  <BrowserRouter>
    <div>
      <TopBar />
      <Route />
      <Route />
      <Route />
    </div>
  </BrowserRouter>
);
