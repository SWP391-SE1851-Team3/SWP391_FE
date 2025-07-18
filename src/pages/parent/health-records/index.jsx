import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Row, Col, Button, Select, message, InputNumber
} from 'antd';
import {
  getStudentHealthProfiles,
  getStudentHealthProfileByStudentId,
  createStudentHealthProfile,
  updateStudentHealthProfile
} from "../../../api/studentHealthProfiles";
import './health-record.css';

const { TextArea } = Input;
const { Option } = Select;

const StudentHealthRecord = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const parentId = localStorage.getItem('userId');

  // Lấy danh sách học sinh của phụ huynh
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

  // Load hồ sơ sức khỏe khi chọn học sinh
  useEffect(() => {
    if (!selectedStudentId || students.length === 0) return;
    const selectedStudent = students.find(s => Number(s.studentID) === Number(selectedStudentId));
    if (!selectedStudent) return;

    setLoading(true);
    getStudentHealthProfileByStudentId(selectedStudentId)
      .then(res => {
        const record = res.data;
        if (record && Object.keys(record).length > 0) {
          setHasProfile(true);
          form.setFieldsValue({
            fullName: selectedStudent.fullName,
            treatmentHistory: record.treatmentHistory ?? "",
            allergyDetails: record.allergyDetails ?? "",
            hearingScore: record.hearingScore ?? "",
            vaccines: record.vaccines ?? "",
            visionLeft: record.visionLeft ?? "",
            visionRight: record.visionRight ?? "",
            height: record.height ?? null,
            weight: record.weight ?? null,
            chronicDiseases: record.chronicDiseases ?? "",
            noteOfParent: record.noteOfParent ?? "",
          });
          message.success("Đã tải hồ sơ sức khỏe.");
        } else {
          setHasProfile(false);
          form.resetFields();
          setTimeout(() => {
            form.setFieldsValue({ fullName: selectedStudent.fullName });
          }, 0);
          message.warning("Chưa có hồ sơ, vui lòng nhập.");
        }
      })
      .catch(() => {
        setHasProfile(false);
        message.error('Không thể kiểm tra hồ sơ sức khỏe');
      })
      .finally(() => setLoading(false));
  }, [selectedStudentId, students, form]);

  // Xử lý lưu hồ sơ mới
  const handleSave = async (values) => {
    setLoading(true);
    try {
      await createStudentHealthProfile({
        studentId: selectedStudentId,
        ...values
      });
      message.success('Đã lưu hồ sơ sức khỏe.');
      setHasProfile(true);
    } catch (error) {
      message.error('Lỗi khi lưu, học sinh có thể đã có hồ sơ sức khỏe.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật hồ sơ đã có
  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await updateStudentHealthProfile({
        studentId: selectedStudentId,
        ...values
      });
      message.success('Cập nhật hồ sơ sức khỏe thành công.');
    } catch (error) {
      message.error('Lỗi khi cập nhật hồ sơ sức khỏe.');
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const onSubmit = (values) => {
    if (hasProfile) {
      handleUpdate(values);
    } else {
      handleSave(values);
    }
  };

  return (
    <Card
      title={
        <h2 className="health-record-title">
          {selectedStudentId
            ? `Hồ sơ sức khỏe của ${students.find(s => s.studentID === selectedStudentId)?.fullName || 'Không rõ'}`
            : 'Chọn học sinh để nhập hồ sơ sức khỏe'}
        </h2>
      }
      className="health-record-container"
    >
      <Select
        value={selectedStudentId ?? undefined}
        placeholder="Chọn học sinh"
        style={{ width: '30%', marginBottom: 16 }}
        onChange={(value) => {
          form.resetFields();
          setTimeout(() => setSelectedStudentId(value), 0);
        }}
        showSearch
        optionFilterProp="children"
      >
        {students.filter(s => s.studentID != null).map(s => (
          <Option key={s.studentID} value={s.studentID}>{s.fullName}</Option>
        ))}
      </Select>

      {selectedStudentId && (
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Họ tên học sinh" name="fullName"
            rules={hasProfile ? [] : [{ required: true, message: 'Vui lòng nhập họ tên học sinh!' }]}
          >
            <Input disabled={hasProfile} />
          </Form.Item>

          <Form.Item label="Dị ứng" name="allergyDetails" rules={[
            { required: true, message: 'Vui lòng nhập thông tin dị ứng!' },
            {
              pattern: /^[a-zA-ZÀ-ỹ0-9\s]+$/,
              message: 'Không được chứa ký tự đặc biệt!'
            },
            {
              validator: (_, value) => {
                if (value && value.startsWith(' ')) {
                  return Promise.reject('Không bắt đầu bằng dấu cách!');
                }
                return Promise.resolve();
              }
            }]}
          >
            <Input placeholder="Ví dụ: Dị ứng đậu phộng" />
          </Form.Item>

          <Form.Item label="Tiền sử điều trị" name="treatmentHistory"
            rules={[
              { required: true, message: 'Vui lòng nhập tiền sử điều trị!' },
              {
                pattern: /^[a-zA-ZÀ-ỹ0-9\s]+$/,
                message: 'Không được chứa ký tự đặc biệt!'
              },
              {
                validator: (_, value) => {
                  if (value && value.startsWith(' ')) {
                    return Promise.reject('Không bắt đầu bằng dấu cách!');
                  }
                  return Promise.resolve();
                }}]}>
            <Input rows={3} placeholder="Ví dụ: Từng điều trị viêm phổi năm 2023" />
          </Form.Item>

          <Form.Item label="Thị lực">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="visionLeft" label="Trái" rules={[
                  { required: true, message: 'Nhập thị lực mắt trái' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.reject();
                      const regex = /^\d+\/\d+$/;
                      if (!regex.test(value)) return Promise.reject('Định dạng phải là x/10, ví dụ 6/10');
                      const [x, y] = value.split('/').map(Number);
                      if (x <= 0 || y != 10) return Promise.reject('Giá trị phải lớn hơn 0');
                      return Promise.resolve();
                    }
                  }
                ]}>
                  <Input placeholder="Ví dụ: 6/10" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="visionRight" label="Phải" rules={[
                  { required: true, message: 'Nhập thị lực mắt phải' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.reject();
                      const regex = /^\d+\/\d+$/;
                      if (!regex.test(value)) return Promise.reject('Định dạng phải là x/10, ví dụ 6/10');
                      const [x, y] = value.split('/').map(Number);
                      if (x <= 0 || y != 10) return Promise.reject('Giá trị phải lớn hơn 0');
                      return Promise.resolve();
                    }
                  }
                ]}>
                  <Input placeholder="Ví dụ: 7/10" />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="Thính lực" name="hearingScore" rules={[{ required: true, message: 'Vui lòng chọn mức thính lực!' }]}>
            <Select placeholder="Chọn mức độ">
              <Option value="normal">Bình thường</Option>
              <Option value="mild">Giảm nhẹ</Option>
              <Option value="moderate">Giảm vừa</Option>
              <Option value="severe">Giảm nặng</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Lịch sử tiêm chủng" name="vaccines" rules={[
            { required: true, message: 'Vui lòng nhập lịch sử tiêm chủng!' },
            {
              pattern: /^[^\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`]+.*$/,
              message: 'Không bắt đầu bằng dấu cách hoặc chứa ký tự đặc biệt!'
            }
          ]}>
            <TextArea rows={3} placeholder="Ví dụ: Đã tiêm vaccine sởi 2024" />
          </Form.Item>

          <Form.Item label="Chiều cao (cm)" name="height" rules={[
            { required: true, message: 'Vui lòng nhập chiều cao!' },
            {
              type: 'number',
              min: 0.1,
              message: 'Chiều cao phải lớn hơn 0!'
            }]}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Cân nặng (kg)" name="weight" rules={[
            { required: true, message: 'Vui lòng nhập cân nặng!' },
            {
              type: 'number',
              min: 0.1,
              message: 'Cân nặng phải lớn hơn 0!'
            }]}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Bệnh mãn tính" name="chronicDiseases" rules={[
            { required: true, message: 'Vui lòng nhập thông tin bệnh mãn tính!' },
            {
              pattern: /^[^\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`]+.*$/,
              message: 'Không bắt đầu bằng dấu cách hoặc chứa ký tự đặc biệt!'
            }]}>
            <Input placeholder="Ví dụ: Hen suyễn" />
          </Form.Item>

          <Form.Item label="Ghi chú từ phụ huynh" name="noteOfParent" rules={[
            { required: true, message: 'Vui lòng nhập ghi chú!' },
            {
              pattern: /^[^\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`]+.*$/,
              message: 'Không bắt đầu bằng dấu cách hoặc chứa ký tự đặc biệt!'
            }]}>
            <TextArea rows={2} placeholder="Ví dụ: Cần theo dõi thêm về hô hấp" />
          </Form.Item>

          <div className="health-record-actions">
            <Button type="primary" htmlType="submit" loading={loading}>
              {hasProfile ? 'Cập nhật' : 'Lưu hồ sơ'}
            </Button>
          </div>
        </Form>
      )}
    </Card>
  );
};

export default StudentHealthRecord;