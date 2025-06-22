import React, { useState, useEffect } from 'react';
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
  message,
  Spin
} from 'antd';
import './Vaccination-batch.css';
import moment from 'moment';

import { createVaccinationBatch, getVaccineTypeByName, getVaccinationBatches, updateVaccinationBatch } from '../../../../api/vaccinationAPI';

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

  // Function to get vaccine name by ID
  const getVaccineNameById = async (vaccineTypeID) => {
    try {
      const res = await getVaccineTypeByName('');
      if (Array.isArray(res.data)) {
        const vaccine = res.data.find(v => v.id === vaccineTypeID);
        return vaccine ? vaccine.name : 'Không xác định';
      }
      return 'Không xác định';
    } catch (error) {
      console.error('❌ [Vaccination Schedule] Lỗi khi lấy tên vaccine:', error);
      return 'Không xác định';
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await getVaccinationBatches();
      if (res.data && Array.isArray(res.data)) {
        // Get all vaccine types first
        const vaccineTypesRes = await getVaccineTypeByName('');
        const vaccineTypes = Array.isArray(vaccineTypesRes.data) ? vaccineTypesRes.data : [];
        
        const formattedSchedules = res.data.map((item, index) => {
          // Find vaccine name by vaccineTypeID
          const vaccine = vaccineTypes.find(v => v.id === item.vaccineTypeID);
          const vaccineName = vaccine ? vaccine.name : 'Không xác định';
          
          return {
            batchID: item.batchID,
            vaccine: vaccineName, 
            vaccineBatch: item.dot,
            scheduledDate: new Date(item.scheduled_date).toLocaleDateString('vi-VN'),
            originalScheduledDate: item.scheduled_date,
            location: item.location,
            nurseId: item.nurse_id,
            nurseName: item.nurse_name,
            status: item.status,
            studentsCount: item.quantity_received || 0,
            notes: item.notes,
            consentsSent: false,
            approvedConsents: 0,
            vaccineTypeID: item.vaccineTypeID,
            created_by_nurse_id: item.nurse_id,
            created_by_nurse_name: item.nurse_name,
            created_at: item.created_at
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
    let result = schedules;

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
      const nurseId = Number(localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || 1);
      const nurseName = localStorage.getItem('fullname') || 'Y tá Mặc định';
      
      const vaccineTypeID = Number(values.vaccineTypeID || 0);
      
      const quantityReceived = Number(values.quantity_received);
      
      // Convert date to ISO format using moment (DatePicker returns a moment object)
      const scheduledDate = values.scheduledDate.toISOString();
      
      const payload = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nurse_id: Number(nurseId),
        dot: String(values.vaccine_batch || ''), // "dot" is now the vaccine batch
        quantity_received: Number(quantityReceived),
        scheduled_date: scheduledDate,
        location: String(values.location || ''),
        status: String(values.status || 'pending'),
        notes: String(values.notes || ''),
        nurse_name: String(nurseName),
        vaccineTypeID: Number(vaccineTypeID)
      };
      
      console.log('🚀 [Vaccination Schedule] Gửi payload tạo đợt tiêm:', payload);
      
      const response = await createVaccinationBatch(payload);

      // Log the entire response from the server to check the keys
      console.log('✅ [Vaccination Schedule] Phản hồi từ server khi tạo mới:', response.data);
      
      const newBatchData = response.data;

      // Find vaccine name from existing options
      const vaccine = vaccineOptions.find(v => v.id === newBatchData.vaccineTypeID);
      const vaccineName = vaccine ? vaccine.name : 'Không xác định';

      // Format the new batch from response to match the state structure
      const formattedNewBatch = {
        batchID: newBatchData.batchID,
        vaccine: vaccineName,
        vaccineBatch: newBatchData.dot,
        scheduledDate: new Date(newBatchData.scheduled_date).toLocaleDateString('vi-VN'),
        originalScheduledDate: newBatchData.scheduled_date,
        location: newBatchData.location,
        nurseId: newBatchData.nurse_id,
        nurseName: newBatchData.nurse_name,
        status: newBatchData.status,
        studentsCount: newBatchData.quantity_received || 0,
        notes: newBatchData.notes,
        consentsSent: false,
        approvedConsents: 0,
        vaccineTypeID: newBatchData.vaccineTypeID,
        created_by_nurse_id: newBatchData.nurse_id,
        created_by_nurse_name: newBatchData.nurse_name,
        created_at: newBatchData.created_at
      };

      // Add the new schedule to the state without re-fetching
      setSchedules(prevSchedules => [formattedNewBatch, ...prevSchedules]);
      
      form.resetFields();
      setIsCreateModalOpen(false);
      message.success('Đợt tiêm chủng đã được tạo thành công');
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc hoặc có lỗi khi tạo đợt tiêm');
    }
  };

  const handleSendConsents = (scheduleId) => {
    setSchedules(schedules.map(schedule => 
      schedule.batchID === scheduleId 
        ? { ...schedule, consentsSent: true }
        : schedule
    ));
    message.success('Phiếu đồng ý đã được gửi đến tất cả phụ huynh');
  };

  const handleConfirmSchedule = (scheduleId) => {
    setSchedules(schedules.map(schedule => 
      schedule.batchID === scheduleId 
        ? { ...schedule, status: 'confirmed' }
        : schedule
    ));
    message.success('Lịch tiêm đã được xác nhận');
  };

  // Handle edit schedule
  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    
    // Convert original date to moment object for DatePicker
    const momentDate = moment(schedule.originalScheduledDate);
    
    editForm.setFieldsValue({
      batchId: schedule.batchID,
      vaccine: schedule.vaccine, // Sử dụng tên vaccine
      vaccineTypeID: schedule.vaccineTypeID, // Use the stored vaccineTypeID
      vaccine_batch: schedule.vaccineBatch, // Set vaccine batch
      quantity_received: schedule.studentsCount,
      scheduledDate: momentDate, // DatePicker expects a moment object
      location: schedule.location,
      status: schedule.status,
      nurse_name: schedule.nurseName,
      notes: schedule.notes || ''
    });
    
    setIsEditModalOpen(true);
  };

  // Handle update schedule
  const handleUpdateSchedule = async () => {
    try {
      const values = await editForm.validateFields();
      const nurseId = Number(localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || 1);
      const nurseName = localStorage.getItem('fullname') || 'Y tá Mặc định';
      
      const vaccineTypeID = Number(values.vaccineTypeID || 0);
      
      const quantityReceived = Number(values.quantity_received);
      
      // Convert date to ISO format using moment (DatePicker returns a moment object)
      const scheduledDate = values.scheduledDate.toISOString();
      const batchId = editForm.getFieldValue('batchId');
      
      const payload = {
        created_at: selectedSchedule.created_at, // Use original created_at
        updated_at: new Date().toISOString(),
        edit_nurse_id: Number(nurseId),
        dot: String(values.vaccine_batch || ''), // "dot" is now the vaccine batch
        quantity_received: Number(quantityReceived),
        scheduled_date: scheduledDate,
        location: String(values.location || ''),
        status: String(values.status || 'pending'),
        notes: String(values.notes || ''),
        edit_nurse_name: String(nurseName),
        created_by_nurse_id: Number(selectedSchedule.created_by_nurse_id),
        created_by_nurse_name: String(selectedSchedule.created_by_nurse_name),
        vaccineTypeID: Number(vaccineTypeID)
      };
      
      console.log('🚀 [Vaccination Schedule] Gửi payload cập nhật đợt tiêm:', payload);
      
      const response = await updateVaccinationBatch(batchId, payload);
      const updatedBatchData = response.data;

      // Find vaccine name from existing options
      const vaccine = vaccineOptions.find(v => v.id === updatedBatchData.vaccineTypeID);
      const vaccineName = vaccine ? vaccine.name : 'Không xác định';
      
      const formattedUpdatedBatch = {
        ...selectedSchedule, // Preserve existing fields like consentsSent
        batchID: updatedBatchData.batchID,
        vaccine: vaccineName,
        vaccineBatch: updatedBatchData.dot,
        scheduledDate: new Date(updatedBatchData.scheduled_date).toLocaleDateString('vi-VN'),
        originalScheduledDate: updatedBatchData.scheduled_date,
        location: updatedBatchData.location,
        status: updatedBatchData.status,
        studentsCount: updatedBatchData.quantity_received || 0,
        notes: updatedBatchData.notes,
        vaccineTypeID: updatedBatchData.vaccineTypeID,
        nurseId: updatedBatchData.created_by_nurse_id, // Keep original creator
        nurseName: updatedBatchData.created_by_nurse_name, // Keep original creator's name
        created_at: updatedBatchData.created_at,
        // updated_at can be updated if needed
        updated_at: updatedBatchData.updated_at, 
      };

      // Update the schedule in the state without re-fetching
      setSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.batchID === formattedUpdatedBatch.batchID ? formattedUpdatedBatch : schedule
        )
      );

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

  // Unique vaccine names for filter dropdown
  const uniqueVaccineNames = [...new Set(schedules.map(s => s.vaccine).filter(Boolean))];

  return (
    <div className="vaccination-schedule-container">
      <div className="vaccination-schedule-header">
        <div>
          <Title level={2}>Quản lý Đợt tiêm chủng</Title>
          <Text type="secondary">Tạo và quản lý các đợt tiêm chủng cho học sinh</Text>
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
        <Input.Search
          placeholder="Tìm kiếm đợt tiêm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onSearch={value => setSearchTerm(value)}
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
          <Option value="pending">Chờ xác nhận</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="completed">Hoàn thành</Option>
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
                    Loại: {schedule.vaccine} | Y tá phụ trách: {schedule.nurseName}
                  </Text>
                </div>
                <Badge 
                  status={getStatusColor(schedule.status)} 
                  text={getStatusText(schedule.status)}
                />
              </div>

              <div className="vaccination-schedule-card-info">
                <Space><CalendarOutlined /><Text>Ngày: {schedule.scheduledDate}</Text></Space>
                <Space><EnvironmentOutlined /><Text>{schedule.location}</Text></Space>
                <Space><TeamOutlined /><Text>{schedule.studentsCount} liều vắc xin</Text></Space>
              </div>

              <Card 
                title="Tiến trình thực hiện"
                className="vaccination-schedule-progress-card"
                bodyStyle={{ padding: 0 }}
              >
                <div className="vaccination-schedule-progress-list">
                  <div className="progress-item">
                    <Text>Phiếu đồng ý đã gửi</Text>
                    <Badge 
                      status={schedule.consentsSent ? 'success' : 'default'} 
                      text={schedule.consentsSent ? 'Đã gửi' : 'Chưa gửi'}
                    />
                  </div>
                  {schedule.consentsSent && (
                    <div className="progress-item">
                      <Text>Đồng ý tiêm</Text>
                      <Text strong className="progress-item-value">
                        {schedule.approvedConsents}/{schedule.studentsCount}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>

              <div className="vaccination-schedule-actions">
                {!schedule.consentsSent && (
                  <Button 
                    icon={<SendOutlined />}
                    onClick={() => handleSendConsents(schedule.batchID)}
                  >
                    Gửi phiếu đồng ý
                  </Button>
                )}
                
                {schedule.consentsSent && schedule.status === 'pending' && (
                  <Button 
                    type="primary"
                    onClick={() => handleConfirmSchedule(schedule.batchID)}
                  >
                    Xác nhận lịch tiêm
                  </Button>
                )}

                <Button 
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(schedule)}
                >
                  Chỉnh sửa
                </Button>
                
                <Button 
                  icon={<DeleteOutlined />}
                  danger
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
            label="Đợt vaccine"
            rules={[{ required: true, message: 'Vui lòng nhập đợt vaccine' }]}
          >
            <Input placeholder="Nhập đợt vaccine (VD: Đợt 1, Đợt 2, v.v.)" />
          </Form.Item>

          <Form.Item
            name="quantity_received"
            label="Số lượng vaccine nhận"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng vaccine nhận' }]}
          >
            <Input type="number" min={1} placeholder="Nhập số lượng vaccine nhận" />
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
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            initialValue="pending"
          >
            <Select>
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="nurse_name"
            label="Y tá phụ trách"
            initialValue={localStorage.getItem('fullname') || 'Y tá Mặc định'}
          >
            <Input 
              disabled 
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Ghi chú thêm về đợt tiêm..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đợt tiêm chủng"
        open={isEditModalOpen}
        onCancel={handleCancelEdit}
        onOk={handleUpdateSchedule}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="batchId"
            label="Mã đợt tiêm"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="vaccine"
            label="Loại vaccine"
            rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
          >
            <Select
              placeholder="Chọn loại vaccine"
              loading={loadingVaccines}
              onChange={(value) => handleVaccineChange(value, editForm)}
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
            label="Đợt vaccine"
            rules={[{ required: true, message: 'Vui lòng nhập đợt vaccine' }]}
          >
            <Input placeholder="Nhập đợt vaccine (VD: Đợt 1, Đợt 2, v.v.)" />
          </Form.Item>

          <Form.Item
            name="quantity_received"
            label="Số lượng vaccine nhận"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng vaccine nhận' }]}
          >
            <Input type="number" min={1} placeholder="Nhập số lượng vaccine nhận" />
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
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="nurse_name"
            label="Y tá phụ trách"
          >
            <Input disabled />
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
