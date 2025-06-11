import React, { useState } from 'react';
import { Form, Select, Input, Button, Typography, Row, Col, Modal } from 'antd';
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
      student: 'Nguyễn Văn A',
      dateSubmitted: '22/05/2025',
      status: 'Chờ xác nhận',
      medicines: [
        {
          medicineName: 'Paracetamol',
          dosage: '1 viên/ngày',
          usageTime: 'Sau bữa sáng',
          specialNote: 'Chỉ uống khi sốt trên 38°C',
        },
        {
          medicineName: 'Vitamin C',
          dosage: '1 viên/ngày',
          usageTime: 'Sau bữa trưa',
        },
      ],
    },
  ]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedMedicationDetail, setSelectedMedicationDetail] = useState(null);

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

  const onFinish = () => {
    const newEntry = {
      id: Date.now(),
      student: selectedStudent.name,
      dateSubmitted: new Date().toLocaleDateString('vi-VN'),
      status: 'Chờ xác nhận',
      medicines: medications,
    };
    setStatusMedications([...statusMedications, newEntry]);
    alert(`Gửi thuốc cho ${selectedStudent.name} thành công!`);
    setMedications([{ medicineName: '', dosage: '', usageTime: '', specialNote: '' }]);
    setSelectedStudent(null);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc muốn hủy yêu cầu này?',
      content: 'Thao tác này sẽ xóa yêu cầu gửi thuốc khỏi danh sách.',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        setStatusMedications(statusMedications.filter((item) => item.id !== id));
      },
    });
  };

  const handleViewDetails = (id) => {
    const selected = statusMedications.find((item) => item.id === id);
    setSelectedMedicationDetail(selected);
    setIsDetailModalVisible(true);
  };

  return (
    <div>
      <Title level={3}>Gửi Thuốc cho Học sinh</Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Chọn học sinh">
          <Select placeholder="Chọn học sinh" onChange={onStudentChange} allowClear>
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
                    rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
                  >
                    <Input
                      placeholder="Ví dụ: Paracetamol"
                      value={medication.medicineName}
                      onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Liều lượng"
                    name={['medications', index, 'dosage']}
                    rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
                  >
                    <Input
                      placeholder="Ví dụ: 1 viên/ngày"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Thời gian sử dụng"
                    name={['medications', index, 'usageTime']}
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian sử dụng!' }]}
                  >
                    <Select
                      placeholder="Chọn"
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
                  >
                    <TextArea
                      placeholder="Ví dụ: Chỉ uống khi sốt trên 38°C"
                      value={medication.specialNote}
                      rows={3}
                      onChange={(e) => handleMedicationChange(index, 'specialNote', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            <div className="button-container">
              <Button className="preview-btn" onClick={addMedication}>Thêm thuốc mới</Button>
              <Button className="submit-btn" htmlType="submit">Gửi thuốc</Button>
            </div>
          </div>
        )}
      </Form>

      <div className="section-card">
        <h2 className="section-title">Trạng thái phiếu gửi thuốc</h2>
        <div className="status-list">
          {statusMedications.map((med) => (
            <div className="status-item" key={med.id}>
              <div className="status-header">
                <div className="status-info">
                  <h3>Học sinh: {med.student}</h3>
                  <span className="status-date">Gửi ngày: {med.dateSubmitted}</span>
                </div>
                <div className={`status-badge ${med.status === 'Chờ xác nhận' ? 'pending' : med.status === 'Đã xác nhận' ? 'approved' : 'rejected'}`}>
                  {med.status}
                </div>
              </div>
              <div className="status-actions">
                <button className="btn-text" onClick={() => handleViewDetails(med.id)}>Xem chi tiết</button>
                <button className="btn-text" onClick={() => handleDelete(med.id)}>Hủy yêu cầu</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="Chi tiết gửi thuốc"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
      >
        {selectedMedicationDetail && (
          <div>
            <p><strong>Học sinh:</strong> {selectedMedicationDetail.student}</p>
            <p><strong>Ngày gửi:</strong> {selectedMedicationDetail.dateSubmitted}</p>
            <p><strong>Trạng thái:</strong> {selectedMedicationDetail.status}</p>
            <hr />
            {selectedMedicationDetail.medicines.map((med, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <p><strong>Thuốc {index + 1}:</strong></p>
                <p>Tên thuốc: {med.medicineName}</p>
                <p>Liều lượng: {med.dosage}</p>
                <p>Thời gian sử dụng: {med.usageTime}</p>
                {med.specialNote && <p>Ghi chú: {med.specialNote}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MedicineForm;
