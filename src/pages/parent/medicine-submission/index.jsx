import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  Input, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Modal, 
  message,
  Spin,
  Upload
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MedicationService from '../../../api/medicalSubmission';
import './medicineForm.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MedicineForm = () => {
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [medicationDetails, setMedicationDetails] = useState([{ medicineName: '', dosage: '', timeToUse: '', note: '', medicineImage: '' }]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  const parentId = localStorage.getItem('parentId');
  const usageTimes = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

  useEffect(() => {
    if (!parentId) {
      message.error('Vui lòng đăng nhập lại');
      return;
    }
    loadData();
  }, [parentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [childrenRes, submissionsRes] = await Promise.all([
        MedicationService.getChildrenByParent(parentId),
        MedicationService.getSubmissionsByParent(parentId)
      ]);

      if (childrenRes.success) {
        setStudents(Array.isArray(childrenRes.data) ? childrenRes.data : []);
      }
      if (submissionsRes.success) {
        setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
      }
    } catch (error) {
      console.error('Data loading error:', error);
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.studentID === studentId);
    setSelectedStudent(student);
    form.setFieldsValue({ studentId });
    setMedicationDetails([{ medicineName: '', dosage: '', timeToUse: '', note: '', medicineImage: '' }]);
  };

  const addMedication = () => {
    setMedicationDetails(prev => [...prev, { medicineName: '', dosage: '', timeToUse: '', note: '', medicineImage: '' }]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medicationDetails];
    updated[index][field] = value;
    setMedicationDetails(updated);
  };

  const removeMedication = (index) => {
    if (medicationDetails.length <= 1) {
      message.warning('Cần ít nhất 1 loại thuốc');
      return;
    }
    setMedicationDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, info) => {
    if (info.file.status === 'removed') {
      updateMedication(index, 'medicineImage', '');
      return;
    }
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => updateMedication(index, 'medicineImage', e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Validate medication details before submit
      const validMedications = medicationDetails.filter(m => 
        m.medicineName.trim() !== '' && 
        m.dosage.trim() !== '' &&
        m.timeToUse.trim() !== ''
      );

      if (validMedications.length === 0) {
        message.error('Vui lòng nhập đầy đủ thông tin thuốc trước khi gửi.');
        setLoading(false);
        return;
      }

      const submissionData = {
        parentID: Number(parentId),
        studentID: selectedStudent.studentID,
        medicineImage: validMedications[0]?.medicineImage || '',
        medicationDetails: validMedications
      };

      const result = await MedicationService.submitMedication(submissionData);
      if (result.success) {
        message.success('Gửi thuốc thành công');
        await loadData();
        setMedicationDetails([{ medicineName: '', dosage: '', timeToUse: '', note: '', medicineImage: '' }]);
        setSelectedStudent(null);
        form.resetFields();
      } else {
        message.error('Gửi thuốc thất bại');
      }
    } catch (error) {
      console.error('Submission error:', error);
      message.error('Có lỗi xảy ra khi gửi thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmission = async (submissionId) => {
    Modal.confirm({
      title: 'Xác nhận hủy yêu cầu',
      content: 'Bạn có chắc muốn hủy yêu cầu gửi thuốc này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          const result = await MedicationService.cancelSubmission(submissionId);
          if (result.success) {
            message.success('Đã hủy yêu cầu');
            await loadData();
          } else {
            message.error('Hủy yêu cầu thất bại');
          }
        } catch (error) {
          console.error('Cancellation error:', error);
          message.error('Có lỗi xảy ra khi hủy yêu cầu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const viewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  return (
    <div className="medicine-form-container">
      <Spin spinning={loading}>
        <Title level={3} className="form-title">Gửi Thuốc cho Học sinh</Title>
        <Form form={form} layout="vertical">
          <Form.Item label="Chọn học sinh" name="studentId" rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}> 
            <Select placeholder="Chọn học sinh" onChange={handleStudentChange} allowClear disabled={loading}>
              {students.map(student => (
                <Option key={student.studentID} value={student.studentID}>{student.fullName}</Option>
              ))}
            </Select>
          </Form.Item>

          {selectedStudent && (
            <>
              <Title level={5} className="section-title">Thông tin thuốc cho {selectedStudent.fullName}</Title>
              {medicationDetails.map((med, index) => (
                <div key={index} className="medication-item">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Tên thuốc" required rules={[{ required: true, message: 'Nhập tên thuốc' }]}> 
                        <Input value={med.medicineName} onChange={(e) => updateMedication(index, 'medicineName', e.target.value)} placeholder="Ví dụ: Paracetamol" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Liều lượng" required rules={[{ required: true, message: 'Nhập liều lượng' }]}> 
                        <Input value={med.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} placeholder="Ví dụ: 1 viên/ngày" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Thời gian" required rules={[{ required: true, message: 'Chọn thời gian' }]}> 
                        <Select value={med.timeToUse} onChange={(value) => updateMedication(index, 'timeToUse', value)} placeholder="Chọn thời gian">
                          {usageTimes.map(time => (<Option key={time} value={time}>{time}</Option>))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Ghi chú">
                        <TextArea value={med.note} onChange={(e) => updateMedication(index, 'note', e.target.value)} rows={2} placeholder="Ghi chú đặc biệt..." />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Ảnh thuốc (không bắt buộc)">
                        <Upload beforeUpload={() => false} onChange={(info) => handleImageChange(index, info)} showUploadList={false} accept="image/*">
                          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                        {med.medicineImage && (<img src={med.medicineImage} alt="medicine" style={{ maxWidth: 100, marginTop: 8 }} />)}
                      </Form.Item>
                    </Col>
                    <Col xs={24} style={{ textAlign: 'right' }}>
                      <Button danger onClick={() => removeMedication(index)} disabled={medicationDetails.length <= 1}>Xóa</Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <div className="form-actions">
                <Button type="dashed" onClick={addMedication}>Thêm thuốc</Button>
                <Button type="primary" onClick={handleSubmit} disabled={!selectedStudent}>Gửi thuốc</Button>
              </div>
            </>
          )}
        </Form>

        <div className="submissions-section">
          <Title level={4} className="section-title">Lịch sử gửi thuốc</Title>
          {submissions.length === 0 ? (<p>Chưa có yêu cầu gửi thuốc nào</p>) : (
            <div className="submission-list">
              {submissions.map(sub => (
                <div key={sub.id} className={`submission-item ${sub.status.toLowerCase()}`}>
                  <div className="submission-header">
                    <span className="student-name">{sub.studentName}</span>
                    <span className="submission-date">{sub.submissionDate}</span>
                    <span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
                  </div>
                  <div className="submission-actions">
                    <Button type="link" onClick={() => viewSubmissionDetails(sub)}>Xem chi tiết</Button>
                    {sub.status === 'PENDING' && (
                      <Button type="link" danger onClick={() => handleCancelSubmission(sub.id)}>Hủy yêu cầu</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          title="Chi tiết yêu cầu gửi thuốc"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedSubmission && (
            <div className="submission-detail">
              <div className="detail-row"><span className="detail-label">Học sinh:</span><span>{selectedSubmission.studentName}</span></div>
              <div className="detail-row"><span className="detail-label">Ngày gửi:</span><span>{selectedSubmission.submissionDate}</span></div>
              <div className="detail-row"><span className="detail-label">Trạng thái:</span><span className={`status-text ${selectedSubmission.status.toLowerCase()}`}>{selectedSubmission.status}</span></div>
              <div className="medications-list">
                <h4>Danh sách thuốc:</h4>
                {selectedSubmission.medicationDetails.map((med, idx) => (
                  <div key={idx} className="medication-detail">
                    <p><strong>Tên thuốc:</strong> {med.medicineName}</p>
                    <p><strong>Liều lượng:</strong> {med.dosage}</p>
                    <p><strong>Thời gian:</strong> {med.timeToUse}</p>
                    {med.note && <p><strong>Ghi chú:</strong> {med.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default MedicineForm;
