import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, Upload, message } from 'antd';
import { SearchOutlined, RobotOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Highlight from 'react-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { nexaConfig } from './config';
import './theme.css';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * Nexa AI Panel Template
 * Un componente listo para usar que implementa la interfaz premium de Nexa.
 */
export default function NexaDashboardTemplate() {
  const [ocrResult, setOcrResult] = useState('');

  const handleSearch = (value) => {
    message.info(`Buscando en la base de conocimientos: ${value}`);
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} analizado correctamente.`);
        setTimeout(() => {
          setOcrResult(`Análisis completado para ${info.file.name}:\n- Texto detectado: "PROYECTO CONFIDENCIAL"\n- Confianza: 98.5%\n- Clasificación: Documento Técnico`);
        }, 1000);
      }
    },
  };

  return (
    <div className="nexa-template-container">
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Welcome Card */}
        <div className="nexa-card">
          <div className="nexa-card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <RobotOutlined style={{ fontSize: '3rem', color: nexaConfig.theme.colors.accent }} />
            <div>
              <Title level={2} style={{ color: nexaConfig.theme.colors.textLight, margin: 0 }}>
                Hola {nexaConfig.user.name} 👋
              </Title>
              <Paragraph style={{ color: 'rgba(248,248,242,0.6)', margin: 0, fontSize: '1.1rem' }}>
                {nexaConfig.user.welcomeMessage}
              </Paragraph>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="nexa-card">
          <div className="nexa-card-header">
            <SearchOutlined style={{ color: nexaConfig.theme.colors.accent }} />
            Asistente IA
          </div>
          <div className="nexa-card-body">
            <Input.Search 
              placeholder={nexaConfig.assistant.placeholder}
              enterButton="Buscar" 
              size="large" 
              onSearch={handleSearch}
              className="nexa-search"
            />
            {nexaConfig.assistant.voiceEnabled && (
              <Button className="nexa-btn" style={{ marginTop: '1rem' }} icon={<RobotOutlined />}>
                Activar Voz
              </Button>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="nexa-card">
          <div className="nexa-card-header">
            <CheckCircleOutlined style={{ color: nexaConfig.theme.colors.accent }} />
            Funcionalidades Activas
          </div>
          <div className="nexa-card-body">
            <ul className="feature-list">
              {nexaConfig.features.map(feature => (
                <li key={feature.id} className="feature-item">
                  <span style={{ color: nexaConfig.theme.colors.success }}>✓</span> {feature.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Image Analysis */}
        <div className="nexa-card">
          <div className="nexa-card-header">
            <InboxOutlined style={{ color: nexaConfig.theme.colors.accent }} />
            Análisis de Imágenes (VisionForge)
          </div>
          <div className="nexa-card-body">
            <Dragger {...uploadProps} style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${nexaConfig.theme.colors.border}` }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: nexaConfig.theme.colors.accent }} />
              </p>
              <p className="ant-upload-text" style={{ color: nexaConfig.theme.colors.textLight }}>
                {nexaConfig.upload.text}
              </p>
              <p className="ant-upload-hint" style={{ color: 'rgba(248,248,242,0.5)' }}>
                {nexaConfig.upload.hint}
              </p>
            </Dragger>
            {ocrResult && (
              <div className="code-display">
                <Highlight className="plaintext">{ocrResult}</Highlight>
              </div>
            )}
          </div>
        </div>

      </Space>
    </div>
  );
}
