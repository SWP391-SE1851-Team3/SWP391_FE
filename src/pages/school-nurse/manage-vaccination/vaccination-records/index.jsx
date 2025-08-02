import React, { useState, useEffect } from 'react';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  EyeOutlined
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
  Statistic,
  DatePicker
} from 'antd';
import './vaccination-records.css';
import {
  geVaccinationRecords,
  getVaccinationRecordDetail,
  getVaccineTypeByName,
  updateVaccinationRecord 
} from '../../../../api/vaccinationAPI';
import { getCurrentDateString } from '../../../../utils/formatDate';
import moment from 'moment';
import {hasNoSpecialCharacters, isOnlyWhitespace, isFirstCharUppercase } from '../../../../validations';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VaccinationRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');

  

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await geVaccinationRecords();
        console.log('DEBUG RAW DATA:', res.data);
        const mapped = (res.data || []).map(item => ({
          notes: item.notes,
          observation_time: item.observation_time,
          symptoms: item.symptoms,
          severity: item.severity,
          observation_notes: item.observation_notes,
          status: item.status,
          className: item.className,
          consentId: item.consentId,
          parentID: item.parentID,
          batchID: item.batchID,
          vaccineName: item.vaccineName,
          vaccinationRecordID: item.vaccinationRecordID,
          studentID: item.studentID,
          createNurseID: item.createNurseID,
          editNurseID: item.editNurseID,
          createNurseName: item.createNurseName,
          editNurseName: item.editNurseName,
          studentName: item.studentName,
          dot: item.dot || ''
        }));
        setRecords(mapped);
      } catch (err) {
        setRecords([]);
        message.error('Không thể tải danh sách hồ sơ tiêm chủng');
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    if (isEditModalOpen) {
      getVaccineTypeByName('')
        .then(res => {
          if (Array.isArray(res.data)) {
            // setVaccineOptions(res.data); // This line was removed as per the edit hint
          } else {
            // setVaccineOptions([]); // This line was removed as per the edit hint
          }
        })
        .catch(() => {
          // setVaccineOptions([]); // This line was removed as per the edit hint
        });
      // Lấy tên y tá và mã y tá từ localStorage và set vào form cho cả create và edit
      const createNurseName = localStorage.getItem('fullname') || '';
      const createNurseID = localStorage.getItem('userId') || '';
      const editNurseName = createNurseName;
      const editnurseID = createNurseID;
      editForm.setFieldsValue({ createNurseName, createNurseID, editNurseName, editnurseID });
    }
  }, [isEditModalOpen, editForm]);

  // Map status for display and filter
  const mapStatus = (status) => {
    if (!status) return 'Chờ ghi nhận';
    if (status === 'Hoàn thành') return 'Đã hoàn thành';
    if (status === 'Hoàn thành theo dõi') return 'Hoàn thành theo dõi';
    if (status === 'Đang theo dõi') return 'Cần theo dõi';
    return status;
  };

  const filteredRecords = records.filter(record => {
    const displayStatus = mapStatus(record.status);
    const matchesSearch =
      (record.studentName && record.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.vaccineName && record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.dot && record.dot.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === 'all' || record.className === classFilter;
    const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = {
    total: records.length,
    today: records.filter(r => r.observation_time === getCurrentDateString()).length,
    thisWeek: records.length,
    thisMonth: records.length
  };

  const handleViewDetail = async (record) => {
    try {
      const recordId = record.vaccinationRecordID;
      const res = await getVaccinationRecordDetail(recordId);
      setSelectedRecord(res.data);
      setDetailModalOpen(true);
    } catch (err) {
      message.error('Không thể lấy chi tiết hồ sơ tiêm chủng');
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    // Lấy tên y tá chỉnh sửa từ localStorage
    const editNurseName = localStorage.getItem('fullname') || '';
    const editNurseID = localStorage.getItem('userId') || '';
    editForm.setFieldsValue({
      studentId: record.studentId || record.studentID,
      vaccineBatchId: record.vaccineBatchId || record.batchID,
      vaccineBatchName: record.vaccineName,
      symptoms: record.symptoms,
      severity: record.severity,
      notes: record.notes,
      observation_notes: record.observation_notes,
      observation_time: record.observation_time ? moment(record.observation_time) : null,
      status: record.status,
      className: record.className,
      parentID: record.parentID, 
      editNurseID: editNurseID,
      studentName: record.studentName,
      editNurseName: editNurseName,
      consentId: record.consentId
    });
    setEditingStatus(record.status || '');
  };

  const handleUpdateRecord = async () => {
    try {
      const values = await editForm.validateFields();
      const recordId = editingRecord.vaccinationRecordID || editingRecord.id;
      // Đồng bộ logic với vaccination-batch
      let observation_time = null;
      if (values.observation_time && typeof values.observation_time.toISOString === 'function') {
        observation_time = values.observation_time.toISOString();
      }
      const updateData = {
        studentId: values.studentId,
        vaccineBatchId: values.vaccineBatchId,
        vaccineBatchName: values.vaccineBatchName,
        symptoms: values.symptoms,
        severity: values.severity,
        notes: values.notes,
        observation_notes: values.observation_notes,
        observation_time,
        status: values.status,
        className: values.className,
        consentId: values.consentId !== undefined ? values.consentId : (editingRecord?.consentId || undefined),
        parentID: values.parentID,
        editNurseID: values.editNurseID,
        editNurseName: values.editNurseName,
        studentName: values.studentName
      };
      await updateVaccinationRecord(recordId, updateData);
      setIsEditModalOpen(false);
      setEditingRecord(null);
      editForm.resetFields();
      message.success('Cập nhật hồ sơ tiêm chủng thành công!');
      // Reload danh sách sau khi cập nhật
      const res = await geVaccinationRecords();
      const mapped = (res.data || []).map(item => ({
        notes: item.notes,
        observation_time: item.observation_time,
        symptoms: item.symptoms,
        severity: item.severity,
        observation_notes: item.observation_notes,
        status: item.status,
        className: item.className,
        consentId: item.consentId,
        parentID: item.parentID,
        batchID: item.batchID,
        vaccineName: item.vaccineName,
        vaccinationRecordID: item.vaccinationRecordID,
        studentID: item.studentID,
        createNurseID: item.createNurseID,
        editNurseID: item.editNurseID,
        createNurseName: item.createNurseName,
        editNurseName: item.editNurseName,
        studentName: item.studentName,
        dot: item.dot || ''
      }));
      setRecords(mapped);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin hoặc có lỗi khi cập nhật hồ sơ tiêm chủng');
    }
  };

  return (
    <div className='vaccination-records-container ' >
      <div className='vaccination-records-header'>
        <div>
          <Title level={2}>Ghi nhận Kết quả tiêm</Title>

        </div>
      </div>

      {/* Statistics */}
      <Row key="stats-row" gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card >
            <Statistic
              title="Tổng số mũi tiêm"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card >
            <Statistic
              title="Tiêm hôm nay"
              value={stats.today}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card >
            <Statistic
              title="Tuần này"
              value={stats.thisWeek}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card >
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="vaccination-records-filters">
        <Input
          placeholder="Tìm kiếm học sinh, vaccine..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{width:250}}
        />
        <Select
          style={{ width: 150}}
          value={classFilter}
          onChange={setClassFilter}
          placeholder="Lớp học"
        >
          <Option value="all">Tất cả lớp</Option>
          <Option value="Lớp 5A">Lớp 5A</Option>
          <Option value="Lớp 4B">Lớp 4B</Option>
          <Option value="Lớp 3C">Lớp 3C</Option>
          <Option value="Lớp 2A">Lớp 2A</Option>
          <Option value="Lớp 1B">Lớp 1B</Option>
        </Select>
        <Select
          style={{ width: 180 }}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Trạng thái"
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="Chờ ghi nhận">Chờ ghi nhận</Option>
          <Option value="Đã hoàn thành">Đã hoàn thành</Option>
          <Option value="Hoàn thành theo dõi">Hoàn thành theo dõi</Option>
          <Option value="Cần theo dõi">Cần theo dõi</Option>
        </Select>
      </div>
      
      {/* Records List */}
      <div className="vaccination-records-list">
        {filteredRecords.map((record) => {
          const displayStatus = mapStatus(record.status);
          let badgeStatus = 'default';
          if (displayStatus === 'Đã hoàn thành') badgeStatus = 'success';
          else if (displayStatus === 'Hoàn thành theo dõi') badgeStatus = 'success';
          else if (displayStatus === 'Cần theo dõi') badgeStatus = 'error';
          else if (displayStatus === 'Chờ ghi nhận') badgeStatus = 'warning';
          return (
            <div key={record.vaccinationRecordID || record.id || Math.random()} className="records-card">
              <div className="records-card-header">
                <div>
                  <Title level={4}>{record.studentName} -  {record.dot}</Title>
                  <Text type="secondary">
                   {record.className} | Tên vaccine: {record.vaccineName}
                  </Text>
                </div>
                <Badge status={badgeStatus} text={displayStatus} />
              </div>
          
              <div className="records-card-info">
                <Space><Text type="secondary">Y tá phụ trách:</Text> <Text>{record.createNurseName}</Text></Space>
                <Space><Text type="secondary">Ghi chú:</Text> <Text>{record.notes}</Text></Space>
              </div>
              <div className="records-card-actions">
                <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>Xem chi tiết</Button>
                {displayStatus === 'Chờ ghi nhận' ? (
                  <Button type="primary" onClick={() => handleEditRecord(record)} style={{ marginLeft: 8 }}>Ghi nhận hồ sơ</Button>
                ) : (
                  <Button type="primary" onClick={() => handleEditRecord(record)} style={{ marginLeft: 8 }}>Chỉnh sửa</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết hồ sơ tiêm chủng</span>}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedRecord && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col key="student" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Học sinh:</Text><br />
                <Text strong style={{ fontSize: 16 }}>{selectedRecord.studentName}</Text>
              </Col>
              <Col key="class" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="class"></span> Lớp:</Text><br />
                <Text strong>{selectedRecord.className}</Text>
              </Col>
              <Col key="vaccine" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong> Tên vaccine:</Text><br />
                <Text strong>{selectedRecord.vaccineName}</Text>
              </Col>
              <Col key="dot" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong> Đợt tiêm:</Text><br />
                <Text strong>{selectedRecord.dot || 'N/A'}</Text>
              </Col>
              <Col key="status" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong> Trạng thái:</Text><br />
                <Text strong>{selectedRecord.status}</Text>
              </Col>
              <Col key="createNurse" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong> Y tá tạo:</Text><br />
                <Text>{selectedRecord.createNurseName}</Text>
              </Col>
              <Col key="editNurse" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong> Y tá chỉnh sửa:</Text><br />
                <Text>{selectedRecord.editNurseName}</Text>
              </Col>        
              <Col key="symptoms" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="symptom"></span> Triệu chứng:</Text><br />
                <Text>{selectedRecord.symptoms}</Text>
              </Col>
              <Col key="severity" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="severity"></span> Mức độ:</Text><br />
                <Text>{selectedRecord.severity}</Text>
              </Col>
              <Col key="notes" span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="note"></span> Ghi chú:</Text><br />
                <Text>{selectedRecord.notes}</Text>
              </Col>
              <Col key="observation_time" span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Thời gian theo dõi:</Text><br />
                <Text>{selectedRecord.observation_time ? moment(selectedRecord.observation_time).format('YYYY-MM-DD HH:mm') : ''}</Text>
              </Col>
              <Col key="observation_notes" span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ghi chú theo dõi:</Text><br />
                <Text>{selectedRecord.observation_notes}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
    
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Cập nhật hồ sơ tiêm chủng</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        onOk={handleUpdateRecord}
        okText="Cập nhật"
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        width={1000}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form
            form={editForm}
            layout="vertical"
          >
            <Row key="row1" gutter={16}>
              <Col span={12}>
                <Form.Item name="studentName" label="Tên học sinh">
                  <Input disabled/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="className" label="Lớp">
                  <Input disabled/>
                </Form.Item>
              </Col>
            </Row>
            <Row key="row2" gutter={16}>
              <Col span={12}>
                <Form.Item name="vaccineBatchId" label="Mã lô vaccine" style={{ display: 'none' }}>
                  <Input />
                </Form.Item>
                <Form.Item name="vaccineBatchName" label="Tên vaccine" >
                  <Input disabled/> 
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="symptoms" label="Triệu chứng" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập triệu chứng' },
                    
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
              </Col>
            </Row>
            <Row key="row3" gutter={16}>
              <Col span={12}>
                <Form.Item name="severity" label="Mức độ" rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}>
                 <Select>
                    <Option value="Ổn định">Ổn định</Option>
                    <Option value="Trung bình">Trung bình</Option>
                    <Option value="Nặng">Nặng</Option>
                    </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select
                    onChange={value => {
                      setEditingStatus(value);
                      editForm.setFieldsValue({ status: value });
                    }}
                  >
                    <Option value="Hoàn thành">Hoàn thành</Option>
                    <Option value="Hoàn thành theo dõi">Hoàn thành theo dõi</Option>
                    <Option value="Cần theo dõi">Cần theo dõi</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {(editingStatus === 'Cần theo dõi' || editingStatus === 'Hoàn thành theo dõi') && (
              <Row key="observation-row" gutter={16}>
                <Col span={12}>
                  <Form.Item name="observation_time" label="Thời gian theo dõi" rules={[
                    { required: true, message: 'Vui lòng nhập thời gian theo dõi' }
                   
                  ]}> 
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Chọn thời gian theo dõi"
                      disabledDate={current => {
                        if (!current) return false;
                        // Chỉ cho phép chọn ngày hiện tại
                        const today = new Date();
                        const currentDate = new Date(current);
                        return currentDate.getDate() !== today.getDate() ||
                               currentDate.getMonth() !== today.getMonth() ||
                               currentDate.getFullYear() !== today.getFullYear();
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="observation_notes" label="Ghi chú theo dõi" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập ghi chú theo dõi' },
                    
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
                </Col>
              </Row>
            )}
            <Row key="notes-row" gutter={16}>
              <Col span={12}>
                <Form.Item name="notes" label="Ghi chú"  
                rules={[
                    { required: true, message: 'Vui lòng nhập ghi chú' },
                    
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
              </Col>
            </Row>
            <Form.Item name="studentId" label="Mã học sinh" style={{ display: 'none' }}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="parentID" label="Mã phụ huynh" style={{ display: 'none' }}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="editNurseID" label="Mã y tá chỉnh sửa" style={{ display: 'none' }}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="editNurseName" label="Tên y tá chỉnh sửa" style={{ display: 'none' }}>
              <Input disabled />
            </Form.Item>
            
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default VaccinationRecords;

