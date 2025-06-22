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
  Col
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import {
  getStudentHealthProfiles,
  submitMedicationForm
} from '../../../api/medicalSubmission';
import MedicineHistory from './medicalHistory';
import './medicineForm.css';

const { Option } = Select;
const { TextArea } = Input;

const MedicineForm = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const parentId = localStorage.getItem('parentId');
  const [form] = Form.useForm();

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

      // Thêm thời gian submissionDate
      const submissionDate = new Date().toISOString();

      const submitData = {
        parentId: parseInt(parentId),
        studentId: parseInt(studentId),
        medicineImage: imageUrl,
        medicationDetails: medicationDetails,
        submissionDate
      };

      await submitMedicationForm(submitData);
      message.success("Gửi đơn thuốc thành công!");
      form.resetFields();
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
      <div className="medicine-form-header-center">
        <Typography.Title level={3} className="medicine-form-title">
          Gửi Thuốc cho Học sinh
        </Typography.Title>
        {/* <div className="medicine-form-subtitle">
          Chọn học sinh để nhập hồ sơ sức khỏe
        </div> */}
        <Form.Item className="medicine-form-select-wrapper" required>
          <Select
            value={selectedStudentId ?? undefined}
            placeholder="Chọn học sinh"
            className="medicine-form-select"
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
      </div>
      <Spin spinning={loading}>
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

        {selectedStudentId && (
          <MedicineHistory
            studentId={selectedStudentId}
            parentId={parentId}
            students={students}
          />
        )}
      </Spin>
    </div>
  );
};

export default MedicineForm;