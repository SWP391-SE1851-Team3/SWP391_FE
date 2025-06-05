import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Space,
  Tag,
  Pagination,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined
} from '@ant-design/icons';
import './Events.css';

const { Title } = Typography;
const { Option } = Select;

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Dữ liệu mẫu cho sự kiện gần đây
  const recentEvents = [
    {
      key: '1',
      student: 'Nguyễn Văn A - Lớp 1A',
      issue: 'Sốt',
      time: '09:30 AM, 24/05/2025',
      status: 'Đã xử lý',
      statusColor: 'success'
    },
    {
      key: '2',
      student: 'Trần Thị B - Lớp 2A',
      issue: 'Tai nạn',
      time: '08:45 AM, 24/05/2025',
      status: 'Đang xử lý',
      statusColor: 'processing'
    },
    {
      key: '3',
      student: 'Lê Văn C - Lớp 1B',
      issue: 'Tê răng',
      time: '14:20 PM, 23/05/2025',
      status: 'Đã xử lý',
      statusColor: 'success'
    }
  ];

  // Dữ liệu mẫu cho vật tư y tế
  const medicalSupplies = [
    {
      key: '1',
      name: 'Bông gạc',
      quantity: 5,
      unit: 'gói',
      status: 'low',
      statusText: 'Tồn kho thấp!'
    },
    {
      key: '2',
      name: 'Paracetamol',
      quantity: 30,
      unit: 'viên',
      status: 'normal',
      statusText: ''
    },
    {
      key: '3',
      name: 'Băng dính y tế',
      quantity: 12,
      unit: 'cuộn',
      status: 'normal',
      statusText: ''
    },
    {
      key: '4',
      name: 'Cồn sát trùng',
      quantity: 1,
      unit: 'chai',
      status: 'low',
      statusText: 'Tồn kho thấp!'
    }
  ];

  const eventColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'issue',
      key: 'issue',
      render: (text, record) => {
        const colors = {
          'Sốt': 'red',
          'Tai nạn': 'blue',
          'Tê răng': 'orange'
        };
        return <Tag color={colors[text]}>{text}</Tag>;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Tag color={record.statusColor}>{text}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          {record.statusColor !== 'success' && (
            <Tooltip title="Đánh dấu hoàn thành">
              <Button type="text" icon={<CheckOutlined />} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const supplyColumns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <span className={record.status === 'low' ? 'low-stock' : ''}>
          {quantity} {record.unit}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusText',
      key: 'statusText',
      render: (text, record) => {
        if (record.status === 'low') {
          return <Tag color="red">{text}</Tag>;
        }
        return null;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>
            Chỉnh sửa
          </Button>
          <Button type="link">
            Đặt thêm
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Sự kiện Y tế</Title>
        <Button type="primary" icon={<PlusOutlined />} className="create-btn">
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Sự kiện gần đây */}
      <Card className="events-card" title="Sự kiện gần đây">
        <div className="filters-section">
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Tất cả loại sự kiện"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả loại sự kiện</Option>
                <Option value="fever">Sốt</Option>
                <Option value="accident">Tai nạn</Option>
                <Option value="toothache">Tê răng</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Tất cả trạng thái"
                value={stateFilter}
                onChange={setStateFilter}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="completed">Đã xử lý</Option>
                <Option value="processing">Đang xử lý</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={eventColumns}
          dataSource={recentEvents}
          pagination={false}
          className="events-table"
        />

        <div className="pagination-section">
          <Pagination
            current={1}
            total={50}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Quản lý vật tư y tế */}
      <Card className="supplies-card" title="Quản lý vật tư y tế">
        <div className="supplies-header">
          <Input
            placeholder="Tìm kiếm vật tư..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm vật tư
          </Button>
        </div>

        <Row gutter={16} className="supplies-grid">
          {medicalSupplies.map(supply => (
            <Col span={6} key={supply.key}>
              <Card className={`supply-card ${supply.status === 'low' ? 'low-stock-card' : ''}`}>
                <div className="supply-header">
                  <Title level={5}>{supply.name}</Title>
                  {supply.status === 'low' && (
                    <Badge status="error" />
                  )}
                </div>
                <div className="supply-quantity">
                  <span className="quantity">{supply.quantity}</span>
                  <span className="unit">{supply.unit}</span>
                </div>
                {supply.statusText && (
                  <Tag color="red" className="supply-status">
                    {supply.statusText}
                  </Tag>
                )}
                <div className="supply-actions">
                  <Button type="link" icon={<EditOutlined />}>
                    Chỉnh sửa
                  </Button>
                  <Button type="link">
                    Đặt thêm
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default App;