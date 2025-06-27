import React, { useState } from 'react';
import {
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Badge,
  Tabs,
  Typography,
  Row,
  Col,
  Space,
  Statistic,
  Tag
} from 'antd';
import HealthCheckBatch from './health-check-batch';
//import HealthCheckConsent from './health-check-consent';



const { Text } = Typography;

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for dashboard (health check context)
  const dashboardStats = {
    totalBatches: 8,
    pendingConsents: 32,
    completedChecks: 180,
    activeConsultations: 5
  };

  const recentActivities = [
    {
      id: 1,
      type: 'batch',
      title: 'Đợt khám sức khỏe tổng quát đã được tạo',
      time: '1 giờ trước',
      status: 'pending'
    },
    {
      id: 2,
      type: 'consent',
      title: '10 phụ huynh đã xác nhận đồng ý khám',
      time: '3 giờ trước',
      status: 'approved'
    },
    {
      id: 3,
      type: 'check',
      title: 'Hoàn thành khám cho 20 học sinh',
      time: '1 ngày trước',
      status: 'completed'
    }
  ];

  const upcomingBatches = [
    {
      id: 1,
      name: 'Khám sức khỏe định kỳ',
      date: '2025-06-18',
      location: 'Phòng y tế trường',
      studentsCount: 40,
      status: 'confirmed'
    },
    {
      id: 2,
      name: 'Khám mắt học sinh',
      date: '2025-06-25',
      location: 'Phòng y tế trường',
      studentsCount: 35,
      status: 'pending'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'completed': return 'processing';
      case 'confirmed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'approved': return 'Đã phê duyệt';
      case 'completed': return 'Hoàn thành';
      case 'confirmed': return 'Đã xác nhận';
      default: return status;
    }
  };

  return (
    <div className="health-check-wrapper">
      {/* Main Content */}
      <main className="health-check-main">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="health-check-tabs"
          items={[
            {
              key: 'dashboard',
              label: 'Tổng quan',
            },
            {
              key: 'batch',
              label: 'Đợt khám',
            },
            {
              key: 'consent',
              label: 'Phiếu đồng ý khám',
            },
            {
              key: 'record',
              label: 'Kết quả khám',
            },
            {
              key: 'consultation',
              label: 'Tư vấn sau khám',
            }
          ]}
        />
{activeTab === 'dashboard' && (
          <div className="health-check-dashboard-flex">
            {/* Statistics Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng đợt khám"
                    value={dashboardStats.totalBatches}
                    prefix={<CalendarOutlined className="health-check-card-primary" />}
                  />
                  <Text type="secondary">+1 từ tháng trước</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Phiếu chờ duyệt"
                    value={dashboardStats.pendingConsents}
                    prefix={<FileTextOutlined className="health-check-card-secondary" />}
                  />
                  <Text type="secondary">Cần xử lý</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Đã khám"
                    value={dashboardStats.completedChecks}
                    prefix={<CheckCircleOutlined className="health-check-card-success" />}
                  />
                  <Text type="secondary">Học sinh đã khám</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tư vấn sau khám"
                    value={dashboardStats.activeConsultations}
                    prefix={<LineChartOutlined className="health-check-card-processing" />}
                  />
                  <Text type="secondary">Đang theo dõi</Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              {/* Recent Activities */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined className="health-check-activity-icon" />
                      Hoạt động gần đây
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {recentActivities.map((activity) => (
                      <Card key={activity.id} size="small" className="health-check-card-bg">
                        <Space align="start">
                          <Badge status={getStatusColor(activity.status)} />
                          <div>
                            <Text strong>{activity.title}</Text>
                            <br />
                            <Text type="secondary">{activity.time}</Text>
                          </div>
                          <Tag color={getStatusColor(activity.status)}>
                            {getStatusText(activity.status)}
</Tag>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </Card>
              </Col>

              {/* Upcoming Health Check Batches */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined className="health-check-schedule-icon" />
                      Lịch khám sắp tới
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {upcomingBatches.map((batch) => (
                      <Card key={batch.id} size="small" hoverable>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{batch.name}</Text>
                            <Tag color={getStatusColor(batch.status)}>
                              {getStatusText(batch.status)}
                            </Tag>
                          </div>
                          <Space direction="vertical" size="small">
                            <Text type="secondary">📅 Ngày: {batch.date}</Text>
                            <Text type="secondary">📍 Địa điểm: {batch.location}</Text>
                            <Text type="secondary">👥 Số học sinh: {batch.studentsCount}</Text>
                          </Space>
                          <Button icon={<EyeOutlined />} block>
                            Xem chi tiết
                          </Button>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === 'batch' && <HealthCheckBatch />}
        {activeTab === 'consent' && <HealthCheckConsent />}
        {activeTab === 'record' && <HealthCheckRecord />}
        {activeTab === 'consultation' && <HealthConsultation />}
      </main>
    </div>
  );
};

export default Index;