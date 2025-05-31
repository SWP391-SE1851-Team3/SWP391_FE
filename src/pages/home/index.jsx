import React from 'react';
import { Typography } from 'antd';
import './Home.css';

const { Title } = Typography;

function HomePage() {
  return (
    <div className="home-page">
      <Title level={1}>Hệ thống Y tế Học đường</Title>
    </div>
  );
}

export default HomePage;