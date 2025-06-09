import React, { useState } from 'react';
import { Form, Select, Input, Button, Typography, Row, Col, Card, Tag } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import './medicineForm.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const students = [
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
  { id: 3, name: 'Lê Văn C' },
];

const times = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

function MedicineForm() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [medications, setMedications] = useState([
    { medicineName: '', dosage: '', usageTime: '', specialNote: '' }
  ]);
  const [statusMedications, setStatusMedications] = useState([
    {
      id: 1,
      medicineName: 'Paracetamol',
      student: 'Nguyễn Văn A',
      dosage: '1 viên/ngày',
      usageTime: 'Sau bữa sáng',
      dateSubmitted: '22/05/2025',
      status: 'Chờ xác nhận',
    },
    {
      id: 2,
      medicineName: 'Vitamin C',
      student: 'Nguyễn Văn A',
      dosage: '1 viên/ngày',
      usageTime: 'Sau bữa trưa',
      dateSubmitted: '20/05/2025',
      status: 'Đã xác nhận',
    },
  ]);

  const onStudentChange = (value) => {
    setSelectedStudent(students.find(s => s.id === value));
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { medicineName: '', dosage: '', usageTime: '', specialNote: '' }
    ]);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const onFinish = (values) => {
    console.log('Form dữ liệu:', values);
    alert(`Gửi thuốc cho ${selectedStudent?.name} thành công!`);
  };

  const handleDelete = (id) => {
    setStatusMedications(statusMedications.filter((medication) => medication.id !== id));
  };

  const handleViewDetails = (id) => {
    console.log('View details for medication with ID:', id);
  };

  return (
    <div>
      {/* Medicine Form Section */}
      <Title level={3}>Gửi Thuốc cho Học sinh</Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Chọn học sinh">
          <Select
            placeholder="Chọn học sinh"
            onChange={onStudentChange}
            allowClear
          >
            {students.map(s => (
              <Option key={s.id} value={s.id}>{s.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedStudent && (
          <div>
            <Title level={5}>Thông tin thuốc cho {selectedStudent.name}</Title>

            {medications.map((medication, index) => (
              <Row key={index} gutter={16} style={{ marginBottom: '10px' }}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Tên thuốc"
                    name={['medications', index, 'medicineName']}
                    initialValue={medication.medicineName}
                    rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
                  >
                    <Input
                      placeholder="Ví dụ: Paracetamol"
                      onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Liều lượng"
                    name={['medications', index, 'dosage']}
                    initialValue={medication.dosage}
                    rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
                  >
                    <Input
                      placeholder="Ví dụ: 1 viên/ngày"
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Thời gian sử dụng"
                    name={['medications', index, 'usageTime']}
                    initialValue={medication.usageTime}
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian sử dụng!' }]}
                  >
                    <Select
                      value={medication.usageTime}
                      onChange={(value) => handleMedicationChange(index, 'usageTime', value)}
                    >
                      {times.map(t => (
                        <Option key={t} value={t}>{t}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Ghi chú đặc biệt"
                    name={['medications', index, 'specialNote']}
                    initialValue={medication.specialNote}
                  >
                    <TextArea
                      placeholder="Ví dụ: Chỉ uống khi sốt trên 38°C"
                      rows={3}
                      onChange={(e) => handleMedicationChange(index, 'specialNote', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            {/* Button container */}
<div className="button-container">
  <Button className="preview-btn" onClick={addMedication}>
    Thêm thuốc mới
  </Button>
  <Button className="submit-btn" htmlType="submit">
    Gửi thuốc
  </Button>
</div>
          </div>
        )}
      </Form>

      {/* Medication Status Section */}
      {/* <Title level={3}>Trạng thái phiếu gửi thuốc</Title> */}

<div className="section-card">
  <h2 className="section-title">Trạng thái phiếu gửi thuốc</h2>
  <div className="status-list">
    {statusMedications.map((medication) => (
      <div className="status-item" key={medication.id}>
        <div className="status-header">
          <div className="status-info">
            <h3>{medication.medicineName}</h3>
            <span className="status-date">Gửi ngày: {medication.dateSubmitted}</span>
          </div>
          <div className={`status-badge ${medication.status === 'Chờ xác nhận' ? 'pending' : medication.status === 'Đã xác nhận' ? 'approved' : 'rejected'}`}>
            {medication.status}
          </div>
        </div>
        <div className="status-details">
          <p><strong>Học sinh:</strong> {medication.student}</p>
          <p><strong>Liều lượng:</strong> {medication.dosage}</p>
          <p><strong>Thời gian:</strong> {medication.usageTime}</p>
        </div>
        <div className="status-actions">
          <button className="btn-text" onClick={() => handleViewDetails(medication.id)}>
            <span className="material-icons">Xem chi tiết</span>
          </button>
          <button className="btn-text" onClick={() => handleDelete(medication.id)}>
            <span className="material-icons">Hủy yêu cầu</span>
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}

export default MedicineForm;