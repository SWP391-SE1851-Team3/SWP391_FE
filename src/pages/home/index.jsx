import React from 'react';
import { Typography, Card, Row, Col, Button, Carousel } from 'antd';
import { MedicineBoxOutlined, TeamOutlined, CalendarOutlined, FileProtectOutlined } from '@ant-design/icons';
import './Home.css';

const { Title, Paragraph } = Typography;

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <Title level={1}>Hệ thống Y tế Học đường</Title>
        <Paragraph className="subtitle">
          Chăm sóc sức khỏe toàn diện cho học sinh
        </Paragraph>
      </div>

      <Carousel autoplay className="carousel-section">
        <div>
          <img src="/images/healthcare1.jpg" alt="Healthcare" />
        </div>
        <div>
          <img src="/images/healthcare2.jpg" alt="Students" />
        </div>
      </Carousel>

      <Row gutter={[24, 24]} className="features-section">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <MedicineBoxOutlined className="feature-icon" />
            <Title level={3}>Khám Sức Khỏe</Title>
            <Paragraph>Định kỳ kiểm tra sức khỏe cho học sinh</Paragraph>
            <Button type="primary">Tìm hiểu thêm</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <TeamOutlined className="feature-icon" />
            <Title level={3}>Đội Ngũ Y Tế</Title>
            <Paragraph>Đội ngũ y bác sĩ chuyên nghiệp</Paragraph>
            <Button type="primary">Xem thông tin</Button>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <CalendarOutlined className="feature-icon" />
            <Title level={3}>Lịch Khám</Title>
            <Paragraph>Đặt lịch khám và tư vấn</Paragraph>
            <Button type="primary">Đặt lịch</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <FileProtectOutlined className="feature-icon" />
            <Title level={3}>Hồ Sơ Y Tế</Title>
            <Paragraph>Quản lý hồ sơ sức khỏe học sinh</Paragraph>
            <Button type="primary">Truy cập</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;