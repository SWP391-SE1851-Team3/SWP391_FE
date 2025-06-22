import React, { useState } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Space, 
  message,
  Statistic,
  Badge,
  Alert,
  Checkbox
} from 'antd';
import './post-vaccination.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PostVaccinationObservation = () => {
  const [observations, setObservations] = useState([
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      className: '6A',
      vaccine: 'COVID-19 Pfizer',
      vaccinationDate: '2025-06-15',
      observationTime: '2025-06-15 10:00:00',
      symptoms: 'Không có phản ứng bất thường',
      severity: 'none',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: 'completed',
      followUpRequired: false
    },
    {
      id: 2,
      studentName: 'Trần Thị C',
      className: '6B',
      vaccine: 'COVID-19 Pfizer',
      vaccinationDate: '2025-06-15',
      observationTime: '2025-06-15 10:15:00',
      symptoms: 'Đau nhẹ tại vị trí tiêm, hơi mệt',
      severity: 'mild',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: 'monitoring',
      followUpRequired: true,
      followUpDate: '2025-06-16'
    },
    {
      id: 3,
      studentName: 'Lê Văn E',
      className: '6A',
      vaccine: 'COVID-19 Pfizer',
      vaccinationDate: '2025-06-15',
      observationTime: '2025-06-15 10:30:00',
      symptoms: 'Sốt nhẹ 37.5°C, đau đầu',
      severity: 'mild',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: 'monitoring',
      followUpRequired: true,
      followUpDate: '2025-06-16'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const students = [
    { name: 'Nguyễn Văn A', class: '6A', vaccine: 'COVID-19 Pfizer', date: '2025-06-15' },
    { name: 'Trần Thị C', class: '6B', vaccine: 'COVID-19 Pfizer', date: '2025-06-15' },
    { name: 'Lê Văn E', class: '6A', vaccine: 'COVID-19 Pfizer', date: '2025-06-15' }
  ];

  const filteredObservations = observations.filter(observation => {
    const matchesSearch = observation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         observation.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || observation.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || observation.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleCreateObservation = (values) => {
    const selectedStudent = students.find(s => s.name === values.studentName);
    const observation = {
      id: Date.now(),
      studentName: values.studentName,
      className: selectedStudent ? selectedStudent.class : '',
      vaccine: selectedStudent ? selectedStudent.vaccine : '',
      vaccinationDate: selectedStudent ? selectedStudent.date : '',
      observationTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      symptoms: values.symptoms,
      severity: values.severity,
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: values.severity === 'none' ? 'completed' : 'monitoring',
      followUpRequired: values.followUpRequired,
      followUpDate: values.followUpRequired ? 
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    };

    setObservations([...observations, observation]);
    form.resetFields();
    setIsCreateModalOpen(false);

    message.success('Thông tin theo dõi đã được ghi nhận');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none': return 'success';
      case 'mild': return 'warning';
      case 'moderate': return 'processing';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'none': return 'Không có';
      case 'mild': return 'Nhẹ';
      case 'moderate': return 'Vừa';
      case 'severe': return 'Nặng';
      default: return severity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'monitoring': return 'processing';
      case 'follow_up': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'monitoring': return 'Đang theo dõi';
      case 'follow_up': return 'Cần tái khám';
      default: return status;
    }
  };

  const stats = {
    total: observations.length,
    noReaction: observations.filter(o => o.severity === 'none').length,
    mildReaction: observations.filter(o => o.severity === 'mild').length,
    monitoring: observations.filter(o => o.status === 'monitoring').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2}>Theo dõi sau tiêm chủng</Title>
          <Text type="secondary">Ghi nhận và theo dõi phản ứng sau tiêm chủng của học sinh</Text>
        </div>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ghi nhận theo dõi
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số quan sát" 
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Không phản ứng" 
              value={stats.noReaction}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Phản ứng nhẹ" 
              value={stats.mildReaction}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đang theo dõi" 
              value={stats.monitoring}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Bộ lọc">
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm học sinh, triệu chứng..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="Mức độ nghiêm trọng"
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="none">Không có</Option>
              <Option value="mild">Nhẹ</Option>
              <Option value="moderate">Vừa</Option>
              <Option value="severe">Nặng</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="monitoring">Đang theo dõi</Option>
              <Option value="follow_up">Cần tái khám</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button icon={<FilterOutlined />} block>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Observations List */}
      <div className="post-vaccination-list">
        {filteredObservations.map((obs) => (
          <div key={obs.id} className="post-card">
            <div className="post-card-header">
              <div>
                <Title level={4}>{obs.studentName}</Title>
                <Text type="secondary">
                  Lớp: {obs.className} | Vaccine: {obs.vaccine}
                </Text>
              </div>
              <Badge 
                status={getStatusColor(obs.status)} 
                text={getStatusText(obs.status)}
              />
            </div>
            <div className="post-card-info">
              <Space><Text type="secondary">Ngày tiêm:</Text> <Text>{obs.vaccinationDate}</Text></Space>
              <Space><Text type="secondary">Thời gian theo dõi:</Text> <Text>{obs.observationTime}</Text></Space>
              <Space><Text type="secondary">Y tá:</Text> <Text>{obs.nurseName}</Text></Space>
            </div>
            <div className="post-card-info">
              <Space><Text type="secondary">Triệu chứng:</Text> <Text>{obs.symptoms}</Text></Space>
              <Space><Text type="secondary">Mức độ:</Text> <Text>{getSeverityText(obs.severity)}</Text></Space>
              {obs.followUpRequired && <Space><Text type="secondary">Tái khám:</Text> <Text>{obs.followUpDate}</Text></Space>}
            </div>
            <div className="post-card-actions">
              <Button icon={<EyeOutlined />}>Xem chi tiết</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        title="Ghi nhận theo dõi sau tiêm"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateObservation}
        >
          <Form.Item
            name="studentName"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
          >
            <Select placeholder="Chọn học sinh đã tiêm">
              {students.map((student) => (
                <Option key={student.name} value={student.name}>
                  {student.name} - {student.class} ({student.vaccine})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="symptoms"
            label="Triệu chứng quan sát"
            rules={[{ required: true, message: 'Vui lòng nhập triệu chứng!' }]}
          >
            <TextArea
              placeholder="Mô tả các triệu chứng quan sát được (đau, sốt, phản ứng tại chỗ, v.v.)"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Mức độ nghiêm trọng"
            initialValue="none"
          >
            <Select>
              <Option value="none">Không có phản ứng</Option>
              <Option value="mild">Nhẹ</Option>
              <Option value="moderate">Vừa phải</Option>
              <Option value="severe">Nghiêm trọng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="followUpRequired"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>Cần theo dõi tiếp</Checkbox>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú thêm"
          >
            <TextArea
              placeholder="Các ghi chú bổ sung, khuyến nghị..."
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Ghi nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostVaccinationObservation; 