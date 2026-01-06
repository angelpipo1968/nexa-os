import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, Upload, message } from 'antd';
import { SearchOutlined, RobotOutlined, InboxOutlined } from '@ant-design/icons';
import Highlight from 'react-highlight';
import 'highlight.js/styles/atom-one-dark.css';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

function NexaDashboard({ setActiveView }) {
  const [fileList, setFileList] = useState([]);
  const [ocrResult, setOcrResult] = useState('');

  const handleSearch = (value) => {
    console.log('Searching for:', value);
    message.info(`Buscando: ${value}`);
    // Here you could redirect to chat with this query
    if (setActiveView) setActiveView('chat');
  };

  const handleChange = (info) => {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} archivo subido exitosamente.`);
      // Mock OCR process
      setTimeout(() => {
          setOcrResult(`Análisis completado para ${info.file.name}:\n- Texto detectado: "CONFIDENTIAL PROJECT QWEN"\n- Objetos: [Servidor, Cable Ethernet, Taza de Café]\n- Sentimiento: Productivo`);
      }, 1000);
    } else if (status === 'error') {
      message.error(`${info.file.name} falló al subir.`);
    }
    setFileList(info.fileList);
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // Mock upload URL
    onChange: handleChange,
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div className="nexa-panel tech-glow p-8" style={{ height: '100%', overflowY: 'auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card className="header-card" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
          <Space size={24} align="center">
            <RobotOutlined className="text-4xl text-accent" style={{ fontSize: '3rem', color: 'var(--accent)' }} />
            <div>
                <Title level={3} className="text-light" style={{ color: 'var(--text-light)', margin: 0 }}>
                Hola Ángel 👋
                </Title>
                <Paragraph className="text-secondary" style={{ color: 'var(--text-muted)', margin: 0 }}>
                Tu portal de inteligencia artificial avanzada
                </Paragraph>
            </div>
          </Space>
        </Card>

        <Card title={<span style={{ color: 'var(--text-light)' }}>Asistente IA</span>} extra={<SearchOutlined style={{ color: 'var(--accent)' }} />} style={{ background: 'rgba(40, 42, 54, 0.6)', border: '1px solid var(--border)' }} headStyle={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)' }}>
          <Input.Search 
            placeholder="Pregunta sobre Qwen, ipikay o cualquier cosa..." 
            enterButton="Buscar" 
            size="large" 
            onSearch={handleSearch} 
            style={{ marginBottom: '1rem' }}
          /> 
          <Button 
            type="primary" 
            className="btn-accent mt-4" 
            icon={<RobotOutlined />} 
            style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
          > 
            Activar Asistente de Voz 
          </Button> 
        </Card> 

        <Card title={<span style={{ color: 'var(--text-light)' }}>Nuevas Funcionalidades</span>} style={{ background: 'rgba(40, 42, 54, 0.6)', border: '1px solid var(--border)' }} headStyle={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)' }}>
          <ul className="feature-list" style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}> 
            <li style={{ marginBottom: '0.5rem' }}>✓ Configuración IA Multiplataforma</li> 
            <li style={{ marginBottom: '0.5rem' }}>✓ VisionForge Visual Tools</li> 
            <li>✓ Plantillas Qwen3 para Android</li> 
          </ul> 
        </Card> 

        <Card title={<span style={{ color: 'var(--text-light)' }}>Análisis de Imágenes</span>} style={{ background: 'rgba(40, 42, 54, 0.6)', border: '1px solid var(--border)' }} headStyle={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)' }}>
          <Dragger {...uploadProps} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
            <p className="ant-upload-drag-icon"> 
              <InboxOutlined style={{ color: 'var(--accent)' }} /> 
            </p> 
            <p className="ant-upload-text" style={{ color: 'var(--text-muted)' }}>Arrastra imágenes aquí o haz clic para subir</p> 
            <p className="ant-upload-hint" style={{ color: 'var(--text-muted)' }}> 
              Soporta reconocimiento de texto, análisis de alineaciones planetarias, etc. 
            </p> 
          </Dragger> 
          {ocrResult && ( 
            <div className="ocr-result mt-3" style={{ marginTop: '1rem' }}> 
              <Highlight className="plaintext">{ocrResult}</Highlight> 
            </div> 
          )} 
        </Card> 
      </Space> 
    </div> 
  ); 
}

export default NexaDashboard;
