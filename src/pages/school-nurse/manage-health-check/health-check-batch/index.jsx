import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
  ExclamationCircleOutlined
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
  message,
  Spin
} from 'antd';
import './health-check-batch.css';
import moment from 'moment';
import { getHealthCheckSchedules, createHealthCheckSchedule, updateHealthCheck, createHealthConsentForClass } from '../../../../api/healthCheckAPI';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HealthCheckBatchManager = () => {
  const [form] = Form.useForm();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredBatches, setFilteredBatches] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editForm] = Form.useForm();

  // State cho modal gửi phiếu xác nhận
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentForm] = Form.useForm();
  const [selectedBatchForConsent, setSelectedBatchForConsent] = useState(null);
  const [consentDateRange, setConsentDateRange] = useState([]);

  // TODO: Thêm các API health-check khi cần

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const data = await getHealthCheckSchedules();
        const nurseName = localStorage.getItem('fullname') || 'Y tá';
        // Map dữ liệu API về đúng format UI nếu cần, fallback tên y tá nếu null
        const mapped = data.map(item => ({
          id: item.health_ScheduleID,
          batchName: item.name,
          scheduledDate: item.schedule_Date,
          location: item.location,
          notes: item.notes,
          status: item.status,
          nurseName: item.nurseName ,
          createdByNurseName: item.createdByNurseName ,
          updatedByNurseName: item.updatedByNurseName ,
          create_at: item.create_at,
          update_at: item.update_at,
        }));
        // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
        const sorted = mapped.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
        setBatches(sorted);
      } catch (error) {
        message.error('Không thể tải danh sách đợt khám sức khỏe');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // Map trạng thái DB sang UI
  const mapStatus = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'COMPLETED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  // Map trạng thái UI sang DB (dùng cho filter, form)
  const mapStatusToDB = (status) => {
    switch (status) {
      case 'Đã lên lịch':
        return 'SCHEDULED';
      case 'Đã xác nhận':
        return 'COMPLETED';
      case 'Đã từ chối':
        return 'CANCELLED';
      default:
        return status;
    }
  };

  // Filter and search logic
  useEffect(() => {
    let result = batches;
    if (searchTerm) {
      result = result.filter(batch =>
        (batch.batchName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(batch => batch.status === mapStatusToDB(statusFilter));
    }
    setFilteredBatches(result);
  }, [batches, searchTerm, statusFilter]);

  // useEffect(() => {
  //   if (isCreateModalOpen) {
  //     // TODO: Lấy options cho health-check khi mở modal tạo mới
  //   }
  // }, [isCreateModalOpen, form]);

  // Xử lý tạo mới đợt khám sức khỏe
  const handleCreateBatch = async () => {
    try {
      const values = await form.validateFields();
      // Chuẩn bị dữ liệu đúng format API
      const now = new Date().toISOString();
      const nurseName = localStorage.getItem('fullname') || 'Y tá';
      const nurseID = Number(localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || 1);
      const data = {
        schedule_Date: values.scheduledDate ? values.scheduledDate.toISOString() : now,
        name: values.batchName,
        location: values.location,
        notes: values.notes,
        status: mapStatusToDB(values.status),
        create_at: now,
        update_at: now,
        nurseName: nurseName,
        createdByNurseName: nurseName,
        updatedByNurseName: nurseName,
        updatedByNurseID: nurseID,
        createdByNurseID: nurseID
      };
      console.log('[CREATE] Dữ liệu gửi lên:', data);
      const res = await createHealthCheckSchedule(data);
      console.log('[CREATE] Dữ liệu trả về từ BE:', res);
      message.success('Tạo đợt khám thành công!');
      setBatches(prev => {
        const newList = [
          {
            id: res.health_ScheduleID,
            batchName: res.name,
            scheduledDate: res.schedule_Date,
            location: res.location,
            notes: res.notes,
            status: res.status,
            nurseName: res.nurseName,
            createdByNurseName: res.createdByNurseName,
            updatedByNurseName: res.updatedByNurseName,
            create_at: res.create_at,
            update_at: res.update_at,
          },
          ...prev
        ];
        // Sắp xếp lại sau khi thêm mới
        return newList.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      });
      setIsCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin hoặc có lỗi khi tạo đợt khám!');
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      batchName: batch.batchName,
      scheduledDate: batch.scheduledDate ? moment(batch.scheduledDate) : null,
      location: batch.location,
      notes: batch.notes,
      status: mapStatus(batch.status),
    });
  };

  // Xử lý cập nhật đợt khám sức khỏe
  const handleUpdateBatch = async () => {
    try {
      const values = await editForm.validateFields();
      const now = new Date().toISOString();
      const nurseName = localStorage.getItem('fullname') || 'Y tá';
      const nurseID = Number(localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || 1);
      const data = {
        health_ScheduleID: selectedBatch.id,
        schedule_Date: values.scheduledDate ? values.scheduledDate.toISOString() : now,
        name: values.batchName,
        location: values.location,
        notes: values.notes,
        status: mapStatusToDB(values.status),
        update_at: now,
        updatedByNurseID: nurseID,
        updatedByNurseName: nurseName,
      };
      console.log('[UPDATE] Dữ liệu gửi lên:', data);
      const res = await updateHealthCheck(selectedBatch.id, data);
      console.log('[UPDATE] Dữ liệu trả về từ BE:', res);
      message.success('Cập nhật đợt khám thành công!');
      setBatches(prev => prev.map(b => b.id === selectedBatch.id ? {
        ...b,
        batchName: res.name,
        scheduledDate: res.schedule_Date,
        location: res.location,
        notes: res.notes,
        status: res.status,
        update_at: res.update_at,
        updatedByNurseID: res.updatedByNurseID,
        updatedByNurseName: res.updatedByNurseName,
      } : b));
      setIsEditModalOpen(false);
      setSelectedBatch(null);
      editForm.resetFields();
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin hoặc có lỗi khi cập nhật!');
    }
  };

  // Xử lý gửi phiếu xác nhận
  const handleSendConsent = (batch) => {
    setSelectedBatchForConsent(batch);
    setIsConsentModalOpen(true);
    consentForm.resetFields();
    setConsentDateRange([]);
  };

  const handleCreateConsent = async () => {
    try {
      const values = await consentForm.validateFields();
      if (!consentDateRange || consentDateRange.length !== 2) {
        message.error('Vui lòng chọn khoảng thời gian gửi và hết hạn!');
        return;
      }
      // Hiển thị xác nhận lại thông tin
      Modal.confirm({
        title: <span style={{fontWeight:900, fontSize:20, color:'#52c41a'}}><ExclamationCircleOutlined style={{color:'#faad14', marginRight:8}}/>Xác nhận gửi phiếu</span>,
        icon: null,
        content: (
          <div style={{textAlign:'center', padding:'12px 0'}}>
            <Typography.Paragraph style={{fontSize:20, marginBottom:19}}>
              Vui lòng kiểm tra lại thông tin :
            </Typography.Paragraph>
            <div style={{display:'flex', flexDirection:'column', alignItems:'start', gap:12}}>
              <Typography.Text strong style={{fontSize:16, color:'#1890ff'}}>Lớp: {values.className}</Typography.Text>
              <Typography.Text style={{fontSize:16}}>
                <b>Thời gian gửi phiếu:</b> <span style={{color:'#52c41a'}}>{consentDateRange[0]?.format('DD/MM/YYYY HH:mm')}</span>
              </Typography.Text>
              <Typography.Text style={{fontSize:16}}>
                <b>Thời gian hết hạn:</b> <span style={{color:'#fa541c'}}>{consentDateRange[1]?.format('DD/MM/YYYY HH:mm')}</span>
              </Typography.Text>
            </div>
          </div>
        ),
        okText: <span style={{fontWeight:600}}>Xác nhận gửi</span>,
        cancelText: 'Hủy',
        okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } },
        cancelButtonProps: { style: { background: '#fff' } },
        centered: true,
        onOk: async () => {
          const nurseId = Number(localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || 1);
          console.log('[GỬI PHIẾU] createByNurseId:', nurseId);
          const data = {
            className: values.className,
            healthScheduleId: selectedBatchForConsent.id,
            sendDate: consentDateRange[0].toISOString(),
            expireDate: consentDateRange[1].toISOString(),
            isAgreed: values.isAgreed,
            notes: values.notes,
            createByNurseId: nurseId
          };
          await createHealthConsentForClass(data);
          message.success('Gửi phiếu xác nhận thành công!');
          setIsConsentModalOpen(false);
          setSelectedBatchForConsent(null);
          consentForm.resetFields();
          setConsentDateRange([]);
        }
      });
    } catch (error) {
      message.error('Gửi phiếu xác nhận thất bại!');
    }
  };

  return (
    <div className="health-check-batch-container">
      <div className="health-check-batch-header">
        <div>
          <Title level={2}>Quản lý Đợt khám sức khỏe</Title>
        </div>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          className="health-check-batch-create-btn"
        >
          Tạo đợt khám mới
        </Button>
      </div>

      <div className="health-check-batch-filters">
        <Input.Search
          placeholder="Tìm kiếm đợt khám..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onSearch={value => setSearchTerm(value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          style={{ width: 180 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="Đã lên lịch">Đã lên lịch</Option>
          <Option value="Đã xác nhận">Đã xác nhận</Option>
          <Option value="Đã từ chối">Đã từ chối</Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="health-check-batch-list">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="health-check-batch-card">
              <div className="health-check-batch-card-header">
                <div>
                  <Title level={4}>{batch.batchName || 'Chưa có tên'}</Title>
                  <Text type="secondary">
                    Y tá tạo: {batch.createdByNurseName}
                  </Text>
                </div>
                <Badge 
                  status={batch.status === 'COMPLETED' ? 'success' : (batch.status === 'SCHEDULED' ? 'warning' : (batch.status === 'CANCELLED' ? 'error' : 'default'))} 
                  text={mapStatus(batch.status)}
                />
              </div>

              <div className="health-check-batch-card-info">
                <Space><CalendarOutlined /><Text>Ngày khám: {batch.scheduledDate ? new Date(batch.scheduledDate).toLocaleDateString('vi-VN') : '-'}</Text></Space>
                <Space><EnvironmentOutlined /><Text>Địa điểm: {batch.location}</Text></Space>
              </div>

              <div className="health-check-batch-card-info" style={{ marginTop: 8 }}>
                <Space>
                  <Text strong>Y tá chỉnh sửa:</Text> <Text>{batch.updatedByNurseName || '-'}</Text>
                </Space>
                <Space>
                  <Text strong>Ngày tạo:</Text> <Text>{batch.create_at ? (() => { const d = new Date(batch.create_at); const vn = new Date(d.getTime() + 7*60*60*1000); return vn.toLocaleString('vi-VN'); })() : '-'}</Text>
                </Space>
              </div>

              {(batch.notes || batch.update_at) && (
                <div className="health-check-batch-card-info" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <Text type="secondary">Ghi chú:</Text> <Text>{batch.notes || '-'}</Text>
                  </span>
                  <span>
                    <Text strong>Cập nhật:</Text> <Text>{batch.update_at ? (() => { const d = new Date(batch.update_at); const vn = new Date(d.getTime() + 7*60*60*1000); return vn.toLocaleString('vi-VN'); })() : '-'}</Text>
                  </span>
                </div>
              )}

              <div className="health-check-batch-actions">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(batch)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  icon={<SendOutlined />}
                  style={{ marginLeft: 8 }}
                  onClick={() => handleSendConsent(batch)}
                >
                  Gửi phiếu xác nhận
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Tạo đợt khám sức khỏe mới</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateBatch}
        okText="Tạo đợt khám"
        cancelText="Hủy"
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={form} layout="vertical">
            <Form.Item name="batchName" label="Tên đợt khám" rules={[{ required: true, message: 'Vui lòng nhập tên đợt khám' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="scheduledDate" label="Ngày khám" rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}> 
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
              />
            </Form.Item>
            <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="Đã lên lịch">
              <Select disabled>
                <Option value="Đã lên lịch">Đã lên lịch</Option>
                <Option value="Đã xác nhận">Đã xác nhận</Option>
                <Option value="Đã từ chối">Đã từ chối</Option>
              </Select>
            </Form.Item >
          </Form>
        </div>
      </Modal>
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chỉnh sửa đợt khám sức khỏe</span>}
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setSelectedBatch(null); editForm.resetFields(); }}
        onOk={handleUpdateBatch}
        okText="Cập nhật"
        cancelText="Hủy"
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="batchName" label="Tên đợt khám" rules={[{ required: true, message: 'Vui lòng nhập tên đợt khám' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="scheduledDate" label="Ngày khám" rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}> 
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
              />
            </Form.Item>
            <Form.Item name="location" label="Địa điểm">
              <Input />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select disabled>
                <Option value="Đã lên lịch">Đã lên lịch</Option>
                <Option value="Đã xác nhận">Đã xác nhận</Option>
                <Option value="Đã từ chối">Đã từ chối</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Gửi phiếu xác nhận cho lớp</span>}
        open={isConsentModalOpen}
        onCancel={() => { setIsConsentModalOpen(false); setSelectedBatchForConsent(null); consentForm.resetFields(); }}
        onOk={handleCreateConsent}
        okText="Gửi phiếu"
        cancelText="Hủy"
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={consentForm} layout="vertical">
            <Form.Item name="className" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng chọn tên lớp' }]}> 
              <Select placeholder="Chọn lớp" showSearch optionFilterProp="children">
                <Option value="Lớp 5A">Lớp 5A</Option>
                <Option value="Lớp 4B">Lớp 4B</Option>
                <Option value="Lớp 3C">Lớp 3C</Option>
                <Option value="Lớp 2A">Lớp 2A</Option>
                <Option value="Lớp 1B">Lớp 1B</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Chọn khoảng thời gian gửi phiếu" required name="consentDateRange" rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian gửi phiếu' }]}> 
              <DatePicker.RangePicker
                showTime
                style={{ width: '100%' }}
                value={consentDateRange}
                onChange={setConsentDateRange}
                format="YYYY-MM-DD HH:mm"
                placeholder={["Ngày gửi phiếu", "Ngày hết hạn"]}
              />
            </Form.Item>
            <Form.Item name="isAgreed" label="Trạng thái xác nhận" initialValue="Chờ phản hồi"> 
              <Select disabled>
                <Option value="Chờ phản hồi">Chờ phản hồi</Option>
                <Option value="Đồng ý">Đồng ý</Option>
                <Option value="Từ chối">Từ chối</Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HealthCheckBatchManager;
