import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Timeline,
  Row,
  Col,
  Pagination,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import './Medication.css';

const { Title } = Typography;
const { Option } = Select;

const MedicationManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Sample data for the table
  const data = [
    {
      key: '1',
      student: 'Nguyễn Văn A - Lớp 1A',
      medication: 'Paracetamol',
      status: 'pending',
      time: '09:40 AM, 24/05/2025',
      actions: ['view', 'confirm', 'cancel']
    },
    {
      key: '2',
      student: 'Nguyễn Thị B - Lớp 2B',
      medication: 'Vitamin C',
      status: 'pending',
      time: '08:30 AM, 24/05/2025',
      actions: ['view', 'confirm', 'cancel']
    },
    {
      key: '3',
      student: 'Trần Văn C - Lớp 1B',
      medication: 'Thuốc nhỏ mắt',
      status: 'confirmed',
      time: '15:20 PM, 23/05/2025',
      actions: ['view']
    },
    {
      key: '4',
      student: 'Lê Thị D - Lớp 2A',
      medication: 'Thuốc ho',
      status: 'expired',
      time: '10:15 AM, 23/05/2025',
      actions: ['view']
    }
  ];

  // Timeline data for today's schedule
  const timelineData = [
    {
      time: '12:00 PM',
      student: 'Nguyễn Văn A',
      medication: 'Paracetamol - 1 viên sau bữa trua',
      status: 'completed',
      color: 'green'
    },
    {
      time: '09:00 AM',
      student: 'Trần Văn C',
      medication: 'Thuốc nhỏ mắt - 1 giọt mỗi mắt sau bữa sáng',
      status: 'completed',
      color: 'gray'
    },
    {
      time: '15:00 PM',
      student: 'Nguyễn Thị B',
      medication: 'Vitamin C - 1 viên sau bữa chiều',
      status: 'completed',
      color: 'green'
    },
    {
      time: '16:00 PM',
      student: 'Phạm Văn D',
      medication: 'Kháng sinh - 1 viên sau bữa tối',
      status: 'uncompleted',
      color: 'red'
    }
  ];

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case 'confirmed':
        return <Tag color="green">Đã xác nhận</Tag>;
      case 'expired':
        return <Tag color="red">Đã từ chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getActionButtons = (record) => {
    return (
      <Space>
        <Button icon={<EyeOutlined />} size="small" />
        {record.actions.includes('confirm') && (
          <Button icon={<CheckOutlined />} size="small" type="primary" />
        )}
        {record.actions.includes('cancel') && (
          <Button icon={<CloseOutlined />} size="small" danger />
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      width: '25%'
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medication',
      key: 'medication',
      width: '20%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'time',
      key: 'time',
      width: '20%'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '20%',
      render: (_, record) => getActionButtons(record)
    }
  ];

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Phiếu Gửi Thuốc</Title>
      </div>

      {/* Danh sách phiếu gửi thuốc */}
      <Card className="main-card" title="Danh sách phiếu gửi thuốc">
        <div className="filters-section filter-section">
          <Row gutter={16} justify="center" align="middle" wrap={false}>
            <Col>
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                style={{ minWidth: 220 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả loại ..."
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="pending">Chờ xác nhận</Option>
                <Option value="confirmed">Đã xác nhận</Option>
                <Option value="expired">Đã từ chối</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả trạng thái..."
                value={classFilter}
                onChange={setClassFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="1A">Lớp 1A</Option>
                <Option value="1B">Lớp 1B</Option>
                <Option value="2A">Lớp 2A</Option>
                <Option value="2B">Lớp 2B</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className="events-table"
        />

        <div className="pagination-section">
          <Pagination
            current={1}
            total={4}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Lịch phát thuốc hôm nay */}
      <Card className="supplies-card" title={null} style={{ marginBottom: 24 }}>
        <div className="header-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="header-title">Lịch phát thuốc hôm nay</div>
              <Space className="header-subtitle">
                <CalendarOutlined />
                <span>{today}</span>
              </Space>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="user-info">
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Đang đăng nhập</div>
                <div style={{ fontWeight: 'bold' }}>Y tá trực</div>
              </div>
              <Avatar 
                size={48} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              />
            </div>
          </div>
        </div>
        <Timeline className="medication-timeline">
          {timelineData.map((item, idx) => (
            <Timeline.Item key={idx} dot={
              <span className="timeline-time-badge">{item.time}</span>
            } color="transparent">
              <div className={`timeline-card ${item.status === 'completed' ? 'completed' : 'uncompleted'}`}>
                <div className="timeline-header">
                  <span className="timeline-student">Phát thuốc cho {item.student}</span>
                  <span className="timeline-status">
                    {item.status === 'completed' ? 'Đã hoàn thành' : 'Chờ thực hiện'}
                  </span>
                </div>
                <div className="timeline-body">
                  <div className="timeline-medication">{item.medication}</div>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default MedicationManagement;
