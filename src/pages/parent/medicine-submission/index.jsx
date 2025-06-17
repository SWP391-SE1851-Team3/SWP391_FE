import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  Input,
  Button,
  Typography,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Modal
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import {
  getStudentHealthProfiles,
  submitMedicationForm,
  getMedicationSubmissionsByParentId,
  getMedicationSubmissionDetails
} from '../../../api/medicalSubmission';
import './medicineForm.css';

const { Option } = Select;
const { TextArea } = Input;

// Status text and color mapping (customize if your API khác)
const statusColors = {
  pending: '#FFCB05', // vàng
  approved: '#4CAF50',
  rejected: '#F44336'
};
const statusText = {
  pending: 'Chờ xác nhận',
  approved: 'Đã xác nhận',
  rejected: 'Đã từ chối'
};

const MedicineForm = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const parentId = localStorage.getItem('parentId');
  const [form] = Form.useForm();

  // Lịch sử
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // Load danh sách học sinh
  useEffect(() => {
    if (!parentId) {
      message.error('Vui lòng đăng nhập!');
      return;
    }
    setLoading(true);
    getStudentHealthProfiles(parentId)
      .then(res => {
        setStudents(res.data || []);
      })
      .catch(() => message.error('Không tải được danh sách học sinh'))
      .finally(() => setLoading(false));
  }, [parentId]);

  // Load lịch sử đơn thuốc khi đổi học sinh
  useEffect(() => {
    if (!selectedStudentId || !parentId) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    getMedicationSubmissionsByParentId(parentId)
      .then(res => {
        const filtered = (res.data || []).filter(
          item => item.studentId === selectedStudentId
        );
        setHistory(filtered);
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [selectedStudentId, parentId]);

  // Xem chi tiết đơn thuốc
  const handleViewDetail = async (submissionId) => {
    setHistoryLoading(true);
    try {
      const res = await getMedicationSubmissionDetails(submissionId);
      setDetailModal({
        open: true,
        data: res.data
      });
    } catch {
      setDetailModal({ open: false, data: null });
    }
    setHistoryLoading(false);
  };

  // Hủy yêu cầu (nếu có API thật thì thay alert)
  const handleCancelRequest = (submissionId) => {
    message.info(`Bạn vừa nhấn hủy yêu cầu đơn thuốc #${submissionId}. (Chức năng này cần bổ sung API nếu muốn thực sự hủy trên server)`);
  };

  const onFinish = async (values) => {
    try {
      const parentId = localStorage.getItem('parentId');
      const studentId = selectedStudentId;

      // Upload ảnh thuốc nếu có
      let imageUrl = '';
      if (values.medicineImage && values.medicineImage.fileList.length > 0) {
        const file = values.medicineImage.file.originFileObj;
        imageUrl = await fakeUploadImage(file);
      }

      // Chuẩn hóa danh sách thuốc
      const medicationDetails = values.medicines.map(item => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        timeToUse: item.time,
        note: item.note || ""
      }));

      const submitData = {
        parentId: parseInt(parentId),
        studentId: parseInt(studentId),
        medicineImage: imageUrl,
        medicationDetails: medicationDetails
      };

      await submitMedicationForm(submitData);
      message.success("Gửi đơn thuốc thành công!");
      form.resetFields();
      // Reload history after submit
      setHistoryLoading(true);
      getMedicationSubmissionsByParentId(parentId)
        .then(res => {
          const filtered = (res.data || []).filter(
            item => item.studentId === selectedStudentId
          );
          setHistory(filtered);
        })
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi đơn thuốc!");
    }
  };

  // Hàm upload giả lập tạm thời
  const fakeUploadImage = async (file) => {
    // Ở đây bạn thay bằng logic upload ảnh thực tế về server (nếu backend đã hỗ trợ upload file)
    console.log("Upload file:", file);
    return "https://dummyimage.com/200x200/000/fff&text=Uploaded";
  };

  return (
    <div className="medicine-form-container">
      <Typography.Title level={3}>Gửi Thuốc cho Học sinh</Typography.Title>
      <Spin spinning={loading}>
        <Form.Item label="Chọn học sinh" required>
          <Select
            value={selectedStudentId ?? undefined}
            placeholder="Chọn học sinh"
            style={{ width: '50%' }}
            onChange={(value) => {
              setSelectedStudentId(value);
              form.resetFields();
            }}
            showSearch
            optionFilterProp="children"
          >
            {students
              .filter((s) => s.studentID != null)
              .map((s) => (
                <Option key={s.studentID} value={s.studentID}>
                  {s.fullName}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {selectedStudentId && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ medicines: [{}] }}
          >
            <Typography.Title level={4}>
              Thông tin thuốc cho {students.find(s => s.studentID === selectedStudentId)?.fullName}
            </Typography.Title>

            <Form.List name="medicines">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'medicineName']}
                            label="Tên thuốc"
                            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                          >
                            <Input placeholder="Ví dụ: Paracetamol" />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'dosage']}
                            label="Liều lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                          >
                            <Input placeholder="Ví dụ: 1 viên/ngày" />
                          </Form.Item>
                        </Col>

                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'time']}
                            label="Thời gian"
                            rules={[{ required: true, message: 'Chọn thời gian uống' }]}
                          >
                            <Select placeholder="Chọn thời gian">
                              <Option value="sang">Sáng</Option>
                              <Option value="trua">Trưa</Option>
                              <Option value="chieu">Chiều</Option>
                              <Option value="toi">Tối</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={1}>
                          <Button
                            danger
                            type="link"
                            onClick={() => remove(name)}
                            style={{ marginTop: 32 }}
                            icon={<MinusCircleOutlined />}
                          />
                        </Col>
                      </Row>

                      <Form.Item
                        {...restField}
                        name={[name, 'note']}
                        label="Ghi chú"
                      >
                        <TextArea rows={2} placeholder="Ghi chú đặc biệt..." />
                      </Form.Item>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thuốc
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item name="medicineImage" label="Ảnh thuốc (chỉ upload 1 lần)">
              <Upload maxCount={1}>
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>

            <Button type="primary" htmlType="submit">Gửi thuốc</Button>
          </Form>
        )}

        {/* Lịch sử đơn thuốc - giao diện giống ảnh bạn gửi */}
        {selectedStudentId && (
          <div style={{ marginTop: 36 }}>
            <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 32, marginBottom: 24 }}>
              Trạng thái phiếu gửi thuốc
            </h2>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: 36 }}>
                <Spin />
              </div>
            ) : (
              <>
                {history.map(item => (
                  <div
                    key={item.submissionId}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      padding: 24,
                      margin: '0 auto 24px auto',
                      maxWidth: 900,
                      minWidth: 340,
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 24 }}>
                      Học sinh: {
                        students?.find(s => s.studentID === item.studentId)?.fullName ||
                        item.studentName ||
                        '---'
                      }
                    </div>
                    <div style={{ margin: '12px 0', color: '#555' }}>
                      Gửi ngày: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); handleViewDetail(item.submissionId); }}
                        style={{ color: '#1677ff', fontWeight: 500 }}
                      >
                        Xem chi tiết
                      </a>
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); handleCancelRequest(item.submissionId); }}
                        style={{ color: '#1677ff', fontWeight: 500 }}
                      >
                        Hủy yêu cầu
                      </a>
                    </div>
                    <span
                      style={{
                        position: 'absolute',
                        right: 32,
                        top: 32,
                        background: statusColors[item.status || 'pending'],
                        color: '#fff',
                        borderRadius: 18,
                        padding: '6px 20px',
                        fontWeight: 600,
                        fontSize: 16
                      }}
                    >
                      {statusText[item.status || 'pending']}
                    </span>
                  </div>
                ))}
                {!historyLoading && history.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>
                    Chưa có đơn thuốc nào.
                  </div>
                )}
              </>
            )}

            <Modal
              open={detailModal.open}
              onCancel={() => setDetailModal({ open: false, data: null })}
              title="Chi tiết đơn thuốc"
              footer={null}
            >
              {detailModal.data ? (
                <div>
                  {detailModal.data.medicineImage && (
                    <img
                      src={detailModal.data.medicineImage}
                      alt="Ảnh thuốc"
                      style={{ maxWidth: 200, marginBottom: 8 }}
                    />
                  )}
                  <div>
                    <b>Danh sách thuốc:</b>
                    <ul>
                      {(detailModal.data.medicationDetails || []).map((med, idx) => (
                        <li key={idx}>
                          <b>{med.medicineName}</b> - {med.dosage} - {med.timeToUse} <br />
                          <i>{med.note}</i>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div>Không có dữ liệu chi tiết.</div>
              )}
            </Modal>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default MedicineForm;