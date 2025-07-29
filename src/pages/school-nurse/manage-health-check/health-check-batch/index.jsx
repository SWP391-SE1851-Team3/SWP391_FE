import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  TimePicker,
  Badge, 
  Space, 
  Typography, 
  message,
  Spin
} from 'antd';
import './health-check-batch.css';
import moment from 'moment';
import { formatDateTime } from '../../../../utils/formatDate';
import { getHealthCheckSchedules, createHealthCheckSchedule, updateHealthCheck, createHealthConsentForMultipleClasses } from '../../../../api/healthCheckAPI';
import { hasNoSpecialCharacters, isOnlyWhitespace } from '../../../../validations';
import { getErrorMessage } from '../../../../utils/getErrorMessage';

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
      case 'Đã lên lịch':
        return 'Đã lên lịch';
      case 'Đã xác nhận':
        return 'Đã xác nhận';
      case 'Đã từ chối':
        return 'Đã từ chối';
      default:
        return ''; // fallback về 'Đã lên lịch' nếu không khớp
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
      result = result.filter(batch => mapStatus(batch.status) === statusFilter);
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
      const now = new Date().toISOString();
     
      // Chuẩn bị dữ liệu đúng format API
      const nurseName = localStorage.getItem('fullname') || 'Y tá';
      const nurseID = Number(localStorage.getItem('userId') || "");
      // Kết hợp ngày và giờ
      let scheduleDateTime = now;
      if (values.scheduledDateTime) {
        scheduleDateTime = values.scheduledDateTime.toISOString();
      }
      
      const data = {
        schedule_Date: scheduleDateTime,
        name: values.batchName,
        location: values.location,
        notes: values.notes,
        status: values.status,
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
      message.error(getErrorMessage(error));
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setIsEditModalOpen(true);
    // Chuyển đổi scheduledDate thành moment object
    const scheduledDateTime = batch.scheduledDate ? moment(batch.scheduledDate) : null;
    
    editForm.setFieldsValue({
      batchName: batch.batchName,
      scheduledDateTime: scheduledDateTime,
      location: batch.location,
      notes: batch.notes,
      status: mapStatus(batch.status),
    });
  };

  // Xử lý cập nhật đợt khám sức khỏe
  const handleUpdateBatch = async () => {
    try {
      const values = await editForm.validateFields();
      const nowUpdate = new Date().toISOString();
    
      const nurseName = localStorage.getItem('fullname') || 'Y tá';
      const nurseID = Number(localStorage.getItem('userId') || "");
      // Kết hợp ngày và giờ
      let scheduleDateTime = nowUpdate;
      if (values.scheduledDateTime) {
        scheduleDateTime = values.scheduledDateTime.toISOString();
      }
      
      const data = {
        health_ScheduleID: selectedBatch.id,
        schedule_Date: scheduleDateTime,
        name: values.batchName,
        location: values.location,
        notes: values.notes,
        status: values.status,
        update_at: nowUpdate,
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
      message.error(getErrorMessage(error));
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
        title: <span style={{fontWeight:900, fontSize:20, color:'#faad14'}}><ExclamationCircleOutlined style={{color:'#faad14', marginRight:8}}/>Xác nhận gửi phiếu</span>,
        icon: null,
        content: (
          <div style={{textAlign:'center', padding:'12px 0'}}>
            <Typography.Paragraph style={{fontSize:20, marginBottom:19}}>
              Vui lòng kiểm tra lại thông tin :
            </Typography.Paragraph> <br />
            <div style={{display:'flex', flexDirection:'column', alignItems:'start', gap:20}}>
              <Typography.Text strong style={{fontSize:16}}>Tên đợt khám: {selectedBatchForConsent?.batchName}</Typography.Text>
              <Typography.Text strong style={{fontSize:16}}>Địa điểm: {selectedBatchForConsent?.location}</Typography.Text>
              <Typography.Text strong style={{fontSize:16}}>Lớp: {Array.isArray(values.className) ? values.className.join(', ') : values.className}</Typography.Text>
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
          try {
            const nurseId = Number(localStorage.getItem('userId') ||"");
            const data = {
              className: values.className,
              healthScheduleId: selectedBatchForConsent.id,
              sendDate: consentDateRange[0].toISOString(),
              expireDate: consentDateRange[1].toISOString(),
              isAgreed: 'Chờ xác nhận',
              notes: values.notes,
              createdByNurseId: nurseId,
              updatedByNurseID: nurseId
            };
            await createHealthConsentForMultipleClasses(data);
            message.success('Gửi phiếu xác nhận thành công!');
            setIsConsentModalOpen(false);
            setSelectedBatchForConsent(null);
            consentForm.resetFields();
            setConsentDateRange([]);
          } catch (error) {
            message.error(getErrorMessage(error));
          }
        }
      });
    } catch (error) {
      message.error(getErrorMessage(error));
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
        <Input
          placeholder="Tìm kiếm đợt khám..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
                  status={batch.status === 'Đã xác nhận' ? 'success' : (batch.status === 'Đã lên lịch' ? 'warning' : (batch.status === 'Đã từ chối' ? 'error' : 'default'))} 
                  text={mapStatus(batch.status)}
                />
              </div>

              <div className="health-check-batch-card-info">
                <Space><CalendarOutlined /><Text>Ngày khám: {batch.scheduledDate ? formatDateTime(batch.scheduledDate) : '-'}</Text></Space>
                <Space><EnvironmentOutlined /><Text>Địa điểm: {batch.location}</Text></Space>
              </div>

              <div className="health-check-batch-card-info" style={{ marginTop: 8 }}>
                <Space>
                  <Text strong>Y tá chỉnh sửa:</Text> <Text>{batch.updatedByNurseName || '-'}</Text>
                </Space>
                <Space>
                  <Text strong>Ngày tạo:</Text> <Text>{batch.create_at ? formatDateTime(batch.create_at) : '-'}</Text>
                </Space>
              </div>

              {(batch.notes || batch.update_at) && (
                <div className="health-check-batch-card-info" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <Text type="secondary">Ghi chú:</Text> <Text>{batch.notes || '-'}</Text>
                  </span>
                  <span>
                    <Text strong>Cập nhật:</Text> <Text>{batch.update_at ? formatDateTime(batch.update_at) : '-'}</Text>
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
                {batch.status === 'Đã xác nhận' && (
                  <Button
                    icon={<SendOutlined />}
                    style={{ marginLeft: 8 }}
                    onClick={() => handleSendConsent(batch)}
                  >
                    Gửi phiếu xác nhận
                  </Button>
                )}
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
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={form} layout="vertical">
            <Form.Item name="batchName" label="Tên đợt khám"    
            rules={[
                    { required: true, message: 'Vui lòng nhập tên đợt' },
                    
                     { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
              <Input />
            </Form.Item>
            <Form.Item name="scheduledDateTime" label="Thời gian khám" rules={[{ required: true, message: 'Vui lòng chọn thời gian khám' }]}> 
              <DatePicker 
                showTime
                style={{ width: '100%' }} 
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn ngày và giờ khám"
                disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
              />
            </Form.Item>
            <Form.Item name="location" label="Địa điểm" rules={[
                    { required: true, message: 'Vui lòng nhập địa điểm' },
                    
                     { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
              <Input />
            </Form.Item>
            <Form.Item
              name="notes"
              label="Ghi chú"
              rules={[
                { required: true, message: 'Vui lòng nhập ghi chú' },
                
                 { validator: (_, value) => {
                    if (value === undefined || value === '') return Promise.resolve();
                    if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                    if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                    
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="Đã lên lịch" style={{ display: 'none' }}>
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
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="batchName" label="Tên đợt khám" rules={[
                    { required: true, message: 'Vui lòng nhập tên đợt' },
                    
                     { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
              <Input />
            </Form.Item>
            <Form.Item name="scheduledDateTime" label="Thời gian khám" rules={[{ required: true, message: 'Vui lòng chọn thời gian khám' }]}> 
              <DatePicker 
                showTime
                style={{ width: '100%' }} 
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn ngày và giờ khám"
                disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
              />
            </Form.Item>
            <Form.Item name="location" label="Địa điểm" rules={[
                    { required: true, message: 'Vui lòng nhập địa điểm' },
                    
                     { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!'); 
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
              <Input />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú"rules={[
                    { required: true, message: 'Vui lòng nhập ghi chú' },
                    
                     { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
              <TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái"style={ { display: 'none' }}>
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
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form form={consentForm} layout="vertical">
            <Form.Item name="className" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lớp' }]}> 
              <Select mode="multiple" placeholder="Chọn lớp" showSearch optionFilterProp="children">
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
                disabledDate={current => current && current < moment().startOf('day')}
              />
            </Form.Item>
            <Form.Item name="isAgreed" label="Trạng thái xác nhận" initialValue="Chờ phản hồi"> 
              <Select disabled>
                <Option value="Chờ phản hồi">Chờ phản hồi</Option>
                <Option value="Đồng ý">Đồng ý</Option>
                <Option value="Từ chối">Từ chối</Option>
              </Select>
            </Form.Item>
           
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HealthCheckBatchManager;
