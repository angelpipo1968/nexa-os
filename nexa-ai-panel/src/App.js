import React from 'react';
import NexaPanel from './components/NexaPanel';
import './styles.css';

function App() {
  const config = {
    theme: 'futurista',
    modules: ['chat', 'asistente', 'herramientas'],
    colors: {
      primary: '#0ff0fc',
      secondary: '#9600ff',
      background: '#0a0a1a'
    }
  };

  return (
    <div className="App">
      <NexaPanel config={config} />
    </div>
  );
}

export default App;