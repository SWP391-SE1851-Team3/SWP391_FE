import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
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
  Badge, 
  Space, 
  Typography, 
  message,
  Spin,
  Row,
  Col
} from 'antd';
import './Vaccination-batch.css';
import moment from 'moment';
import { formatDateTime } from '../../../../utils/formatDate';
import { hasNoSpecialCharacters, isOnlyWhitespace, isFirstCharUppercase  } from '../../../../validations/stringValidations';
import { createVaccinationBatch, getVaccineTypeByName, getVaccinationBatches, updateVaccinationBatch, sendConsentFormByClassName} from '../../../../api/vaccinationAPI';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VaccinationScheduleManager = () => {
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [vaccineOptions, setVaccineOptions] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editForm] = Form.useForm();

  // State for consent modal
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentForm] = Form.useForm();
  const [sendingConsent, setSendingConsent] = useState(false);
  const [selectedBatchForConsent, setSelectedBatchForConsent] = useState(null);
  const [consentDateRange, setConsentDateRange] = useState([null, null]);
  const [selectedScheduledDate, setSelectedScheduledDate] = useState(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await getVaccinationBatches();
      if (res.data && Array.isArray(res.data)) {
        // Get all vaccine types first
        const vaccineTypesRes = await getVaccineTypeByName('');
        const vaccineTypes = Array.isArray(vaccineTypesRes.data) ? vaccineTypesRes.data : [];
        
        const formattedSchedules = res.data.map((item) => {
          // Find vaccine name by vaccineTypeID
          const vaccine = vaccineTypes.find(v => v.id === item.vaccineTypeID);
          const vaccineName = vaccine ? vaccine.name : 'Không xác định';
          
          return {
            batchID: item.batchID,
            vaccine: vaccineName, 
            vaccineBatch: item.dot,
            scheduledDate: item.scheduled_date, // Giữ nguyên date gốc như health-check-batch
            location: item.location,
            status: item.status,
            studentsCount: item.quantity_received || 0,
            notes: item.notes,
            consentsSent: false,
            approvedConsents: 0,
            vaccineTypeID: item.vaccineTypeID,
            created_by_nurse_id: item.created_by_nurse_id,
            created_by_nurse_name: item.created_by_nurse_name,
            created_at: item.created_at,
            updated_at: item.updated_at,
            edit_nurse_id: item.edit_nurse_id,
            edit_nurse_name: item.edit_nurse_name,
          };
        });
        setSchedules(formattedSchedules);
      }
    } catch (error) {
      message.error('Không thể tải danh sách đợt tiêm chủng.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đợt tiêm khi component được mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter and search logic
  useEffect(() => {
    // Sắp xếp schedules theo ngày tiêm mới nhất lên trên
    let result = [...schedules].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

    if (searchTerm) {
      result = result.filter(schedule =>
        (schedule.vaccineBatch || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(schedule => schedule.status === statusFilter);
    }

    if (vaccineFilter !== 'all') {
      result = result.filter(schedule => schedule.vaccine === vaccineFilter);
    }

    setFilteredSchedules(result);
  }, [schedules, searchTerm, statusFilter, vaccineFilter]);

  // Lấy danh sách vaccine khi mở modal
  useEffect(() => {
    if (isCreateModalOpen) {
      setLoadingVaccines(true);
      getVaccineTypeByName('')
        .then(res => {
          if (Array.isArray(res.data)) {
            setVaccineOptions(res.data);
          } else {
            setVaccineOptions([]);
          }
        })
        .catch(() => setVaccineOptions([]))
        .finally(() => setLoadingVaccines(false));
      form.resetFields();
      const fullName = localStorage.getItem('fullname') || 'Y tá Mặc định';
      form.setFieldsValue({ nurse_name: fullName });
    }
  }, [isCreateModalOpen, form]);

  // Khi chọn loại vaccine, tự động lấy vaccineTypeID
  const handleVaccineChange = (vaccineName, targetForm = form) => {
    const selectedVaccine = vaccineOptions.find(vaccine => vaccine.name === vaccineName);
    if (selectedVaccine) {
      const vaccineId = selectedVaccine.id;
      targetForm.setFieldsValue({ vaccineTypeID: vaccineId });
      console.log('✅ [Vaccination Schedule] Đã chọn vaccine:', { name: selectedVaccine.name, id: vaccineId });
      return vaccineId;
    } else {
      targetForm.setFieldsValue({ vaccineTypeID: '' });
      console.warn('⚠️ [Vaccination Schedule] Không tìm thấy vaccine:', vaccineName);
      return null;
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const values = await form.validateFields();
      const nurseId = Number(localStorage.getItem('userId') || 1);
      const nurseName = localStorage.getItem('fullname') || 'Y tá Mặc định';
      const vaccineTypeID = Number(values.vaccineTypeID || 0);
      let scheduledDate = new Date().toISOString(); // fallback
      if (values.scheduledDateTime) {
        scheduledDate = values.scheduledDateTime.add(7, 'hours').toISOString();
      }
      // Tự động lấy thời gian hiện tại và cộng thêm 7 tiếng
      const currentTime = moment().add(7, 'hours').toISOString();
     
      const payload = {
        created_at: currentTime,
        updated_at: currentTime,
        created_by_nurse_id: nurseId,
        created_by_nurse_name: nurseName,
        edit_nurse_id: nurseId,
        edit_nurse_name: nurseName,
        dot: String(values.vaccine_batch || ''),
        scheduled_date: scheduledDate,
        location: String(values.location || ''),
        status: values.status || 'Chờ xác nhận',
        notes: String(values.notes || ''),
        vaccineTypeID: vaccineTypeID
      };

      console.log('🚀 [Vaccination Schedule] Gửi payload tạo đợt tiêm:', payload);
      const response = await createVaccinationBatch(payload);
      
      // Log the entire response from the server to check the keys
      console.log('✅ [Vaccination Schedule] Phản hồi từ server khi tạo mới:', response.data);
      
      // Sau khi tạo mới thành công, reload lại danh sách từ server
      await fetchSchedules();
      form.resetFields();
      setIsCreateModalOpen(false);
      message.success('Đợt tiêm chủng đã được tạo thành công');
    } catch (error) {
      // Nếu có phản hồi cụ thể từ API, hiện ra cho user bằng Modal
      let errorMsg = 'Vui lòng điền đầy đủ thông tin bắt buộc hoặc có lỗi khi tạo đợt tiêm';
      if (error?.response?.data) {
        errorMsg = error.response.data;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      Modal.error({
        title: 'Thông báo lỗi',
        content: errorMsg,
        okText: 'OK',
      });
    }
  };

  // Handle edit schedule
  const handleEdit = async (schedule) => {
    setSelectedSchedule(schedule);
    // Lấy danh sách vaccine types trước khi set form
    const res = await getVaccineTypeByName('');
    if (Array.isArray(res.data)) {
      setVaccineOptions(res.data);
    } else {
      setVaccineOptions([]);
    }
    // Chuyển đổi scheduledDate thành moment object (like health-check-batch)
    const scheduledDateTime = schedule.scheduledDate ? moment(schedule.scheduledDate) : null;
    editForm.setFieldsValue({
      batchId: schedule.batchID,
      vaccine: schedule.vaccine, // Sử dụng tên vaccine
      vaccineTypeID: schedule.vaccineTypeID, // Use the stored vaccineTypeID
      vaccine_batch: schedule.vaccineBatch, // Set vaccine batch
      scheduledDateTime: scheduledDateTime, // DatePicker with showTime expects a Date object
      location: schedule.location,
      status: schedule.status,
      nurse_name: schedule.created_by_nurse_name, // Điền tên y tá tạo
      notes: schedule.notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle update schedule
  const handleUpdateSchedule = async () => {
    try {
      const values = await editForm.validateFields();
      const nurseId = Number(localStorage.getItem('userId') || "");
      const nurseName = localStorage.getItem('fullname') || 'Y tá Mặc định';
      const batchId = editForm.getFieldValue('batchId');
      const vaccineTypeID = Number(values.vaccineTypeID || 0);
      const createdAt = selectedSchedule.created_at;
      // Tự động lấy thời gian hiện tại và cộng thêm 7 tiếng
      const updatedAt = moment().add(7, 'hours').toISOString();
    
      // Chỉ gửi đúng các trường cần thiết cho API
      const payload = {
        created_at: createdAt, // giữ nguyên ngày tạo cũ
        updated_at: updatedAt,
        edit_nurse_id: nurseId,
        dot: String(values.vaccine_batch || ''),
        location: String(values.location || ''),
        status: values.status || 'Chờ xác nhận',
        notes: String(values.notes || ''),
        edit_nurse_name: nurseName,
        batchID: batchId,
        vaccineTypeID: vaccineTypeID
      };

            // Kết hợp ngày và giờ (like health-check-batch)
      let scheduleDateTime = new Date().toISOString();
      if (values.scheduledDateTime) {
        scheduleDateTime = values.scheduledDateTime.add(7, 'hours').toISOString();
      }
      payload.scheduled_date = scheduleDateTime;
      
      console.log('🚀 [Vaccination Schedule] Gửi payload cập nhật đợt tiêm:', payload);
      const response = await updateVaccinationBatch(batchId, payload);
      const updatedBatchData = response.data;

      // Log response để debug
      console.log('✅ [Vaccination Schedule] Phản hồi từ server khi cập nhật:', updatedBatchData);

      // Sau khi cập nhật thành công, reload lại danh sách từ server
      await fetchSchedules();
      
      editForm.resetFields();
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
      message.success('Đợt tiêm chủng đã được cập nhật thành công');
    } catch (error) {
      console.error('❌ [Vaccination Schedule] Lỗi khi cập nhật đợt tiêm:', error);
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc hoặc có lỗi khi cập nhật đợt tiêm');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
    editForm.resetFields();
  };

  // Unique vaccine names for filter dropdown
  const uniqueVaccineNames = [...new Set(schedules.map(s => s.vaccine).filter(Boolean))];

  const handleOpenConsentModal = (schedule) => {
    setSelectedBatchForConsent(schedule);
    setConsentDateRange([null, null]);
    // Lưu thời gian tiêm đã chọn để làm điều kiện cho DatePicker
    setSelectedScheduledDate(schedule.scheduledDate ? moment(schedule.scheduledDate) : null);
    consentForm.setFieldsValue({
      className: [],
      batchId: schedule.batchID,
      sendDate: null,
      expireDate: null,
      status: 'Chờ xác nhận',
    });
    setIsConsentModalOpen(true);
  };

  const handleSendConsentForm = async () => {
    try {
      setSendingConsent(true);
      const values = await consentForm.validateFields();
      if (!consentDateRange || consentDateRange.length !== 2) {
        message.error('Vui lòng chọn khoảng thời gian gửi và hết hạn!');
        return;
      }
      
      // Kiểm tra thời gian gửi phiếu và hết hạn có vượt quá thời gian tiêm không
      if (selectedScheduledDate) {
        const sendDate = consentDateRange[0];
        const expireDate = consentDateRange[1];
        
        if (sendDate && sendDate > selectedScheduledDate) {
          message.error('Thời gian gửi phiếu không được vượt quá thời gian tiêm!');
          return;
        }
        
        if (expireDate && expireDate > selectedScheduledDate) {
          message.error('Thời gian hết hạn không được vượt quá thời gian tiêm!');
          return;
        }
      }
      
      // Kiểm tra ngày gửi và ngày hết hạn không được cùng một ngày
      const sendDateCheck = consentDateRange[0];
      const expireDateCheck = consentDateRange[1];
      
      if (sendDateCheck && expireDateCheck && sendDateCheck.isSame(expireDateCheck, 'day')) {
        message.error('Ngày gửi và ngày hết hạn không được chọn cùng một ngày!');
        return;
      }
      let sendDate = consentDateRange[0] ? consentDateRange[0].add(7, 'hours').toISOString() : '';
      let expireDate = consentDateRange[1] ? consentDateRange[1].add(7, 'hours').toISOString() : '';
      // Hiển thị xác nhận lại thông tin trước khi gửi
      Modal.confirm({
        title: <span style={{fontWeight:900, fontSize:20, color:'#faad14'}}>Xác nhận gửi phiếu cho phụ huynh</span>,
        icon: null,
        content: (
          <div style={{textAlign:'center', padding:'12px 0'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'start', gap:12}}>
            <Typography.Paragraph style={{fontSize:20, marginBottom:10}}>
              Vui lòng kiểm tra lại thông tin :
            </Typography.Paragraph> 
              <Typography.Text strong style={{fontSize:16}}>Tên lớp: {Array.isArray(values.className) ? values.className.join(', ') : values.className}</Typography.Text>
              <Typography.Text strong style={{fontSize:16}}>Tên đợt tiêm: {selectedBatchForConsent?.vaccineBatch}</Typography.Text>
              <Typography.Text strong style={{fontSize:16}}>Địa điểm: {selectedBatchForConsent?.location}</Typography.Text>
                                           <Typography.Text style={{fontSize:16}}>
                <b>Thời gian gửi phiếu:</b> <span style={{color:'#52c41a'}}>{consentDateRange[0] ? consentDateRange[0].format('DD/MM/YYYY HH:mm') : 'Chưa chọn'}</span>
              </Typography.Text>
              <Typography.Text style={{fontSize:16}}>
                <b>Thời gian hết hạn:</b> <span style={{color:'#fa541c'}}>{consentDateRange[1] ? consentDateRange[1].format('DD/MM/YYYY HH:mm') : 'Chưa chọn'}</span>
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
            const nurseId = Number(localStorage.getItem('userId') || "");
            const data = {
              className: values.className,
              batchId: selectedBatchForConsent.batchID,
              sendDate: sendDate,
              expireDate: expireDate,
              status: 'Chờ xác nhận',
              createdByNurseId: nurseId,
              updatedByNurseID: nurseId
            };
            await sendConsentFormByClassName(data);
            message.success('Gửi phiếu đồng ý thành công!');
            setIsConsentModalOpen(false);
            consentForm.resetFields();
          } catch (error) {
            let errorMsg = 'Gửi phiếu đồng ý thất bại!';
            if (error?.response?.data?.message) {
              errorMsg = error.response.data.message;
            }
            Modal.error({
              title: 'Có lỗi khi gửi phiếu',
              content: (
                <div>
                  {errorMsg.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              ),
              okText: 'Đóng'
            });
            setSendingConsent(false);
          }
        },
        onCancel: () => setSendingConsent(false)
      });
    } catch (error) {
      message.error('Gửi phiếu đồng ý thất bại!');
      setSendingConsent(false);
    }
  };

  return (
    <div className="vaccination-schedule-container">
      <div className="vaccination-schedule-header">
        <div>
          <Title level={2} >Quản lý Đợt tiêm chủng</Title>
        
        </div>
        
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          className="vaccination-schedule-create-btn"
        >
          Tạo đợt tiêm mới
        </Button>
      </div>

      <div className="vaccination-schedule-filters">
        <Input
          placeholder="Tìm kiếm đợt tiêm..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          value={vaccineFilter}
          onChange={value => setVaccineFilter(value)}
          style={{ width: 220 }}
        >
          <Option value="all">Tất cả loại vaccine</Option>
          {uniqueVaccineNames.map(vaccineName => (
            <Option key={vaccineName} value={vaccineName}>
              {vaccineName}
            </Option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          style={{ width: 180 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="Chờ xác nhận">Chờ xác nhận</Option>
          <Option value="Đã xác nhận">Đã xác nhận</Option>
          <Option value="Đã từ chối">Đã từ chối</Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="vaccination-schedule-list">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.batchID} className="vaccination-schedule-card">
              <div className="vaccination-schedule-card-header">
                <div>
                  <Title level={4}>{schedule.vaccineBatch || 'Chưa có đợt'}</Title>
                  <Text type="secondary">
                    Loại: {schedule.vaccine} | Y tá tạo: {schedule.created_by_nurse_name}
                  </Text>
                </div>
                <Badge 
                  status={(() => {
                    switch (schedule.status) {
                      case 'Đã xác nhận': return 'success';
                      case 'Đã từ chối': return 'error';
                      case 'Chờ xác nhận': return 'warning';
                      default: return 'default';
                    }
                  })()} 
                  text={schedule.status}
                />
              </div>

              <div className="vaccination-schedule-card-info">
                <Space><CalendarOutlined /><Text>Thời gian tiêm: {schedule.scheduledDate ? formatDateTime(schedule.scheduledDate) : '-'}</Text></Space>
                <Space><EnvironmentOutlined /><Text>Địa điểm: {schedule.location}</Text></Space>
                
              </div>
              <div className="vaccination-schedule-card-info" style={{ marginTop: 8 }}>
                <Space>
                  <Text strong>Y tá chỉnh sửa:</Text> <Text>{schedule.edit_nurse_name || '-'}</Text>
                </Space>
              </div>

              <div className="vaccination-schedule-card-info" style={{ marginTop: 8 }}>
                <Space>
                  <Text strong>Ngày tạo:</Text> <Text>{schedule.created_at ? formatDateTime(schedule.created_at) : '-'}</Text>
                </Space>
                <Space>
                  <Text strong>Cập nhật:</Text> <Text>{schedule.updated_at ? formatDateTime(schedule.updated_at) : '-'}</Text>
                </Space>
              </div>

              {schedule.notes && (
                <div className="vaccination-schedule-card-info" style={{ marginTop: 8 }}>
                  <Space>
                    <Text type="secondary">Ghi chú:</Text> <Text>{schedule.notes || '-'}</Text>
                  </Space>
                </div>
              )}

              <div className="vaccination-schedule-card-actions">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(schedule)}
                >
                  Chỉnh sửa
                </Button>
                {schedule.status === 'Đã xác nhận' && (
                  <Button
                    icon={<SendOutlined />}
                    style={{ marginLeft: 8 }}
                    onClick={() => handleOpenConsentModal(schedule)}
                  >
                    Gửi phiếu đồng ý
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Tạo đợt tiêm chủng mới</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateSchedule}
        okText="Tạo đợt tiêm"
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        width={600}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>

        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="vaccine"
            label="Loại vaccine"
            rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
          >
            <Select
              placeholder="Chọn loại vaccine"
              loading={loadingVaccines}
              onChange={(value) => handleVaccineChange(value, form)}
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {vaccineOptions.map((vaccine) => (
                <Option key={vaccine.id} value={vaccine.name}>{vaccine.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Hidden field to store vaccineTypeID */}
          <Form.Item name="vaccineTypeID" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="vaccine_batch"
            label="Tên đợt vaccine"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đợt vaccine' },
              
               { validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                  if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                  if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="Nhập tên đợt vaccine" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[
              { required: true, message: 'Vui lòng nhập địa điểm' },
              
               { validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                  if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                  if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="scheduledDateTime"
            label="Thời gian tiêm"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian tiêm' }]}
          >
            <DatePicker 
              showTime
              style={{ width: '100%' }} 
              format="YYYY-MM-DD HH:mm"
              placeholder="Chọn ngày và giờ tiêm"
              disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[
               { validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                  if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                  if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TextArea rows={4} placeholder="Ghi chú thêm về đợt tiêm..." />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="Chờ xác nhận"
            style={{ display: 'none' }}
          >
            <Select disabled>
              <Option value="Chờ xác nhận">Chờ xác nhận</Option>
              <Option value="Đã xác nhận">Đã xác nhận</Option>
              <Option value="Đã từ chối">Đã từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="nurse_name"
            label="Y tá phụ trách"
            initialValue={localStorage.getItem('fullname') || 'Y tá Mặc định'}
            style={{ display: 'none' }}
          >
            <Input 
              disabled 
            />
          </Form.Item>
        </Form>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chỉnh sửa đợt tiêm chủng</span>}
        open={isEditModalOpen}
        onCancel={handleCancelEdit}
        onOk={handleUpdateSchedule}
        okText="Cập nhật"
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}
      >
         <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
        <Form
          form={editForm}
          layout="vertical"
          style={{ maxWidth: 700, margin: '0 auto' }}
        >
          <Form.Item
            name="batchId"
            label={<span style={{ fontWeight: 600 }}>Mã đợt tiêm</span>}
            style={{ marginBottom: 18 }}
            hidden
          >
            <Input disabled style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            
              <Form.Item
                name="vaccine"
                label={<span style={{ fontWeight: 600 }}>Loại vaccine</span>}
                rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
                style={{ marginBottom: 18 }}
              >
                <Select
                  placeholder="Chọn loại vaccine"
                  loading={loadingVaccines}
                  onChange={(value) => handleVaccineChange(value, editForm)}
                  showSearch
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                  style={{ borderRadius: 8 }}
                >
                  {vaccineOptions.map((vaccine) => (
                    <Option key={vaccine.id} value={vaccine.name}>{vaccine.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            
            <Col span={12}>
              <Form.Item name="vaccineTypeID" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="vaccine_batch"
                label={<span style={{ fontWeight: 600 }}>Tên đợt vaccine</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đợt vaccine' },
                  
                   { validator: (_, value) => {
                      if (value === undefined || value === '') return Promise.resolve();
                      if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                      if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                      if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                     return Promise.resolve();
                    }
                  }
                ]}
              
                style={{ marginBottom: 18 }}
              >
                <Input placeholder="Nhập tên đợt vaccine" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label={<span style={{ fontWeight: 600 }}>Địa điểm</span>}
                style={{ marginBottom: 18 }}
                rules={[
                  { required: true, message: 'Vui lòng nhập địa điểm' },
                  
                   { validator: (_, value) => {
                      if (value === undefined || value === '') return Promise.resolve();
                      if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                      if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                      if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                     return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
          <Col span={12}>
              <Form.Item
                name="nurse_name"
                label={<span style={{ fontWeight: 600 }}>Y tá phụ trách</span>}
                style={{ display: 'none' }}
                
              >
                <Input disabled style={{ borderRadius: 8, background: '#f0f5ff' }} />
              </Form.Item>
            </Col>
           
            <Col span={12}>
              <Form.Item
                name="status"
                label={<span style={{ fontWeight: 600 }}>Trạng thái</span>}
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                style={{ display: 'none' }}
                initialValue={"Chờ xác nhận"}
              >
                {/* <Select style={{ borderRadius: 8 }} disabled>
                  <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                 
                  <Option value="Đã từ chối">Đã từ chối</Option>
                </Select> */}
                <Input disabled/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="scheduledDateTime"
            label={<span style={{ fontWeight: 600 }}>Thời gian tiêm</span>}
            rules={[{ required: true, message: 'Vui lòng chọn thời gian tiêm' }]}
            style={{ marginBottom: 18 }}
          >
            <DatePicker 
              showTime
              style={{ width: '100%', borderRadius: 8 }} 
              format="YYYY-MM-DD HH:mm"
              placeholder="Chọn ngày và giờ tiêm"
              disabledDate={current => current && current < new Date().setHours(0,0,0,0)}
            />
          </Form.Item>
          <Form.Item
            name="notes"
            label={<span style={{ fontWeight: 600 }}>Ghi chú</span>}
            style={{ marginBottom: 0 }}
                 validateTrigger="onChange"
            rules={[
               { validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                  if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                  if (!isFirstCharUppercase(value)) return Promise.reject('Ký tự đầu tiên phải viết hoa!'); 
                 return Promise.resolve();
                }
              }
            ]}
          >
            <TextArea rows={4} placeholder="Ghi chú thêm về đợt tiêm..." style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
        </div>
      </Modal>

      {/* Consent Modal */}
      <Modal
       
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Gửi phiếu đồng ý</span>}
        open={isConsentModalOpen}
        onCancel={() => {
          setIsConsentModalOpen(false);
          setSelectedScheduledDate(null);
        }}
        onOk={handleSendConsentForm}
        okText="Gửi phiếu"
        confirmLoading={sendingConsent}
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
         <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
        <Form form={consentForm} layout="vertical">
          <Form.Item
            name="className"
            label="Tên lớp"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lớp' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn lớp"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              <Select.Option value="Lớp 5A">Lớp 5A</Select.Option>
              <Select.Option value="Lớp 4B">Lớp 4B</Select.Option>
              <Select.Option value="Lớp 3C">Lớp 3C</Select.Option>
              <Select.Option value="Lớp 2A">Lớp 2A</Select.Option>
              <Select.Option value="Lớp 1B">Lớp 1B</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="batchId"
            label="Mã đợt tiêm"
            rules={[{ required: true, message: 'Vui lòng nhập mã đợt tiêm' }]}
            style={{ display: 'none' }}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="consentDateRange"
            label="Chọn khoảng thời gian gửi phiếu"
            rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian gửi phiếu' }]}
          >
            <DatePicker.RangePicker
              showTime
              style={{ width: '100%' }}
              value={consentDateRange}
              onChange={setConsentDateRange}
              format="YYYY-MM-DD HH:mm"
              placeholder={["Ngày gửi phiếu", "Ngày hết hạn"]}
              disabledDate={current => {
                if (!current) return false;
                // Không cho chọn ngày trong quá khứ
                if (current < moment().startOf('day')) return true;
                // Nếu có thời gian tiêm đã chọn, không cho chọn ngày sau ngày tiêm
                if (selectedScheduledDate && current > selectedScheduledDate.endOf('day')) return true;
                return false;
              }}
            />
          </Form.Item>
          
        </Form>
        </div>
      </Modal>
    </div>
  );
};

export default VaccinationScheduleManager;
