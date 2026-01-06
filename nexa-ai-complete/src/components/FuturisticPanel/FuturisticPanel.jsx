import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Button, Statistic, Progress, Avatar, List, Tag } from 'antd';
import { 
  RocketOutlined, 
  MessageOutlined, 
  ThunderboltOutlined, 
  SafetyCertificateOutlined,
  WifiOutlined,
  CodeOutlined,
  GlobalOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './FuturisticPanel.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Mock Data for Charts
const data = [
  { name: '00:00', tokens: 400 },
  { name: '04:00', tokens: 300 },
  { name: '08:00', tokens: 600 },
  { name: '12:00', tokens: 800 },
  { name: '16:00', tokens: 500 },
  { name: '20:00', tokens: 900 },
  { name: '24:00', tokens: 700 },
];

const FuturisticPanel = ({ setActiveView }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading futuristic interface
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return (
    <div className="futuristic-container">
      {/* Background Effect */}
      <div className="ambient-glow"></div>
      
      <Layout className="transparent-layout">
        {/* Header Section */}
        <Header className="glass-header">
          <div className="header-content">
            <div className="brand-section">
              <ThunderboltOutlined className="brand-icon" />
              <Title level={4} className="brand-text">NEXA OS <span className="version-tag">v2.5 ALPHA</span></Title>
            </div>
            <div className="user-section">
              <BellOutlined className="icon-btn" />
              <div className="user-profile">
                <Avatar icon={<UserOutlined />} className="user-avatar" />
                <span className="username">Ángel Pipo</span>
                <Tag color="#06b6d4" className="role-tag">ADMIN</Tag>
              </div>
            </div>
          </div>
        </Header>

        <Content className="main-content">
          {/* Welcome Hero */}
          <div className="hero-section">
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={16}>
                <Title level={1} className="hero-title">
                  Bienvenido al <span className="gradient-text">Centro de Comando</span>
                </Title>
                <Text className="hero-subtitle">
                  Sistema Token VM activo. Red neuronal sincronizada. Todos los sistemas operativos.
                </Text>
                <div className="hero-actions">
                  <Button type="primary" size="large" icon={<MessageOutlined />} className="action-btn glow-btn" onClick={() => setActiveView('chat')}>
                    Iniciar Chat IA
                  </Button>
                  <Button size="large" icon={<RocketOutlined />} className="action-btn secondary-btn" onClick={() => setActiveView('network')}>
                    Desplegar Nodo
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="status-card glass-card">
                  <div className="status-header">
                    <WifiOutlined className="status-icon" />
                    <span>Estado del Sistema</span>
                  </div>
                  <div className="status-body">
                    <div className="status-item">
                      <span>CPU Load</span>
                      <Progress percent={45} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} showInfo={false} size="small" />
                    </div>
                    <div className="status-item">
                      <span>Memory</span>
                      <Progress percent={72} strokeColor={{ '0%': '#87d068', '100%': '#fac858' }} showInfo={false} size="small" />
                    </div>
                    <div className="status-item">
                      <span>Network</span>
                      <Progress percent={90} strokeColor={{ '0%': '#108ee9', '100%': '#06b6d4' }} showInfo={false} size="small" />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Dashboard Grid */}
          <Row gutter={[24, 24]} className="dashboard-grid">
            {/* Quick Stats */}
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card glass-card">
                <Statistic title="Tokens Generados" value={12584} prefix={<CodeOutlined />} valueStyle={{ color: '#06b6d4' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card glass-card">
                <Statistic title="Nodos Activos" value={42} prefix={<GlobalOutlined />} valueStyle={{ color: '#87d068' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card glass-card">
                <Statistic title="Seguridad" value="98%" prefix={<SafetyCertificateOutlined />} valueStyle={{ color: '#fac858' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card glass-card">
                <Statistic title="Latencia" value="24ms" prefix={<ThunderboltOutlined />} valueStyle={{ color: '#7c3aed' }} />
              </Card>
            </Col>

            {/* Main Chart Area */}
            <Col xs={24} lg={16}>
              <Card title="Actividad de la Red Neuronal" className="chart-card glass-card" bordered={false}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="tokens" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col xs={24} lg={8}>
              <Card title="Registro de Eventos" className="activity-card glass-card" bordered={false}>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { title: 'Modelo Llama 3.3 Activado', time: 'Hace 2 min', color: 'green' },
                    { title: 'Sincronización Git Exitosa', time: 'Hace 15 min', color: 'blue' },
                    { title: 'Nuevo Nodo Detectado', time: 'Hace 1 hora', color: 'purple' },
                    { title: 'Actualización de Seguridad', time: 'Hace 3 horas', color: 'orange' },
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<div className={`activity-dot dot-${item.color}`}></div>}
                        title={<span className="activity-title">{item.title}</span>}
                        description={<span className="activity-time">{item.time}</span>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </div>
  );
};

export default FuturisticPanel;
