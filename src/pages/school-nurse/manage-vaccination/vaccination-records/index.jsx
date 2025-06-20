import React, { useState } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  MedicineBoxOutlined 
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Badge, 
  Space, 
  Typography, 
  message,
  Row,
  Col,
  Statistic
} from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VaccinationRecords = () => {
  const [form] = Form.useForm();
  const [records, setRecords] = useState([
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      className: '6A',
      vaccine: 'COVID-19 Pfizer',
      doseNumber: 1,
      batchId: 'PF2025001',
      vaccinationDate: '2025-06-15',
      vaccinationTime: '09:30',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: 'completed',
      notes: 'Tiêm thành công, không có phản ứng'
    },
    {
      id: 2,
      studentName: 'Trần Thị C',
      className: '6B',
      vaccine: 'COVID-19 Pfizer',
      doseNumber: 1,
      batchId: 'PF2025001',
      vaccinationDate: '2025-06-15',
      vaccinationTime: '09:45',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị B',
      status: 'completed',
      notes: 'Học sinh hơi lo lắng nhưng tiêm thành công'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [vaccineFilter, setVaccineFilter] = useState('all');

  const vaccines = [
    'COVID-19 Pfizer',
    'COVID-19 Moderna',
    'Cúm mùa',
    'Viêm gan B',
    'Sởi - Quai bị - Rubella (MMR)'
  ];

  const students = [
    { name: 'Nguyễn Văn A', class: '6A' },
    { name: 'Trần Thị C', class: '6B' },
    { name: 'Lê Văn E', class: '6A' },
    { name: 'Phạm Thị G', class: '6C' }
  ];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vaccine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || record.className === classFilter;
    const matchesVaccine = vaccineFilter === 'all' || record.vaccine === vaccineFilter;
    
    return matchesSearch && matchesClass && matchesVaccine;
  });

  const handleCreateRecord = async () => {
    try {
      const values = await form.validateFields();
      const selectedStudent = students.find(s => s.name === values.studentName);
      
      const record = {
        id: Date.now(),
        studentName: values.studentName,
        className: selectedStudent ? selectedStudent.class : values.className,
        vaccine: values.vaccine,
        doseNumber: values.doseNumber,
        batchId: values.batchId,
        vaccinationDate: new Date().toISOString().split('T')[0],
        vaccinationTime: new Date().toTimeString().slice(0, 5),
        nurseId: 'NT001',
        nurseName: 'Nguyễn Thị B',
        status: 'completed',
        notes: values.notes
      };

      setRecords([...records, record]);
      form.resetFields();
      setIsCreateModalOpen(false);

      message.success('Kết quả tiêm chủng đã được ghi nhận');
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
  };

  const stats = {
    total: records.length,
    today: records.filter(r => r.vaccinationDate === new Date().toISOString().split('T')[0]).length,
    thisWeek: records.length,
    thisMonth: records.length
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2}>Ghi nhận Kết quả tiêm</Title>
          <Text type="secondary">Ghi nhận và quản lý kết quả tiêm chủng của học sinh</Text>
        </div>
        
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ 
            background: 'linear-gradient(to right, #1890ff, #52c41a)',
            border: 'none'
          }}
        >
          Ghi nhận tiêm chủng
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card style={{ background: 'linear-gradient(to right, #1890ff, #096dd9)', color: 'white' }}>
            <Statistic
              title="Tổng số mũi tiêm"
              value={stats.total}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: 'linear-gradient(to right, #52c41a, #389e0d)', color: 'white' }}>
            <Statistic
              title="Tiêm hôm nay"
              value={stats.today}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: 'linear-gradient(to right, #722ed1, #531dab)', color: 'white' }}>
            <Statistic
              title="Tuần này"
              value={stats.thisWeek}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: 'linear-gradient(to right, #fa8c16, #d4380d)', color: 'white' }}>
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={5}>Bộ lọc</Title>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm học sinh, vaccine..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={classFilter}
              onChange={setClassFilter}
              placeholder="Lớp học"
            >
              <Option value="all">Tất cả lớp</Option>
              <Option value="6A">Lớp 6A</Option>
              <Option value="6B">Lớp 6B</Option>
              <Option value="6C">Lớp 6C</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={vaccineFilter}
              onChange={setVaccineFilter}
              placeholder="Loại vaccine"
            >
              <Option value="all">Tất cả vaccine</Option>
              {vaccines.map((vaccine) => (
                <Option key={vaccine} value={vaccine}>{vaccine}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Button icon={<FilterOutlined />} block>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Records List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRecords.map((record) => (
          <Card key={record.id} hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  {record.studentName}
                </Title>
                <Text type="secondary">Lớp: {record.className}</Text>
              </div>
              <Badge status="success" text="Hoàn thành" />
            </div>

            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={6}>
                <Space>
                  <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                  <div>
                    <Text type="secondary">Vaccine:</Text>
                    <div>{record.vaccine}</div>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <FileTextOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <Text type="secondary">Mũi số:</Text>
                    <div>{record.doseNumber}</div>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <CalendarOutlined style={{ color: '#722ed1' }} />
                  <div>
                    <Text type="secondary">Ngày giờ:</Text>
                    <div>{record.vaccinationDate} {record.vaccinationTime}</div>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <div>
                  <Text type="secondary">Số lô:</Text>
                  <div style={{ fontFamily: 'monospace' }}>{record.batchId}</div>
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">Y tá thực hiện:</Text>
              <div>{record.nurseName}</div>
            </div>

            {record.notes && (
              <Card style={{ backgroundColor: '#e6f7ff' }}>
                <Text type="secondary">Ghi chú:</Text>
                <div style={{ color: '#1890ff' }}>{record.notes}</div>
              </Card>
            )}
          </Card>
        ))}
      </div>

      <Modal
        title="Ghi nhận kết quả tiêm chủng"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateRecord}
        okText="Ghi nhận"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="studentName"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select placeholder="Chọn học sinh">
              {students.map((student) => (
                <Option key={student.name} value={student.name}>
                  {student.name} - {student.class}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="vaccine"
            label="Loại vaccine"
            rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
          >
            <Select placeholder="Chọn loại vaccine">
              {vaccines.map((vaccine) => (
                <Option key={vaccine} value={vaccine}>{vaccine}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="doseNumber"
                label="Mũi số"
                initialValue={1}
              >
                <Select>
                  <Option value={1}>Mũi 1</Option>
                  <Option value={2}>Mũi 2</Option>
                  <Option value={3}>Mũi 3</Option>
                  <Option value={4}>Mũi 4</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchId"
                label="Số lô vaccine"
                rules={[{ required: true, message: 'Vui lòng nhập số lô vaccine' }]}
              >
                <Input placeholder="VD: PF2025001" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              placeholder="Ghi chú về quá trình tiêm, phản ứng của học sinh..."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationRecords; 