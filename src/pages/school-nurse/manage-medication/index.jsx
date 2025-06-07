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
  Checkbox
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './Medication.css';

const { Title, Text } = Typography;
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
    }
  ];

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
    <div className="medication-management">
      <div className="header">
        <Title level={2} className="page-title">
          Quản lý Phiếu Gửi Thuốc
        </Title>
      </div>

      <Card className="main-card">
        {/* Search and Filter Section */}
        <div className="filter-section">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Tìm kiếm theo tên học sinh hoặc tên thuốc"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả trạng thái"
                style={{ width: 200 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="pending">Chờ xác nhận</Option>
                <Option value="confirmed">Đã xác nhận</Option>
                <Option value="expired">Đã từ chối</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả lớp"
                style={{ width: 150 }}
                value={classFilter}
                onChange={setClassFilter}
                allowClear
              >
                <Option value="1A">Lớp 1A</Option>
                <Option value="1B">Lớp 1B</Option>
                <Option value="2A">Lớp 2A</Option>
                <Option value="2B">Lớp 2B</Option>
              </Select>
            </Col>
            <Col>
              <Button icon={<FilterOutlined />} className="filter-btn">
                Lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Main Table */}
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className="medication-table"
        />

        {/* Pagination */}
        <div className="pagination-wrapper">
          <Pagination
            current={1}
            total={4}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card className="schedule-card" title="Lịch phát thuốc hôm nay">
        <Timeline className="medication-timeline">
          {timelineData.map((item, index) => (
            <Timeline.Item
              key={index}
              dot={<ClockCircleOutlined />}
              color={item.color}
            >
              <div className="timeline-content">
                <div className="timeline-header">
                  <Text strong className="timeline-time">{item.time}</Text>
                  <div className="timeline-status">
                    {item.status === 'completed' ? (
                      <Space>
                        <CheckOutlined className="status-icon success" />
                        <Text className="status-text success">Đánh dấu hoàn thành</Text>
                      </Space>
                    ) : (
                      <Space>
                        <ClockCircleOutlined className="status-icon pending" />
                        <Text className="status-text pending">Đã hoàn thành</Text>
                      </Space>
                    )}
                  </div>
                </div>
                <div className="timeline-body">
                  <Text strong>Phát thuốc cho {item.student}</Text>
                  <br />
                  <Text type="secondary">{item.medication}</Text>
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