import React from 'react';
import { Typography, Card, Row, Col, Space } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import './HomePage.css';

import anh01 from '../../assets/images/anh_01.jpg';
import anh02 from '../../assets/images/anh_02.jpg';
import anh03 from '../../assets/images/anh_03.jpg';
import a1 from '../../assets/images/anh_04.jpg';
import a2 from '../../assets/images/anh_05.jpg';
import a3 from '../../assets/images/anh_06.jpg';
import a4 from '../../assets/images/anh_07.jpg';
import video1 from '../../assets/video/video1.mp4';
import a5 from '../../assets/images/anh_08.jpg';
import a6 from '../../assets/images/anh_09.jpg';


const { Title, Paragraph } = Typography;

function HomePage() {
  const features = [
    {
      icon: <UserOutlined />,
      title: 'Khám sức khỏe định kỳ',
      description: 'Thực hiện khám sức khỏe định kỳ cho học sinh, phát hiện sớm các vấn đề sức khỏe',
      image: anh01,
    },
    {
      icon: <MedicineBoxOutlined />,
      title: 'Sơ cứu & Cấp cứu',
      description: 'Trang bị đầy đủ thiết bị y tế, sẵn sàng xử lý các tình huống cấp cứu tại trường',
      image: anh02,
    },
    {
      icon: <CalendarOutlined />,
      title: 'Tiêm chủng phòng bệnh',
      description: 'Triển khai chương trình tiêm chủng đầy đủ theo quy định của Bộ Y tế',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      icon: <BarChartOutlined />,
      title: 'Theo dõi phát triển',
      description: 'Giám sát chiều cao, cân nặng và sự phát triển thể chất của học sinh',
      image: anh03,
    },
  ];

  const benefits = [
    {
      icon: <SafetyCertificateOutlined />,
      title: 'Phát hiện sớm bệnh tật',
      description: 'Khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề về thị lực, thính lực, dinh dưỡng',
    },
    {
      icon: <TeamOutlined />,
      title: 'Môi trường học tập an toàn',
      description: 'Đảm bảo môi trường học tập lành mạnh, phòng chống dịch bệnh trong trường học',
    },
    {
      icon: <FileTextOutlined />,
      title: 'Hợp tác với gia đình',
      description: 'Kết nối chặt chẽ với phụ huynh trong việc chăm sóc và theo dõi sức khỏe con em',
    },
  ];

  const stats = [
    {
      number: '5,000+',
      text: 'Học sinh được chăm sóc sức khỏe',
      image: a4,
    },
    {
      number: '25+',
      text: 'Trường học có phòng y tế chuẩn',
      image: 'https://hanam-school.fpt.edu.vn/wp-content/uploads/y-te-3-1024x652.jpg',
    },
    {
      number: '95%',
      text: 'Tỷ lệ tiêm chủng đầy đủ',
      image: a5,
    },
    {
      number: '24/7',
      text: 'Đội ngũ y tế sẵn sàng hỗ trợ',
      image: a6,
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <Title level={1} className="hero-title">
              Hệ thống Quản lý Y tế Học đường
            </Title>
            <Paragraph className="subtitle">
              Giải pháp toàn diện cho quản lý sức khỏe và y tế trong môi trường giáo dục.
              Bảo vệ và chăm sóc sức khỏe học sinh một cách chuyên nghiệp và hiệu quả.
            </Paragraph>
          </div>
          <div className="hero-image">
            <video
              autoPlay
              muted
              loop
              controls
              className="hero-video"
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            >
              <source src={video1} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <Title level={2}>Dịch vụ Y tế Học đường</Title>
        <Row gutter={[24, 24]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                className="feature-card"
                bordered={false}
                hoverable
                cover={<img alt={feature.title} src={feature.image} className="feature-image" />}
              >
                <div className="feature-icon">{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <Title level={2} className="section-title">Hình ảnh Y tế Học đường</Title>
        <Row gutter={[16, 16]}>
          {[a1, a2, a3].map((src, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <img src={src} alt={`Gallery ${i + 1}`} className="gallery-image" />
            </Col>
          ))}
        </Row>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <Title level={2}>Tầm quan trọng của Y tế Học đường</Title>
        <Row gutter={[48, 24]} align="middle">
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large">
              {benefits.map((benefit, i) => (
                <div className="benefit-item" key={i}>
                  <div className="benefit-icon">{benefit.icon}</div>
                  <div>
                    <Title level={4}>{benefit.title}</Title>
                    <Paragraph>{benefit.description}</Paragraph>
                  </div>
                </div>
              ))}
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <div className="benefits-image">
              <img
                src="https://wp02-media.cdn.ihealthspot.com/wp-content/uploads/sites/459/2023/05/AIDET.png"
                alt="Y tế học đường"
                className="benefits-img"
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <Title level={2} className="section-title">Thành tích Y tế Học đường</Title>
        <Row gutter={[24, 24]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card
                className="stats-card"
                hoverable
                cover={
                  <img
                    alt={`Thống kê ${index + 1}`}
                    src={stat.image}
                    className="stats-image"
                  />
                }
              >
                <Title level={3} className="stats-number">{stat.number}</Title>
                <Paragraph>{stat.text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <Card className="cta-card" hoverable>
          <Title level={2}>Cùng xây dựng môi trường học tập khỏe mạnh</Title>
          <Paragraph className="cta-description">
            Hãy để chúng tôi đồng hành cùng nhà trường trong việc chăm sóc và bảo vệ sức khỏe của các em học sinh.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;