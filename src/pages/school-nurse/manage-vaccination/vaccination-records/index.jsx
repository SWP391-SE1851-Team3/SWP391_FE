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
  Statistic
} from 'antd';
import './vaccination-records.css';
import {
  geVaccinationRecords,
  getVaccinationRecordDetail,
  createVaccinationRecord,
  getVaccineTypeByName,
  updateVaccinationRecord 
} from '../../../../api/vaccinationAPI';


import { fetchStudentsByClass } from '../../../../api/medicalEventsAPI';
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VaccinationRecords = () => {
  const [form] = Form.useForm();
  const [records, setRecords] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [vaccineOptions, setVaccineOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await geVaccinationRecords();
        console.log('DEBUG RAW DATA:', res.data);
        const mapped = (res.data || []).map(item => ({
          id: item.vaccinationRecordID,
          vaccinationRecordID: item.vaccinationRecordID,
          studentID: item.studentID,
          studentName: item.studentName,
          className: item.className,
          batchID: item.batchID,
          vaccineName: item.vaccineName,
          symptoms: item.symptoms,
          severity: item.severity,
          notes: item.notes,
          observation_notes: item.observation_notes,
          observation_time: item.observation_time,
          status: item.status,
          createNurseID: item.createNurseID,
          createNurseName: item.createNurseName,
          editNurseID: item.editNurseID,
          editNurseName: item.editNurseName,
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
    if (isCreateModalOpen) {
      getVaccineTypeByName('')
        .then(res => {
          if (Array.isArray(res.data)) {
            setVaccineOptions(res.data);
          } else {
            setVaccineOptions([]);
          }
        })
        .catch(() => setVaccineOptions([]));
      // Lấy tên y tá và mã y tá từ localStorage và set vào form cho cả create và edit
      const createNurseName = localStorage.getItem('fullname') || '';
      const createNurseID = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
      const editNurseName = createNurseName;
      const editnurseID = createNurseID;
      form.setFieldsValue({ createNurseName, createNurseID, editNurseName, editnurseID });
    }
  }, [isCreateModalOpen, form]);

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      (record.studentName && record.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.vaccineName && record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === 'all' || record.className === classFilter;
    const matchesVaccine = vaccineFilter === 'all' || record.vaccineName === vaccineFilter;
    return matchesSearch && matchesClass && matchesVaccine;
  });

  const handleCreateRecord = async () => {
    try {
      const values = await form.validateFields();
      await createVaccinationRecord(values);
      setIsCreateModalOpen(false);
      form.resetFields();
      message.success('Ghi nhận tiêm chủng thành công!');
      // Reload danh sách sau khi tạo mới
      const res = await geVaccinationRecords();
      const mapped = (res.data || []).map(item => ({
        id: item.vaccinationRecordID,
        vaccinationRecordID: item.vaccinationRecordID,
        studentID: item.studentID,
        studentName: item.studentName,
        className: item.className,
        batchID: item.batchID,
        vaccineName: item.vaccineName,
        symptoms: item.symptoms,
        severity: item.severity,
        notes: item.notes,
        observation_notes: item.observation_notes,
        observation_time: item.observation_time,
        status: item.status,
        createNurseID: item.createNurseID,
        createNurseName: item.createNurseName,
        editNurseID: item.editNurseID,
        editNurseName: item.editNurseName,
      }));
      setRecords(mapped);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc hoặc có lỗi khi ghi nhận tiêm chủng');
    }
  };

  const stats = {
    total: records.length,
    today: records.filter(r => r.observation_time === new Date().toISOString().split('T')[0]).length,
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

  const handleClassChange = async (value) => {
    form.setFieldsValue({ studentName: undefined });
    try {
      const res = await fetchStudentsByClass(value);
      if (Array.isArray(res)) {
        setStudentOptions(res);
      } else {
        setStudentOptions([]);
      }
    } catch {
      setStudentOptions([]);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    // Lấy tên y tá chỉnh sửa từ localStorage
    const editNurseName = localStorage.getItem('fullname') || '';
    const editNurseID = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
    editForm.setFieldsValue({
      studentId: record.studentId || record.studentID,
      vaccineBatchId: record.vaccineBatchId || record.batchID,
      vaccineBatchName: record.vaccineName || record.vaccineName,
      symptoms: record.symptoms,
      severity: record.severity,
      notes: record.notes,
      observation_notes: record.observation_notes,
      observation_time: record.observation_time,
      status: record.status,
      className: record.className,
      parentID: record.parentID,
      editNurseID: editNurseID,
      studentName: record.studentName,
      editNurseName: editNurseName,
    });
  };

  const handleUpdateRecord = async () => {
    try {
      const values = await editForm.validateFields();
      const recordId = editingRecord.vaccinationRecordID || editingRecord.id;
      // Chỉ lấy đúng các trường cần thiết cho API
      const updateData = {
        studentId: values.studentId,
        vaccineBatchId: values.vaccineBatchId,
        vaccineBatchName: values.vaccineBatchName,
        symptoms: values.symptoms,
        severity: values.severity,
        notes: values.notes,
        observation_notes: values.observation_notes,
        observation_time: values.observation_time,
        status: values.status,
        className: values.className,
        parentID: values.parentID,
        editNurseID: values.editNurseID,
        studentName: values.studentName,
        editNurseName: values.editNurseName,
      };
      await updateVaccinationRecord(recordId, updateData);
      setIsEditModalOpen(false);
      setEditingRecord(null);
      editForm.resetFields();
      message.success('Cập nhật hồ sơ tiêm chủng thành công!');
      // Reload danh sách sau khi cập nhật
      const res = await geVaccinationRecords();
      const mapped = (res.data || []).map(item => ({
        id: item.vaccinationRecordID,
        vaccinationRecordID: item.vaccinationRecordID,
        studentID: item.studentID,
        studentName: item.studentName,
        className: item.className,
        batchID: item.batchID,
        vaccineName: item.vaccineName,
        symptoms: item.symptoms,
        severity: item.severity,
        notes: item.notes,
        observation_notes: item.observation_notes,
        observation_time: item.observation_time,
        status: item.status,
        createNurseID: item.createNurseID,
        createNurseName: item.createNurseName,
        
        editNurseID: item.editNurseID,
        editNurseName: item.editNurseName,
      }));
      setRecords(mapped);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin hoặc có lỗi khi cập nhật hồ sơ tiêm chủng');
    }
  };

  // Tạo danh sách vaccine động từ records
  const vaccineOptionsList = Array.from(new Set(records.map(r => r.vaccineName).filter(Boolean)));

  return (
    <div className='vaccination-records-container ' >
      <div className='vaccination-records-header'>
        <div>
          <Title level={2}>Ghi nhận Kết quả tiêm</Title>

        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          className='vaccination-records-create-btn'
        >
          Ghi nhận tiêm chủng
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
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
      <Card style={{ marginBottom: '24px' }}>
      
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
              <Option value="Lớp 5A">Lớp 5A</Option>
              <Option value="Lớp 4B">Lớp 4B</Option>
              <Option value="Lớp 3C">Lớp 3C</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              value={vaccineFilter}
              onChange={setVaccineFilter}
              placeholder="Loại vaccine"
            >
              <Option value="all">Tất cả vaccine</Option>
              {vaccineOptionsList.map((vaccine) => (
                <Option key={vaccine} value={vaccine}>{vaccine}</Option>
              ))}
            </Select>
          </Col>
          
        </Row>
      </Card>

      {/* Records List */}
      <div className="vaccination-records-list">
        {filteredRecords.map((record) => (
          <div key={record.id} className="records-card">
            <div className="records-card-header">
              <div>
                <Title level={4}>{record.studentName}</Title>
                <Text type="secondary">
                  Lớp: {record.className}    | Tên vaccine: {record.vaccineName}
                </Text>
              </div>
              <Badge status={record.status === 'completed' ? 'success' : (record.status === 'pending' ? 'warning' : 'default')} text={record.status || ''} />
            </div>
            <div className="records-card-info">
              <Space><Text type="secondary">Ngày giờ theo dõi:</Text> <Text>{record.observation_time ? record.observation_time.replace('T', ' ').substring(0, 16) : ''}</Text></Space>
            </div>
            <div className="records-card-info">
              <Space><Text type="secondary">Tên vaccine:</Text> <Text>{record.vaccineName}</Text></Space>
              <Space><Text type="secondary">Ghi chú:</Text> <Text>{record.notes}</Text></Space>
            </div>
            <div className="records-card-actions">
              <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>Xem chi tiết</Button>
              <Button type="primary" onClick={() => handleEditRecord(record)} style={{ marginLeft: 8 }}>Chỉnh sửa</Button>
            </div>
          </div>
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
          <Form.Item name="studentId" label="Mã học sinh" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="className" label="Lớp" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
            <Select placeholder="Chọn lớp" onChange={handleClassChange} allowClear>
              <Option value="Lớp 5A">Lớp 5A</Option>
              <Option value="Lớp 4B">Lớp 4B</Option>
              <Option value="Lớp 3C">Lớp 3C</Option>
            </Select>
          </Form.Item>
          <Form.Item name="studentName" label="Tên học sinh" rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}>
            <Select placeholder="Chọn học sinh" allowClear onChange={value => {
              const selected = studentOptions.find(s => s.fullName === value);
              form.setFieldsValue({
                studentId: selected ? selected.studentID : '',
                parentID: selected ? selected.parentID : ''
              });
            }}>
              {studentOptions.map((student) => (
                <Option key={student.studentID} value={student.fullName}>
                  {student.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parentID" label="Mã phụ huynh" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="vaccineBatchId" label="Mã lô vaccine" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="vaccineBatchName" label="Tên lô vaccine">
            <Select
              
              onChange={async value => {
                try {
                  const res = await getVaccineTypeByName(value);
                  if (Array.isArray(res.data) && res.data.length > 0) {
                    // Giả sử lấy id đầu tiên nếu có nhiều
                    form.setFieldsValue({ vaccineBatchId: res.data[0].id });
                  } else {
                    form.setFieldsValue({ vaccineBatchId: '' });
                  }
                } catch {
                  form.setFieldsValue({ vaccineBatchId: '' });
                }
              }}
            >
              {vaccineOptions.map((vaccine) => (
                <Option key={vaccine.id} value={vaccine.name}>{vaccine.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="symptoms" label="Triệu chứng">
            <Input />
          </Form.Item>
          <Form.Item name="severity" label="Mức độ">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input />
          </Form.Item>
          <Form.Item name="observation_notes" label="Ghi chú theo dõi">
            <Input />
          </Form.Item>
          <Form.Item name="observation_time" label="Thời gian theo dõi" rules={[{ required: true, message: 'Vui lòng nhập thời gian theo dõi' }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng nhập trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="completed">Hoàn thành</Option>
              <Option value="pending">Chờ kiểm tra</Option>
            </Select>
          </Form.Item>
          <Form.Item name="createNurseName" label="Tên y tá tạo" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="createNurseID" label="Mã y tá tạo" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="editNurseName" label="Tên y tá chỉnh sửa" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="editnurseID" label="Mã y tá chỉnh sửa" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#096dd9' }}>Chi tiết hồ sơ tiêm chủng</span>}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedRecord && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><UserOutlined /> Học sinh:</Text><br />
                <Text strong style={{ fontSize: 16 }}>{selectedRecord.studentName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="class">🏫</span> Lớp:</Text><br />
                <Text strong>{selectedRecord.className}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><MedicineBoxOutlined /> Tên vaccine:</Text><br />
                <Text strong>{selectedRecord.vaccineName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><FileTextOutlined /> Trạng thái:</Text><br />
                <Text strong>{selectedRecord.status}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><UserOutlined /> Y tá tạo:</Text><br />
                <Text>{selectedRecord.createNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><UserOutlined /> Y tá chỉnh sửa:</Text><br />
                <Text>{selectedRecord.editNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><CalendarOutlined /> Ngày giờ theo dõi:</Text><br />
                <Text>{selectedRecord.observation_time ? selectedRecord.observation_time.replace('T', ' ').substring(0, 16) : ''}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="symptom">🤒</span> Triệu chứng:</Text><br />
                <Text>{selectedRecord.symptoms}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="severity">⚠️</span> Mức độ:</Text><br />
                <Text>{selectedRecord.severity}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="note">📝</span> Ghi chú:</Text><br />
                <Text>{selectedRecord.notes}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="observation">👀</span> Ghi chú theo dõi:</Text><br />
                <Text>{selectedRecord.observation_notes}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title="Cập nhật hồ sơ tiêm chủng"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        onOk={handleUpdateRecord}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item name="studentId" label="Mã học sinh" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="studentName" label="Tên học sinh">
            <Input disabled/>
          </Form.Item>
          <Form.Item name="className" label="Lớp">
            <Input disabled/>
          </Form.Item>
          <Form.Item name="vaccineBatchId" label="Mã lô vaccine" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="vaccineBatchName" label="Tên lô vaccine">
            <Input />
          </Form.Item>
          <Form.Item name="symptoms" label="Triệu chứng">
            <Input />
          </Form.Item>
          <Form.Item name="severity" label="Mức độ">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input />
          </Form.Item>
          <Form.Item name="observation_notes" label="Ghi chú theo dõi">
            <Input />
          </Form.Item>
          <Form.Item name="observation_time" label="Thời gian theo dõi">
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="completed">Hoàn thành</Option>
              <Option value="pending">Chờ kiểm tra</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parentID" label="Mã phụ huynh" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="editNurseID" label="Mã y tá chỉnh sửa" style={{ display: 'none' }}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="editNurseName" label="Tên y tá chỉnh sửa">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationRecords;

