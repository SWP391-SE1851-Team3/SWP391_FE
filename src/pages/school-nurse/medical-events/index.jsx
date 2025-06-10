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
  Badge,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  message,
  Alert
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  AlertOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import './Events.css';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchSupplyText, setSearchSupplyText] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addSupplyForm] = Form.useForm();
  const [isAddSupplyModalVisible, setIsAddSupplyModalVisible] = useState(false);
  const [events, setEvents] = useState([
    {
      key: '1',
      student: 'Nguyễn Văn A - Lớp 1A',
      issue: 'Sốt',
      time: '09:30 AM, 24/05/2025',
      status: 'Đã xử lý',
      statusColor: 'success',
      description: 'Học sinh bị sốt 38.5 độ, đã cho uống thuốc hạ sốt.'
    },
    {
      key: '2',
      student: 'Trần Thị B - Lớp 2A',
      issue: 'Tai nạn',
      time: '08:45 AM, 24/05/2025',
      status: 'Đang xử lý',
      statusColor: 'processing',
      description: 'Học sinh bị ngã trong giờ ra chơi, đã sơ cứu vết thương.'
    },
    {
      key: '3',
      student: 'Lê Văn C - Lớp 1B',
      issue: 'Tê răng',
      time: '14:20 PM, 23/05/2025',
      status: 'Đã xử lý',
      statusColor: 'success',
      description: 'Học sinh bị đau răng, đã cho thuốc giảm đau.'
    }
  ]);

  // Dữ liệu mẫu cho vật tư y tế
  const [medicalSupplies, setMedicalSupplies] = useState([
    {
      key: '1',
      name: 'Khẩu trang y tế',
      quantity: 1200,
      unit: 'cái',
      status: 'normal',
      category: 'Bảo hộ'
    },
    {
      key: '2',
      name: 'Găng tay latex',
      quantity: 50,
      unit: 'hộp',
      status: 'low',
      statusText: 'Sắp hết',
      category: 'Bảo hộ'
    },
    {
      key: '3',
      name: 'Ống tiêm 5ml',
      quantity: 5,
      unit: 'hộp',
      status: 'critical',
      statusText: 'Cần đặt gấp',
      category: 'Dụng cụ'
    },
    {
      key: '4',
      name: 'Gạc y tế',
      quantity: 300,
      unit: 'gói',
      status: 'normal',
      category: 'Băng gạc'
    },
    {
      key: '5',
      name: 'Cồn 70%',
      quantity: 25,
      unit: 'chai',
      status: 'low',
      statusText: 'Sắp hết',
      category: 'Khử trùng'
    },
    {
      key: '6',
      name: 'Nhiệt kế điện tử',
      quantity: 15,
      unit: 'cái',
      status: 'normal',
      category: 'Thiết bị'
    }
  ]);

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
          'Tê răng': 'orange',
          'Đau bụng': 'yellow'
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
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.statusColor !== 'success' && (
            <Tooltip title="Đánh dấu hoàn thành">
              <Button 
                type="text" 
                icon={<CheckOutlined />} 
                onClick={() => handleMarkComplete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'critical-status';
      case 'low':
        return 'low-status';
      default:
        return 'normal-status';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return <Tag color="red">Cấp bách</Tag>;
      case 'low':
        return <Tag color="orange">Thấp</Tag>;
      default:
        return <Tag color="green">Bình thường</Tag>;
    }
  };

  // Hàm lọc dữ liệu
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch = searchText === '' || 
        event.student.toLowerCase().includes(searchText.toLowerCase()) ||
        event.issue.toLowerCase().includes(searchText.toLowerCase());

      // Lọc theo loại sự kiện
      const matchesStatus = statusFilter === '' || 
        (statusFilter === 'fever' && event.issue === 'Sốt') ||
        (statusFilter === 'accident' && event.issue === 'Tai nạn') ||
        (statusFilter === 'toothache' && event.issue === 'Tê răng') ||
        (statusFilter === 'stomachache' && event.issue === 'Đau bụng');

      // Lọc theo trạng thái
      const matchesState = stateFilter === '' ||
        (stateFilter === 'completed' && event.status === 'Đã xử lý') ||
        (stateFilter === 'processing' && event.status === 'Đang xử lý');

      return matchesSearch && matchesStatus && matchesState;
    });
  };

  // Hàm lọc vật tư y tế
  const getFilteredSupplies = () => {
    return medicalSupplies.filter(supply => {
      return searchSupplyText === '' || 
        supply.name.toLowerCase().includes(searchSupplyText.toLowerCase()) ||
        supply.category.toLowerCase().includes(searchSupplyText.toLowerCase());
    });
  };

  // Xử lý tạo sự kiện mới
  const handleCreateEvent = () => {
    form.validateFields().then(values => {
      // Tạo sự kiện mới với dữ liệu từ form
      const newEvent = {
        key: String(events.length + 1),
        student: values.student,
        issue: values.issue,
        time: `${values.time.format('HH:mm')} ${values.date.format('DD/MM/YYYY')}`,
        status: 'Đang xử lý',
        statusColor: 'processing',
        description: values.description
      };

      // Cập nhật state với sự kiện mới
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      
      // Đóng modal và reset form
      setIsModalVisible(false);
      form.resetFields();
      
      // Hiển thị thông báo thành công
      message.success('Tạo sự kiện mới thành công!');
    });
  };

  // Xử lý xem chi tiết
  const handleViewDetails = (record) => {
    setSelectedEvent(record);
    setIsViewModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (record) => {
    try {
      // Lưu record được chọn vào state
      setSelectedEvent(record);
      
      // Parse thời gian từ record
      const [timeStr, dateStr] = record.time.split(', ');
      const time = moment(timeStr, 'HH:mm');
      const date = moment(dateStr, 'DD/MM/YYYY');

      // Mở modal trước
      setIsEditModalVisible(true);

      // Sau đó set giá trị cho form
      setTimeout(() => {
        editForm.setFieldsValue({
          student: record.student,
          issue: record.issue,
          description: record.description,
          date: date,
          time: time
        });
      }, 100);
    } catch (error) {
      console.error('Error parsing date/time:', error);
      message.error('Có lỗi xảy ra khi tải thông tin sự kiện');
    }
  };

  // Xử lý cập nhật sự kiện
  const handleUpdateEvent = () => {
    editForm.validateFields().then(values => {
      try {
        const updatedEvent = {
          ...selectedEvent,
          student: values.student,
          issue: values.issue,
          description: values.description,
          time: `${values.time.format('HH:mm')}, ${values.date.format('DD/MM/YYYY')}`
        };

        // Cập nhật state với sự kiện mới
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.key === selectedEvent.key ? updatedEvent : event
          )
        );

        message.success('Cập nhật sự kiện thành công!');
        setIsEditModalVisible(false);
        editForm.resetFields();
      } catch (error) {
        console.error('Error updating event:', error);
        message.error('Có lỗi xảy ra khi cập nhật sự kiện');
      }
    }).catch(error => {
      console.error('Validation failed:', error);
    });
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };

  // Xử lý đánh dấu hoàn thành
  const handleMarkComplete = (record) => {
    Modal.confirm({
      title: 'Xác nhận hoàn thành',
      content: 'Bạn có chắc chắn muốn đánh dấu sự kiện này đã hoàn thành?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedEvent = {
          ...record,
          status: 'Đã xử lý',
          statusColor: 'success'
        };

        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.key === record.key ? updatedEvent : event
          )
        );

        message.success('Đã đánh dấu sự kiện hoàn thành!');
      }
    });
  };

  const showAddSupplyModal = () => {
    setIsAddSupplyModalVisible(true);
    addSupplyForm.resetFields();
  };

  const handleAddSupply = () => {
    addSupplyForm.validateFields()
      .then(values => {
        const newSupply = {
          key: String(medicalSupplies.length + 1), // Simple key generation
          name: values.name,
          quantity: values.quantity,
          unit: values.unit,
          category: values.category,
          status: values.quantity <= 10 ? 'critical' : (values.quantity <= 50 ? 'low' : 'normal'), // Basic status logic
          statusText: values.quantity <= 10 ? 'Cần đặt gấp' : (values.quantity <= 50 ? 'Sắp hết' : null),
        };
        setMedicalSupplies(prevSupplies => [...prevSupplies, newSupply]);
        message.success('Thêm vật tư thành công!');
        setIsAddSupplyModalVisible(false);
        addSupplyForm.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        message.error('Vui lòng điền đầy đủ thông tin cần thiết.');
      });
  };

  const handleCancelAddSupply = () => {
    setIsAddSupplyModalVisible(false);
    addSupplyForm.resetFields();
  };

  // Lấy dữ liệu đã lọc
  const filteredEvents = getFilteredEvents();

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Sự kiện Y tế</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="create-btn"
          onClick={() => setIsModalVisible(true)}
        >
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Sự kiện gần đây */}
      <Card className="events-card" title="Sự kiện gần đây">
        <div className="filters-section custom-filters-section">
          <Row gutter={16} justify="center" align="middle" wrap={false}>
            <Col>
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ minWidth: 220 }}
                allowClear
              />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả loại sự kiện"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả loại sự kiện</Option>
                <Option value="fever">Sốt</Option>
                <Option value="accident">Tai nạn</Option>
                <Option value="toothache">Tê răng</Option>
                <Option value="stomachache">Đau bụng</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả trạng thái"
                value={stateFilter}
                onChange={setStateFilter}
                style={{ minWidth: 170 }}
                allowClear
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
          dataSource={filteredEvents}
          pagination={false}
          className="events-table"
        />

        <div className="pagination-section">
          <Pagination
            current={1}
            total={filteredEvents.length}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Quản lý vật tư y tế */}
      <Card className="supplies-card" title="Quản lý vật tư y tế">
        <div className="supplies-header">
          <div className="search-container">
            <Input
              placeholder="Tìm kiếm vật tư..."
              prefix={<SearchOutlined />}
              value={searchSupplyText}
              onChange={(e) => setSearchSupplyText(e.target.value)}
              allowClear
            />
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddSupplyModal}>
            Thêm vật tư
          </Button>
        </div>

        <div className="supplies-grid">
          {getFilteredSupplies().map(supply => (
            <Card 
              key={supply.key} 
              className={`supply-card ${getStatusColor(supply.status)}`}
            >
              <div className="supply-header">
                <span className="font-semibold text-gray-800 text-sm">{supply.name}</span>
                {supply.status !== 'normal' && (
                  <AlertOutlined className={`alert-icon ${supply.status === 'critical' ? 'critical' : 'warning'}`} />
                )}
              </div>
              <div className="supply-info">
                <div className="quantity-info">
                  <span className="quantity">{supply.quantity}</span>
                  <span className="unit">{supply.unit}</span>
                </div>
                <Tag className="category-tag">{supply.category}</Tag>
              </div>
              {supply.statusText && (
                <div className="status-badge">
                  {getStatusBadge(supply.status)}
                </div>
              )}
              <div className="supply-actions">
                <Button type="link" icon={<EditOutlined />}>Sửa</Button>
                
              </div>
            </Card>
          ))}
        </div>

        {getFilteredSupplies().length === 0 && (
          <div className="empty-search">
            <SearchOutlined className="empty-icon" />
            <p>Không tìm thấy vật tư nào phù hợp</p>
          </div>
        )}

        <div className="supplies-summary">
          <Card className="summary-card total">
            <ShoppingCartOutlined className="summary-icon" />
            <div className="summary-info">
              <p className="summary-label">Tổng số loại vật tư</p>
              <p className="summary-value">{medicalSupplies.length}</p>
            </div>
          </Card>
          <Card className="summary-card low">
            <AlertOutlined className="summary-icon" />
            <div className="summary-info">
              <p className="summary-label">Vật tư sắp hết</p>
              <p className="summary-value">{medicalSupplies.filter(s => s.status === 'low').length}</p>
            </div>
          </Card>
          <Card className="summary-card critical">
            <AlertOutlined className="summary-icon" />
            <div className="summary-info">
              <p className="summary-label">Cần đặt gấp</p>
              <p className="summary-value">{medicalSupplies.filter(s => s.status === 'critical').length}</p>
            </div>
          </Card>
        </div>
      </Card>

      {/* Modal tạo sự kiện mới */}
      <Modal
        title="Tạo sự kiện y tế mới"
        open={isModalVisible}
        onOk={handleCreateEvent}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="Tạo sự kiện"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="student"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select placeholder="Chọn học sinh">
              <Option value="Nguyễn Văn A - Lớp 1A">Nguyễn Văn A - Lớp 1A</Option>
              <Option value="Trần Thị B - Lớp 2A">Trần Thị B - Lớp 2A</Option>
              <Option value="Lê Văn C - Lớp 1B">Lê Văn C - Lớp 1B</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="issue"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              <Option value="Sốt">Sốt</Option>
              <Option value="Tai nạn">Tai nạn</Option>
              <Option value="Tê răng">Tê răng</Option>
              <Option value="Đau bụng">Đau bụng</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Giờ"
                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết về sự kiện y tế..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết sự kiện y tế"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEvent && (
          <div className="event-details">
            <div className="detail-item">
              <span className="label">Học sinh:</span>
              <span className="value">{selectedEvent.student}</span>
            </div>
            <div className="detail-item">
              <span className="label">Loại sự kiện:</span>
              <Tag color={eventColumns[1].render(selectedEvent.issue, selectedEvent).props.color}>
                {selectedEvent.issue}
              </Tag>
            </div>
            <div className="detail-item">
              <span className="label">Thời gian:</span>
              <span className="value">{selectedEvent.time}</span>
            </div>
            <div className="detail-item">
              <span className="label">Trạng thái:</span>
              <Tag color={selectedEvent.statusColor}>{selectedEvent.status}</Tag>
            </div>
            {selectedEvent.description && (
              <div className="detail-item">
                <span className="label">Mô tả:</span>
                <div className="value description">{selectedEvent.description}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa sự kiện y tế"
        open={isEditModalVisible}
        onOk={handleUpdateEvent}
        onCancel={handleCancelEdit}
        width={600}
        okText="Cập nhật"
        cancelText="Hủy"
        maskClosable={false}
        afterOpenChange={(visible) => {
          if (!visible) {
            editForm.resetFields();
          }
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          requiredMark={false}
          preserve={true}
        >
          <Form.Item
            name="student"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select placeholder="Chọn học sinh">
              <Option value="Nguyễn Văn A - Lớp 1A">Nguyễn Văn A - Lớp 1A</Option>
              <Option value="Trần Thị B - Lớp 2A">Trần Thị B - Lớp 2A</Option>
              <Option value="Lê Văn C - Lớp 1B">Lê Văn C - Lớp 1B</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="issue"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              <Option value="Sốt">Sốt</Option>
              <Option value="Tai nạn">Tai nạn</Option>
              <Option value="Tê răng">Tê răng</Option>
              <Option value="Đau bụng">Đau bụng</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Giờ"
                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết về sự kiện y tế..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm Vật Tư Mới"
        open={isAddSupplyModalVisible}
        onOk={handleAddSupply}
        onCancel={handleCancelAddSupply}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
      >
        <Form
          form={addSupplyForm}
          layout="vertical"
          name="add_supply_form"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Tên Vật Tư"
            rules={[{ required: true, message: 'Vui lòng nhập tên vật tư!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số Lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }, { min: 1, message: 'Số lượng phải là số dương!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn Vị"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Loại Vật Tư"
            rules={[{ required: true, message: 'Vui lòng chọn loại vật tư!' }]}
          >
            <Select placeholder="Chọn loại vật tư">
              <Option value="Bảo hộ">Bảo hộ</Option>
              <Option value="Dụng cụ">Dụng cụ</Option>
              <Option value="Băng gạc">Băng gạc</Option>
              <Option value="Khử trùng">Khử trùng</Option>
              <Option value="Thiết bị">Thiết bị</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;