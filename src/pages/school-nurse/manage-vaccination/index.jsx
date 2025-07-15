import React, { useState } from 'react';
import { 
  CalendarOutlined, 
  SafetyOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  LineChartOutlined, 
  BellOutlined,
  RightOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
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
  Avatar,
  Statistic,
  Tag,
  Divider
} from 'antd';
import VaccinationScheduleManager from './vaccination-batch';
import ConsentManagement from './consent-management';
import VaccinationRecords from './vaccination-records';
import PostVaccinationObservation from './post-vaccination';
import './Manage-Vaccination.css';
const { Title, Text } = Typography;

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');


  const dashboardStats = {
    totalSchedules: 15,
    pendingConsents: 48,
    completedVaccinations: 234,
    activeObservations: 12
  };

  const recentActivities = [
    {
      id: 1,
      type: 'schedule',
      title: 'Đợt tiêm COVID-19 đã được tạo',
      time: '2 giờ trước',
      status: 'pending'
    },
    {
      id: 2,
      type: 'consent',
      title: '15 phụ huynh đã xác nhận đồng ý',
      time: '4 giờ trước',
      status: 'approved'
    },
    {
      id: 3,
      type: 'vaccination',
      title: 'Hoàn thành tiêm cho 25 học sinh',
      time: '1 ngày trước',
      status: 'completed'
    }
  ];

  const upcomingSchedules = [
    {
      id: 1,
      vaccine: 'COVID-19 Pfizer',
      date: '2025-06-15',
      location: 'Phòng y tế trường',
      studentsCount: 45,
      status: 'confirmed'
    },
    {
      id: 2,
      vaccine: 'Cúm mùa',
      date: '2025-06-20',
      location: 'Phòng y tế trường',
      studentsCount: 38,
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
    <div className="vaccination-wrapper">
      {/* Header */}
     

      {/* Main Content */}
      <main className="vaccination-main">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="vaccination-tabs"
          items={[
            {
              key: 'dashboard',
              label: 'Tổng quan',
            },
            {
              key: 'schedule',
              label: 'Đợt tiêm',
            },
            {
              key: 'consent',
              label: 'Phiếu đồng ý',
            },
            {
              key: 'records',
              label: 'Kết quả tiêm',
            },
            {
              key: 'observation',
              label: 'Theo dõi',
            }
          ]}
        />

        {activeTab === 'dashboard' && (
          <div className="vaccination-dashboard-flex">
            {/* Statistics Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng đợt tiêm"
                    value={dashboardStats.totalSchedules}
                    prefix={<CalendarOutlined className="vaccination-card-primary" />}
                    valueStyle={{ color: undefined }}
                  />
                  <Text type="secondary">+2 từ tháng trước</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Phiếu chờ duyệt"
                    value={dashboardStats.pendingConsents}
                    prefix={<FileTextOutlined className="vaccination-card-secondary" />}
                    valueStyle={{ color: undefined }}
                  />
                  <Text type="secondary">Cần xử lý</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Đã tiêm"
                    value={dashboardStats.completedVaccinations}
                    prefix={<CheckCircleOutlined className="vaccination-card-success" />}
                    valueStyle={{ color: undefined }}
                  />
                  <Text type="secondary">Học sinh đã tiêm</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Đang theo dõi"
                    value={dashboardStats.activeObservations}
                    prefix={<LineChartOutlined className="vaccination-card-processing" />}
                    valueStyle={{ color: undefined }}
                  />
                  <Text type="secondary">Phản ứng sau tiêm</Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              {/* Recent Activities */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined className="vaccination-activity-icon" />
                      Hoạt động gần đây
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {recentActivities.map((activity) => (
                      <Card key={activity.id} size="small" className="vaccination-card-bg">
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

              {/* Upcoming Schedules */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined className="vaccination-schedule-icon" />
                      Lịch tiêm sắp tới
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {upcomingSchedules.map((schedule) => (
                      <Card key={schedule.id} size="small" hoverable>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{schedule.vaccine}</Text>
                            <Tag color={getStatusColor(schedule.status)}>
                              {getStatusText(schedule.status)}
                            </Tag>
                          </div>
                          <Space direction="vertical" size="small">
                            <Text type="secondary">📅 Ngày: {schedule.date}</Text>
                            <Text type="secondary">📍 Địa điểm: {schedule.location}</Text>
                            <Text type="secondary">👥 Số học sinh: {schedule.studentsCount}</Text>
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

        {activeTab === 'schedule' && <VaccinationScheduleManager />}
        {activeTab === 'consent' && <ConsentManagement />}
        {activeTab === 'records' && <VaccinationRecords />}
        {activeTab === 'observation' && <PostVaccinationObservation />}
      </main>
    </div>
  );
};

export default Index; 