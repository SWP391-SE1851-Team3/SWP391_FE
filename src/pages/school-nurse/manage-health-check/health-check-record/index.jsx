import React, { useState, useEffect } from 'react';
import { PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Form, Input, Select, Badge, Space, Typography, message, Row, Col, Statistic } from 'antd';
import './health-check-record.css';
const { Title, Text } = Typography;
const { Option } = Select;
import {getAllHealthCheckResults, updateHealthCheckResult} from '../../../../api/healthCheckAPI';
import {fetchStudentsByClass} from '../../../../api/medicalEventsAPI';
const HealthCheckRecord = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm] = Form.useForm();

  const checkTypes = ['Khám tổng quát', 'Khám mắt', 'Khám răng'];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getAllHealthCheckResults();
        // Map dữ liệu trả về sang format UI - cập nhật theo cấu trúc mới
        const mapped = data.map(item => ({
          id: item.checkID,
          checkID: item.checkID,
          studentID: item.studentID,
          studentName: item.fullName || '',
          fullName: item.fullName || '',
          className: item.className || '',
          checkType: 'Khám tổng quát', // Mặc định vì không có trong response mới
          checkDate: item.create_at ? item.create_at.split('T')[0] : '',
          nurseName: item.createdByNurseName || '',
          status: item.status || '', // Lấy status từ API
          notes: '', // Không có trong response mới
          height: item.height,
          weight: item.weight,
          bmi: item.bmi !== undefined && item.bmi !== null ? +(+item.bmi).toFixed(2) : undefined,
          visionLeft: item.visionLeft,
          visionRight: item.visionRight,
          hearing: item.hearing,
          dentalCheck: item.dentalCheck,
          temperature: item.temperature,
          overallResult: item.overallResult,
          parentName: '', // Không có trong response mới
          parentID: '', // Không có trong response mới
          update_at: item.update_at,
          createdByNurseName: item.createdByNurseName || '',
          updatedByNurseName: item.updatedByNurseName || '',
          createdByNurseID: item.createdByNurseID,
          updatedByNurseID: item.updatedByNurseID,
          formID: item.formID
        }));
        setRecords(mapped);
      } catch (err) {
        message.error('Lỗi khi tải danh sách hồ sơ khám sức khỏe');
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.checkType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || record.className === classFilter;
    const matchesType = typeFilter === 'all' || record.checkType === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesClass && matchesType && matchesStatus;
  });

  const stats = {
    total: records.length,
    today: records.filter(r => r.checkDate === new Date().toISOString().split('T')[0]).length,
    thisWeek: records.filter(r => {
      const recordDate = new Date(r.checkDate);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo && recordDate <= today;
    }).length,
    thisMonth: records.filter(r => {
      const recordDate = new Date(r.checkDate);
      const today = new Date();
      return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
    }).length
  };

  const handleOpenUpdateModal = (record) => {
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
    setTimeout(() => {
      updateForm.setFieldsValue({
        ...record,
        height: !record.height || record.height === 0 ? undefined : record.height,
        weight: !record.weight || record.weight === 0 ? undefined : record.weight,
        bmi: !record.bmi || record.bmi === 0 ? undefined : record.bmi,
        update_at: record.update_at ? record.update_at.split('T')[0] : '',
      });
    }, 0);
  };

  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const nurseId = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
      await updateHealthCheckResult(selectedRecord.checkID, nurseId, values);
      message.success('Cập nhật hồ sơ thành công!');
      setIsUpdateModalOpen(false);
      setSelectedRecord(null);
      // Reload danh sách
      const data = await getAllHealthCheckResults();
      const mapped = data.map(item => ({
        id: item.checkID,
        checkID: item.checkID,
        studentID: item.studentID,
        studentName: item.fullName || '',
        fullName: item.fullName || '',
        className: item.className || '',
        checkType: 'Khám tổng quát',
        checkDate: item.create_at ? item.create_at.split('T')[0] : '',
        nurseName: item.createdByNurseName || '',
        status: item.status || '',
        notes: '',
        height: item.height,
        weight: item.weight,
        bmi: item.bmi !== undefined && item.bmi !== null ? +(+item.bmi).toFixed(2) : undefined,
        visionLeft: item.visionLeft,
        visionRight: item.visionRight,
        hearing: item.hearing,
        dentalCheck: item.dentalCheck,
        temperature: item.temperature,
        overallResult: item.overallResult,
        parentName: '',
        parentID: '',
        update_at: item.update_at,
        createdByNurseName: item.createdByNurseName || '',
        updatedByNurseName: item.updatedByNurseName || '',
        createdByNurseID: item.createdByNurseID,
        updatedByNurseID: item.updatedByNurseID,
        formID: item.formID
      }));
      setRecords(mapped);
    } catch (err) {
      message.error('Cập nhật hồ sơ thất bại!');
    }
  };

  // Tự động tính BMI khi nhập chiều cao/cân nặng
  const handleAutoBMI = (changedValues, allValues) => {
    if ('height' in changedValues || 'weight' in changedValues) {
      const height = parseFloat(allValues.height);
      const weight = parseFloat(allValues.weight);
      if (height > 0 && weight > 0) {
        // Tính BMI với chiều cao nhập vào là cm
        const bmi = +((weight / (height * height)) * 10000).toFixed(2);
        updateForm.setFieldsValue({ bmi });
      } else {
        updateForm.setFieldsValue({ bmi: undefined });
      }
    }
  };

  // Thêm hàm kiểm tra giá trị rỗng hoặc 0
  const isEmpty = v => v === null || v === undefined || v === '' || v === 0;

  return (
    <div className='health-check-records-container'>
      <div className='health-check-records-header'>
        <div>
          <Title level={2}>Ghi nhận Kết quả khám sức khỏe</Title>
        </div>
      </div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}><Card><Statistic title="Tổng số hồ sơ" value={stats.total} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Hôm nay" value={stats.today} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Tuần này" value={stats.thisWeek} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      {/* Filters */}
    
      <div className="health-check-records-filters">
        <Input.Search
          placeholder="Tìm kiếm học sinh, loại khám..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onSearch={value => setSearchTerm(value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select 
        style={{ width: 180 }} value={classFilter} onChange={setClassFilter} placeholder="Lớp học">
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
          <Option value="Chờ ghi nhận">Chờ ghi nhận</Option>
          <Option value="Đã hoàn thành">Đã hoàn thành</Option>
          <Option value="Cần tư vấn y tế">Cần tư vấn y tế</Option>
        </Select>
      </div>
      {/* Records List */}
      <div className="health-check-records-list">
        {filteredRecords.map((record) => (
          <div key={record.id} className="health-check-record-card">
            <div className="health-check-record-card-header">
              <div><Title level={4}>{record.studentName}</Title><Text type="secondary">Lớp: {record.className} | Loại khám: {record.checkType}</Text></div>
              <Badge 
                status={record.status === 'Đã hoàn thành' ? 'success' : record.status === 'Cần tư vấn y tế' ? 'error' : record.status === 'Chờ ghi nhận' ? 'warning' : 'default'}
                text={
                  record.status === 'Đã hoàn thành'
                    ? 'Đã hoàn thành'
                    : record.status === 'Cần tư vấn y tế'
                    ? 'Cần tư vấn y tế'
                    : record.status === 'Chờ ghi nhận'
                    ? 'Chờ ghi nhận'
                    : ''}
              />
            </div>
            <div className="health-check-record-card-info">
              <Space><Text type="secondary">Ngày khám:</Text> <Text>{record.checkDate}</Text></Space>
              <Space><Text type="secondary">Y tá tạo hồ sơ:</Text> <Text>{record.nurseName}</Text></Space>
            </div>
            <div className="health-check-record-card-info">
              <Space><Text type="secondary">Ngày cập nhật:</Text> <Text>{record.update_at ? record.update_at.split('T')[0] : ''}</Text></Space>
              <Space><Text type="secondary">Y tá cập nhật:</Text> <Text>{record.updatedByNurseName} </Text></Space>
            </div>
            <div className="health-check-record-card-actions">
              <Button icon={<EyeOutlined />} onClick={() => { setSelectedRecord(record); setDetailModalOpen(true); }}>Xem chi tiết</Button>
              <Button type="primary" onClick={() => handleOpenUpdateModal(record)}>Ghi nhận kết quả</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết kết quả khám sức khỏe</span>}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
        {selectedRecord && (
          <div>
            <Row gutter={[24, 16]}>
              {/* Thông tin học sinh */}
              <Col span={12}><Text strong>Tên học sinh:</Text><br /><Text>{selectedRecord.studentName}</Text></Col>
              <Col span={12}><Text strong>Lớp:</Text><br /><Text>{selectedRecord.className}</Text></Col>
              <Col span={12}>
                <Text strong>Loại khám:</Text>{'  '}
                <Text>{selectedRecord.checkType}</Text>
           
                </Col>
            </Row>
            <div style={{margin: '18px 0 10px 0'}}><Text strong style={{fontSize:16, color:'#52c41a'}}>- Chỉ số đo lường:</Text></div>
            <Row gutter={[24, 16]}>
              <Col span={8}><Text strong>Chiều cao (cm):</Text><br /><Text>{selectedRecord.height}</Text></Col>
              <Col span={8}><Text strong>Cân nặng (kg):</Text><br /><Text>{selectedRecord.weight}</Text></Col>
              <Col span={8}><Text strong>BMI:</Text><br /><Text>{selectedRecord.bmi}</Text></Col>
              <Col span={8}><Text strong>Nhiệt độ (°C):</Text><br /><Text>{selectedRecord.temperature}</Text></Col>
              <Col span={8}><Text strong>Thị lực trái:</Text><br /><Text>{selectedRecord.visionLeft}</Text></Col>
              <Col span={8}><Text strong>Thị lực phải:</Text><br /><Text>{selectedRecord.visionRight}</Text></Col>
              <Col span={8}><Text strong>Thính lực:</Text><br /><Text>{selectedRecord.hearing}</Text></Col>
              <Col span={8}><Text strong>Răng miệng:</Text><br /><Text>{selectedRecord.dentalCheck}</Text></Col>
            </Row>
            <div style={{margin: '18px 0 10px 0'}}><Text strong style={{fontSize:16, color:'#faad14'}}>- Kết luận & Thông tin khác:</Text></div>
            <Row gutter={[24, 16]}>
              <Col span={12}><Text strong>Kết luận chung:</Text><br /><Text>{selectedRecord.overallResult}</Text></Col>
              <Col span={12}><Text strong>Trạng thái:</Text><br /><Text>{selectedRecord.status}</Text></Col>
              <Col span={12}><Text strong>Ngày khám:</Text><br /><Text>{selectedRecord.checkDate}</Text></Col>
              <Col span={12}><Text strong>Ngày cập nhật:</Text><br /><Text>{selectedRecord.update_at ? selectedRecord.update_at.split('T')[0] : ''}</Text></Col>
              <Col span={12}><Text strong>Y tá tạo:</Text><br /><Text>{selectedRecord.nurseName}</Text></Col>
              <Col span={12}><Text strong>Y tá cập nhật:</Text><br /><Text>{selectedRecord.updatedByNurseName}</Text></Col>
            </Row>
          </div>
        )}
        </div>
      </Modal>
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Ghi nhận kết quả khám sức khỏe</span>}
        open={isUpdateModalOpen}
        onCancel={() => {setIsUpdateModalOpen(false); setSelectedRecord(null); updateForm.resetFields();}}
        onOk={handleUpdate}
        okText="Ghi nhận"
        cancelText="Hủy"
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        width={600}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form layout="vertical" form={updateForm} onValuesChange={handleAutoBMI}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}><Input type="number" step="0.01" /></Form.Item></Col>
              <Col span={8}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}><Input type="number" step="0.01" /></Form.Item></Col>
              <Col span={8}><Form.Item name="bmi" label="BMI" rules={[{ required: true, message: 'Vui lòng nhập BMI' }]}><Input type="number" step="0.01" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="visionLeft" label="Thị lực trái" rules={[{ required: true, message: 'Vui lòng nhập thị lực trái' }]}><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="visionRight" label="Thị lực phải" rules={[{ required: true, message: 'Vui lòng nhập thị lực phải' }]}><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="hearing" label="Thính lực" rules={[{ required: true, message: 'Vui lòng nhập thính lực' }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="dentalCheck" label="Răng miệng" rules={[{ required: true, message: 'Vui lòng nhập răng miệng' }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="temperature" label="Nhiệt độ (°C)" rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}><Form.Item name="overallResult" label="Kết luận chung" rules={[{ required: true, message: 'Vui lòng nhập kết luận chung' }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}> 
                  <Select>
                    
                    <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                    <Option value="Cần tư vấn y tế">Cần tư vấn y tế</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="update_at" label="Ngày cập nhật" style={{display: 'none'}}>
                  <Input
                    disabled
                    value={updateForm.getFieldValue('update_at') ? (updateForm.getFieldValue('update_at').split('T')[0]) : ''}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="updatedByNurseName" label="Y tá cập nhật" style={{display: 'none'}}><Input disabled /></Form.Item></Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HealthCheckRecord;
