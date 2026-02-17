import React, { useState } from 'react';
import '../cscc/App.css';
import '../cscc/Root.css';
import '../cscc/Media.css';
import DateHistory from './DateHistory';
import CircleName from "./CircleName";

const App: React.FC = () => {
  return (
    <div className="app">
        <div className="border-line">
            <DateHistory />
            <CircleName />
        </div>
    </div>
  );
};

export default App;