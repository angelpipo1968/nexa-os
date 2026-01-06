'use client';

import NexaPanel from '../components/NexaPanel';
import './nexa-panel.css';

const config = { 
  theme: 'futurista', 
  modules: ['chat', 'asistente', 'herramientas'], 
  colors: { 
    primary: '#0ff0fc', 
    secondary: '#9600ff', 
    background: '#0a0a1a' 
  } 
};

export default function Home() {
  return <NexaPanel config={config} />;
}