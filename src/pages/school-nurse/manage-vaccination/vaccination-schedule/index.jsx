import React, { useState } from 'react';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined 
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Badge, 
  Space, 
  Typography, 
  message 
} from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VaccinationScheduleManager = () => {
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      vaccine: 'COVID-19 Pfizer',
      scheduledDate: '2025-06-15',
      location: 'Phòng y tế trường',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị A',
      status: 'confirmed',
      studentsCount: 45,
      consentsSent: true,
      approvedConsents: 38
    },
    {
      id: 2,
      vaccine: 'Cúm mùa',
      scheduledDate: '2025-06-20',
      location: 'Phòng y tế trường',
      nurseId: 'NT001',
      nurseName: 'Nguyễn Thị A',
      status: 'pending',
      studentsCount: 52,
      consentsSent: false,
      approvedConsents: 0
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const vaccines = [
    'COVID-19 Pfizer',
    'COVID-19 Moderna',
    'Cúm mùa',
    'Viêm gan B',
    'Sởi - Quai bị - Rubella (MMR)',
    'Bạch hầu - Ho gà - Uốn ván'
  ];

  const handleCreateSchedule = async () => {
    try {
      const values = await form.validateFields();
      const schedule = {
        id: Date.now(),
        vaccine: values.vaccine,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
        location: values.location,
        nurseId: 'NT001',
        nurseName: 'Nguyễn Thị A',
        status: 'pending',
        studentsCount: Math.floor(Math.random() * 50) + 30,
        consentsSent: false,
        approvedConsents: 0
      };

      setSchedules([...schedules, schedule]);
      form.resetFields();
      setIsCreateModalOpen(false);

      message.success('Đợt tiêm chủng đã được tạo thành công');
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
  };

  const handleSendConsents = (scheduleId) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, consentsSent: true }
        : schedule
    ));

    message.success('Phiếu đồng ý đã được gửi đến tất cả phụ huynh');
  };

  const handleConfirmSchedule = (scheduleId) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: 'confirmed' }
        : schedule
    ));

    message.success('Lịch tiêm đã được xác nhận');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2}>Quản lý Đợt tiêm chủng</Title>
          <Text type="secondary">Tạo và quản lý các đợt tiêm chủng cho học sinh</Text>
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
          Tạo đợt tiêm mới
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {schedules.map((schedule) => (
          <Card 
            key={schedule.id} 
            hoverable
            style={{ borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <Title level={4} style={{ color: '#1890ff', margin: 0 }}>{schedule.vaccine}</Title>
                <Text type="secondary">Y tá phụ trách: {schedule.nurseName}</Text>
              </div>
              <Badge 
                status={getStatusColor(schedule.status)} 
                text={getStatusText(schedule.status)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <Space>
                <CalendarOutlined />
                <Text>Ngày: {schedule.scheduledDate}</Text>
              </Space>
              <Space>
                <EnvironmentOutlined />
                <Text>{schedule.location}</Text>
              </Space>
              <Space>
                <TeamOutlined />
                <Text>{schedule.studentsCount} học sinh</Text>
              </Space>
            </div>

            <Card 
              style={{ backgroundColor: '#f5f5f5', marginBottom: '16px' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Title level={5} style={{ marginBottom: '16px' }}>Tiến trình thực hiện</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Phiếu đồng ý đã gửi</Text>
                  <Badge 
                    status={schedule.consentsSent ? 'success' : 'default'} 
                    text={schedule.consentsSent ? 'Đã gửi' : 'Chưa gửi'}
                  />
                </div>
                {schedule.consentsSent && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Đồng ý tiêm</Text>
                    <Text strong>{schedule.approvedConsents}/{schedule.studentsCount}</Text>
                  </div>
                )}
              </Space>
            </Card>

            <Space wrap>
              {!schedule.consentsSent && (
                <Button 
                  type="default"
                  icon={<SendOutlined />}
                  onClick={() => handleSendConsents(schedule.id)}
                  style={{ color: '#1890ff', borderColor: '#1890ff' }}
                >
                  Gửi phiếu đồng ý
                </Button>
              )}
              
              {schedule.consentsSent && schedule.status === 'pending' && (
                <Button 
                  type="primary"
                  onClick={() => handleConfirmSchedule(schedule.id)}
                  style={{ backgroundColor: '#52c41a' }}
                >
                  Xác nhận lịch tiêm
                </Button>
              )}

              <Button 
                type="default"
                icon={<EditOutlined />}
                size="small"
              >
                Chỉnh sửa
              </Button>
              
              <Button 
                type="default"
                icon={<DeleteOutlined />}
                size="small"
                danger
              >
                Xóa
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title="Tạo đợt tiêm chủng mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSchedule}
        okText="Tạo đợt tiêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
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

          <Form.Item
            name="scheduledDate"
            label="Ngày tiêm"
            rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa điểm"
            initialValue="Phòng y tế trường"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Ghi chú thêm về đợt tiêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationScheduleManager;
