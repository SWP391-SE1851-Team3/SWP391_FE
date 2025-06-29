import React from 'react';
import { Typography, Card, Row, Col, Button, Carousel } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  AlertOutlined
} from '@ant-design/icons';
import './ManagerPage.css';

const { Title, Paragraph } = Typography;

function ManagerPage() {
  return (
    <div className="manager-page">
      <div className="hero-section">
        <Title level={1}>Hệ thống Quản lý Y tế Học đường</Title>
        <Paragraph className="subtitle">
          Quản lý toàn diện hoạt động y tế trường học
        </Paragraph>
      </div>

      <Carousel autoplay className="carousel-section">
        <div>
          <img src="/images/management1.jpg" alt="Healthcare Management" />
        </div>
        <div>
          <img src="/images/management2.jpg" alt="Health Statistics" />
        </div>
        <div>
          <img src="/images/management3.jpg" alt="Medical Team" />
        </div>
      </Carousel>

      <Row gutter={[24, 24]} className="features-section">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <DashboardOutlined className="feature-icon" />
            <Title level={3}>Bảng Điều Khiển</Title>
            <Paragraph>Tổng quan tình hình y tế toàn trường</Paragraph>
            <Button type="primary">Xem chi tiết</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <UserOutlined className="feature-icon" />
            <Title level={3}>Quản Lý Học Sinh</Title>
            <Paragraph>Theo dõi hồ sơ sức khỏe học sinh</Paragraph>
            <Button type="primary">Quản lý</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <BarChartOutlined className="feature-icon" />
            <Title level={3}>Báo Cáo Thống Kê</Title>
            <Paragraph>Phân tích dữ liệu sức khỏe và xu hướng</Paragraph>
            <Button type="primary">Xem báo cáo</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <TeamOutlined className="feature-icon" />
            <Title level={3}>Quản Lý Nhân Sự</Title>
            <Paragraph>Điều phối đội ngũ y tế trường học</Paragraph>
            <Button type="primary">Quản lý nhân sự</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <CalendarOutlined className="feature-icon" />
            <Title level={3}>Lịch Hoạt Động</Title>
            <Paragraph>Quản lý lịch khám và hoạt động y tế</Paragraph>
            <Button type="primary">Xem lịch</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <FileTextOutlined className="feature-icon" />
            <Title level={3}>Tài Liệu Y Tế</Title>
            <Paragraph>Quản lý quy trình và tài liệu chuyên môn</Paragraph>
            <Button type="primary">Truy cập</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <AlertOutlined className="feature-icon" />
            <Title level={3}>Cảnh Báo Y Tế</Title>
            <Paragraph>Theo dõi các trường hợp cần chú ý đặc biệt</Paragraph>
            <Button type="primary">Xem cảnh báo</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <SettingOutlined className="feature-icon" />
            <Title level={3}>Cài Đặt Hệ Thống</Title>
            <Paragraph>Cấu hình và tùy chỉnh hệ thống</Paragraph>
            <Button type="primary">Cấu hình</Button>
          </Card>
        </Col>
      </Row>

      <div className="stats-section">
        <Title level={2}>Thống Kê Tổng Quan</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card className="stat-card">
              <div className="stat-number">1,245</div>
              <div className="stat-label">Tổng số học sinh</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stat-card">
              <div className="stat-number">42</div>
              <div className="stat-label">Lượt khám hôm nay</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stat-card">
              <div className="stat-number">98.5%</div>
              <div className="stat-label">Tỷ lệ sức khỏe tốt</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">Đội ngũ y tế</div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ManagerPage;