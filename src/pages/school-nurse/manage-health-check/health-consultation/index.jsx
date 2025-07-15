import React, { useState, useEffect } from 'react';
import { PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Modal, Form, Typography, Row, Col, Tag, Space, message, Statistic, Badge, Alert, Checkbox, DatePicker } from 'antd';
import './health-consultation.css';
import { getAllHealthConsultations, updateHealthConsultation } from '../../../../api/healthCheckAPI';
import { formatDateTime } from '../../../../utils/formatDate';
import {isOnlyWhitespace, hasNoSpecialCharacters } from '../../../../validations';
import moment from 'moment';
const { Title, Text } = Typography;
const { Option } = Select;

const HealthConsultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [editingConsultation, setEditingConsultation] = useState(null);



  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await getAllHealthConsultations();
        setConsultations(data.map(item => ({
          id: item.consultID,
          studentID: item.studentID,
          consultDate: item.consultDate,
          studentName: item.studentName,
          className: item.className,
          checkID: item.checkID,
          status: item.status,
          reason: item.reason,
          create_at: item.create_at,
          update_at: item.update_at,
          createdByNurseName: item.createdByNurseName,
          updatedByNurseName: item.updatedByNurseName,
          updatedByNurseID: item.updatedByNurseID,
          createdByNurseID: item.createdByNurseID,
          location: item.location || ''
        })));
      } catch (err) {
        message.error('Lỗi khi tải danh sách tư vấn y tế');
      }
    };
    fetchConsultations();
  }, []);

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || consultation.className === typeFilter;
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'Đã hoàn thành').length,
    pending: consultations.filter(c => c.status === 'Đang chờ xử lý').length,
    waitingSchedule: consultations.filter(c => c.status === 'Chờ lên lịch').length
  };

  return (
    <div className='health-consultation-container'>
      <div className='health-consultation-header'>
        <div>
          <Title level={2}>Tư vấn sức khỏe học sinh</Title>
        </div>
        {/* <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} className='health-consultation-create-btn'>Ghi nhận tư vấn</Button> */}
      </div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}><Card><Statistic title="Tổng số tư vấn" value={stats.total} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đã hoàn thành" value={stats.completed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Chờ tư vấn" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Chờ lên lịch" value={stats.waitingSchedule} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>
     
      <div className="health-consultation-filters">
        <Input.Search
          placeholder="Tìm kiếm học sinh, lý do tư vấn..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onSearch={value => setSearchTerm(value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select 
        style={{ width: 180 }} value={typeFilter} onChange={setTypeFilter} placeholder="Lớp học">
          <Option value="all">Tất cả lớp học</Option>
          <Option value="Lớp 5A">Lớp 5A</Option>
          <Option value="Lớp 4B">Lớp 4B</Option>
          <Option value="Lớp 3C">Lớp 3C</Option>
          <Option value="Lớp 2A">Lớp 2A</Option>
          <Option value="Lớp 1B">Lớp 1B</Option>
        </Select>
        <Select
          style={{ width: 180, marginLeft: 12 }}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Trạng thái"
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="Đã hoàn thành">Đã hoàn thành</Option>
          <Option value="Đang chờ xử lý">Đang chờ xử lý</Option>
          <Option value="Chờ lên lịch">Chờ lên lịch</Option>
        </Select>
      </div>
      {/* Consultations List */}
      <div className="health-consultation-list">
        {filteredConsultations.map((consultation) => (
          <div key={consultation.id} className="health-consultation-card">
            <div className="health-consultation-card-header">
              <div><Title level={4}>{consultation.studentName}</Title><Text type="secondary">Lớp: {consultation.className}</Text></div>
              <Badge status={consultation.status === 'Đã hoàn thành' ? 'success' : (consultation.status === 'Đang chờ xử lý' ? 'warning' : (consultation.status === 'Chờ lên lịch' ? 'processing' : 'default'))} text={consultation.status || ''} />
            </div>
            <div className="health-consultation-card-info">
              <div className="info-item">
                <Text type="secondary">Ngày tư vấn:</Text>
                <Text>{consultation.consultDate ? consultation.consultDate.split('T')[0] : ''}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Địa điểm:</Text>
                <Text>{consultation.location}</Text>
              </div>
            </div>
            <div className="health-consultation-card-info"><Space><Text type="secondary">Lý do tư vấn:</Text> <Text>{consultation.reason}</Text></Space></div>
            <div className="health-consultation-card-info"><Space><Text type="secondary">Y tá tạo:</Text> <Text>{consultation.createdByNurseName}</Text></Space></div>
            
            <div className="health-consultation-card-actions">
              <Button icon={<EyeOutlined />} onClick={() => { setSelectedConsultation(consultation); setDetailModalOpen(true); }}>Xem chi tiết</Button>
              <Button style={{marginLeft: 8}} onClick={() => { setEditingConsultation(consultation); setEditModalOpen(true); setTimeout(() => { editForm.setFieldsValue({
                studentName: consultation.studentName,
                status: consultation.status,
                reason: consultation.reason,
                scheduledDate: consultation.consultDate ? moment(consultation.consultDate) : null,
                update_at: consultation.update_at ? consultation.update_at.split('T')[0] : '',
                updatedByNurseName: consultation.updatedByNurseName,
                location: consultation.location || ''
              }); }, 0); }}>{!consultation.consultDate ? 'Lên lịch tư vấn' : 'Chỉnh sửa'}</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal 
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết tư vấn sức khỏe</span>}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
        {selectedConsultation && (
          <div>
            <Row gutter={16}>
              <Col span={12}><Text type="secondary">Học sinh:</Text><br /><Text strong>{selectedConsultation.studentName}</Text></Col>
              <Col span={12}><Text type="secondary">Lớp:</Text><br /><Text strong>{selectedConsultation.className}</Text></Col>
              <Col span={12}><Text type="secondary">Trạng thái:</Text><br /><Text strong>{selectedConsultation.status}</Text></Col>
              <Col span={12}><Text type="secondary">Ngày tư vấn:</Text><br /><Text strong>{selectedConsultation.consultDate ? selectedConsultation.consultDate.split('T')[0] : ''}</Text></Col>
              <Col span={12}><Text type="secondary">Ngày cập nhật:</Text><br /><Text strong>{selectedConsultation.update_at ? selectedConsultation.update_at.split('T')[0] : ''}</Text></Col>
              <Col span={12}><Text type="secondary">Y tá tạo:</Text><br /><Text strong>{selectedConsultation.createdByNurseName}</Text></Col>
              <Col span={12}><Text type="secondary">Y tá cập nhật:</Text><br /><Text strong>{selectedConsultation.updatedByNurseName}</Text></Col>
              <Col span={12}><Text type="secondary">Địa điểm:</Text><br /><Text strong>{selectedConsultation.location}</Text></Col>
              <Col span={24}><Text type="secondary">Lý do tư vấn:</Text><br /><Text strong>{selectedConsultation.reason}</Text></Col>
            </Row>
          </div>
        )}
        </div>
      </Modal>
      <Modal 
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chỉnh sửa tư vấn sức khỏe</span>}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingConsultation(null); editForm.resetFields(); }}
        onOk={async () => {
          try {
            const values = await editForm.validateFields();
            const updatedByNurseName = localStorage.getItem('fullname') || '';
            const updatedByNurseID = localStorage.getItem('nurseId') || '';
            await updateHealthConsultation(editingConsultation.id, {
              consultID: editingConsultation.id,
              studentID: editingConsultation.studentID,
              consultDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : editingConsultation.consultDate,
              studentName: values.studentName,
              checkID: editingConsultation.checkID,
              status: values.status,
              reason: values.reason,
              update_at: new Date().toISOString(),
              updatedByNurseName,
              updatedByNurseID,
              location: values.location
            });
            message.success('Cập nhật tư vấn thành công!');
            setEditModalOpen(false);
            setEditingConsultation(null);
            editForm.resetFields();
            // Reload danh sách
            const data = await getAllHealthConsultations();
            setConsultations(data.map(item => ({
              id: item.consultID,
              studentID: item.studentID,
              consultDate: item.consultDate,
              studentName: item.studentName,
              className: item.className,
              checkID: item.checkID,
              status: item.status,
              reason: item.reason,
              create_at: item.create_at,
              update_at: item.update_at,
              createdByNurseName: item.createdByNurseName,
              updatedByNurseName: item.updatedByNurseName,
              updatedByNurseID: item.updatedByNurseID,
              createdByNurseID: item.createdByNurseID,
              location: item.location || ''
            })));
          } catch (err) {
            message.error('Cập nhật tư vấn thất bại!');
          }
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form layout="vertical" form={editForm}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="studentName" label="Học sinh" ><Input disabled /></Form.Item></Col>
              <Col span={12}><Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}> 
                <Select>
                  <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                  <Option value="Đang chờ xử lý">Đang chờ xử lý</Option>
                  <Option value="Chờ lên lịch">Chờ lên lịch</Option>
                </Select>
              </Form.Item></Col>
              <Col span={12}><Form.Item name="scheduledDate" label="Ngày tư vấn" rules={[{ required: true, message: 'Vui lòng chọn ngày tư vấn' }]} >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabledDate={current => current && current < moment().startOf('day')} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="location" label="Địa điểm" rules={[
                { required: true, message: 'Vui lòng nhập địa điểm' },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === '') return Promise.resolve();
                    if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
                    if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                    return Promise.resolve();
                  }
                }
              ]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="update_at" label="Ngày cập nhật" style={{display : 'none'}}><Input disabled /></Form.Item></Col>
             
              <Col span={24}>
              <Form.Item
  name="reason"
  label="Lý do tư vấn"
  validateTrigger={['onChange', 'onBlur']}
  rules={[
    { required: true, message: 'Vui lòng nhập lý do tư vấn' },
    {
      validator: (_, value) => {
        if (value === undefined || value === '') return Promise.resolve();
        if (isOnlyWhitespace(value)) return Promise.reject('Không được để khoảng trắng đầu dòng!');
        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
        return Promise.resolve();
      }
    }
  ]}
>
  <Input.TextArea autoSize />
</Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HealthConsultation;
