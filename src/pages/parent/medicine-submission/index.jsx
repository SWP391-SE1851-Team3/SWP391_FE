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
  const [medicationDetails, setMedicationDetails] = useState([{ 
    medicationName: '', 
    dosage: '', 
    timesToUse: '', 
    notes: '',
    medicineImage: ''
  }]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  const parentId = localStorage.getItem('parentId');
  const usageTimes = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load children list
        const childrenRes = await MedicationService.getChildrenByParent(parentId);
        if (childrenRes.success) {
          setStudents(childrenRes.data);
        }
        
        // Load submissions
        const submissionsRes = await MedicationService.getSubmissionsByParent(parentId);
        if (submissionsRes.success) {
          setSubmissions(submissionsRes.data);
        }
      } catch (error) {
        console.error('Data loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (parentId) {
      loadData();
    } else {
      message.error('Vui lòng đăng nhập lại');
    }
  }, [parentId]);

  // Handle student selection
  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.studentID === studentId);
    setSelectedStudent(student);
    form.setFieldsValue({ studentId });
    setMedicationDetails([{ medicationName: '', dosage: '', timesToUse: '', notes: '', medicineImage: '' }]);
  };

  // Add new medication field
  const addMedication = () => {
    setMedicationDetails([...medicationDetails, { 
      medicationName: '', 
      dosage: '', 
      timesToUse: '', 
      notes: '',
      medicineImage: ''
    }]);
  };

  // Update medication field
  const updateMedication = (index, field, value) => {
    const updated = [...medicationDetails];
    updated[index][field] = value;
    setMedicationDetails(updated);
  };

  // Remove medication field
  const removeMedication = (index) => {
    if (medicationDetails.length <= 1) {
      message.warning('Cần ít nhất 1 loại thuốc');
      return;
    }
    const updated = medicationDetails.filter((_, i) => i !== index);
    setMedicationDetails(updated);
  };

  const handleImageChange = (index, info) => {
    if (info.file.status === 'removed') {
      const updated = [...medicationDetails];
      updated[index].medicineImage = '';
      setMedicationDetails(updated);
      return;
    }
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const updated = [...medicationDetails];
        updated[index].medicineImage = e.target.result;
        setMedicationDetails(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit medication form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const submissionData = {
        parentId: Number(parentId),
        studentId: selectedStudent.id,
        medicineImage: medicationDetails.filter(m => m.medicineImage.trim() !== '')[0].medicineImage,
        medicationDetails: medicationDetails.filter(m => m.medicationName.trim() !== '')
      };
      
      const result = await MedicationService.submitMedication(submissionData);
      
      if (result.success) {
        // Refresh submissions
        const res = await MedicationService.getSubmissionsByParent(parentId);
        if (res.success) {
          setSubmissions(res.data);
        }
        
        // Reset form
        setMedicationDetails([{ medicationName: '', dosage: '', timesToUse: '', notes: '', medicineImage: '' }]);
        setSelectedStudent(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel submission
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
            // Refresh submissions
            const res = await MedicationService.getSubmissionsByParent(parentId);
            if (res.success) {
              setSubmissions(res.data);
            }
          }
        } catch (error) {
          console.error('Cancellation error:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // View submission details
  const viewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  return (
    <div className="medicine-form-container">
      <Spin spinning={loading}>
        <Title level={3} className="form-title">Gửi Thuốc cho Học sinh</Title>
        
        <Form form={form} layout="vertical">
          <Form.Item
            label="Chọn học sinh"
            name="studentId"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select
              placeholder="Chọn học sinh"
              onChange={handleStudentChange}
              allowClear
              disabled={loading}
            >
              {students.map(student => (
                <Option key={student.studentID} value={student.studentID}>
                  {student.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedStudent && (
            <>
              <Title level={5} className="section-title">
                Thông tin thuốc cho {selectedStudent.fullName}
              </Title>

              {medicationDetails.map((med, index) => (
                <div key={index} className="medication-item">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Tên thuốc"
                        required
                        rules={[{ required: true, message: 'Nhập tên thuốc' }]}
                      >
                        <Input
                          value={med.medicationName}
                          onChange={(e) => updateMedication(index, 'medicationName', e.target.value)}
                          placeholder="Ví dụ: Paracetamol"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Liều lượng"
                        required
                        rules={[{ required: true, message: 'Nhập liều lượng' }]}
                      >
                        <Input
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="Ví dụ: 1 viên/ngày"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Thời gian"
                        required
                        rules={[{ required: true, message: 'Chọn thời gian' }]}
                      >
                        <Select
                          value={med.timesToUse}
                          onChange={(value) => updateMedication(index, 'timesToUse', value)}
                          placeholder="Chọn thời gian"
                        >
                          {usageTimes.map(time => (
                            <Option key={time} value={time}>{time}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item label="Ghi chú">
                        <TextArea
                          value={med.notes}
                          onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                          rows={2}
                          placeholder="Ghi chú đặc biệt..."
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item label="Ảnh thuốc (không bắt buộc)">
                        <Upload
                          beforeUpload={() => false}
                          onChange={(info) => handleImageChange(index, info)}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                        {med.medicineImage && (
                          <img src={med.medicineImage} alt="medicine" style={{maxWidth: 100, marginTop: 8}} />
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} style={{ textAlign: 'right' }}>
                      <Button 
                        danger 
                        onClick={() => removeMedication(index)}
                        disabled={medicationDetails.length <= 1}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}

              <div className="form-actions">
                <Button type="dashed" onClick={addMedication}>
                  Thêm thuốc
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  disabled={!selectedStudent}
                >
                  Gửi thuốc
                </Button>
              </div>
            </>
          )}
        </Form>

        <div className="submissions-section">
          <Title level={4} className="section-title">Lịch sử gửi thuốc</Title>
          
          {submissions.length === 0 ? (
            <p>Chưa có yêu cầu gửi thuốc nào</p>
          ) : (
            <div className="submission-list">
              {submissions.map(sub => (
                <div key={sub.id} className={`submission-item ${sub.status.toLowerCase()}`}>
                  <div className="submission-header">
                    <span className="student-name">{sub.studentName}</span>
                    <span className="submission-date">{sub.submissionDate}</span>
                    <span className={`status-badge ${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div className="submission-actions">
                    <Button type="link" onClick={() => viewSubmissionDetails(sub)}>
                      Xem chi tiết
                    </Button>
                    
                    {sub.status === 'PENDING' && (
                      <Button 
                        type="link" 
                        danger
                        onClick={() => handleCancelSubmission(sub.id)}
                      >
                        Hủy yêu cầu
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission Detail Modal */}
        <Modal
          title="Chi tiết yêu cầu gửi thuốc"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedSubmission && (
            <div className="submission-detail">
              <div className="detail-row">
                <span className="detail-label">Học sinh:</span>
                <span>{selectedSubmission.studentName}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Ngày gửi:</span>
                <span>{selectedSubmission.submissionDate}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Trạng thái:</span>
                <span className={`status-text ${selectedSubmission.status.toLowerCase()}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              
              <div className="medications-list">
                <h4>Danh sách thuốc:</h4>
                {selectedSubmission.medicationDetails.map((med, idx) => (
                  <div key={idx} className="medication-detail">
                    <p><strong>Tên thuốc:</strong> {med.medicationName}</p>
                    <p><strong>Liều lượng:</strong> {med.dosage}</p>
                    <p><strong>Thời gian:</strong> {med.timesToUse}</p>
                    {med.notes && <p><strong>Ghi chú:</strong> {med.notes}</p>}
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