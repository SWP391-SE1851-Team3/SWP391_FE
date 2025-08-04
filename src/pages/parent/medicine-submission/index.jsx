import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  Input,
  Button,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Typography,
  DatePicker
} from 'antd';
import {UploadOutlined,PlusOutlined,MinusCircleOutlined} from '@ant-design/icons';
import {getStudentHealthProfiles,submitMedicationForm,uploadMedicineImage} from '../../../api/medicalSubmission';
import MedicineHistory from './medicalHistory';
import './medicineForm.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const MedicineForm = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [form] = Form.useForm();
  const parentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!parentId) {
        message.error('Vui lòng đăng nhập!');
        return;
      }
      try {
        setLoading(true);
        const data = await getStudentHealthProfiles(parentId);
        setStudents(data || []);
      } catch (error) {
        message.error('Không tải được danh sách học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [parentId]);

  const beforeUpload = (file) => {
    const isPng = file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isPng) {
      message.error('Chỉ chấp nhận file PNG!');
      return Upload.LIST_IGNORE;
    }

    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFileChange = (info) => info.fileList.slice(-1);

  const disabledDate = (current) => {
    if (!current) return false;

    if (current.isBefore(dayjs(), 'day')) {
      return true;
    }

    const dayOfWeek = current.day();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const onFinish = async (values) => {
    try {
      const studentId = selectedStudentId;
      const medicationDetails = values.medicines.map(item => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        timeToUseList: item.timeToUseList,
        note: item.note || '',
        status: "Đang xử lí"
      }));

      const medicationDate = values.medicationDate;
      const medicationDateForServer = medicationDate.format('YYYY-MM-DDTHH:mm:ss');
      //const formattedMedicationDateForDisplay = formatDateTime(medicationDate.toISOString());

      const submitData = {
        parentId: parseInt(parentId),
        studentId: parseInt(studentId),
        medicationDetails,
        medicationDate: medicationDateForServer,
      };

      const result = await submitMedicationForm(submitData);
      const submissionId = result.medicationSubmissionId;

      const fileList = values.medicineImage;

      if (fileList && fileList.length > 0) {
        const fileObj = fileList[0];
        const actualFile = fileObj.originFileObj || fileObj;

        try {
          await uploadMedicineImage(submissionId, actualFile);
          message.success(`Đơn thuốc & ảnh đã được gửi thành công !`);
        } catch {
          message.error(`Đơn thuốc đã được gửi nhưng lỗi khi upload ảnh!`);
        }
      } else {
        message.success(`Đơn thuốc đã được gửi thành công!`);
      }
      form.resetFields();
    } catch {
      message.error('Có lỗi xảy ra khi gửi đơn thuốc!');
    }
  };

  return (
    <div className="medicine-form-container">
      <div className="medicine-form-header-center">
        <Typography.Title level={3} className="medicine-form-title">
          Gửi Thuốc Cho Học Sinh
        </Typography.Title>

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
            {students.map(s => (
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
            initialValues={{
              medicines: [{}],
              medicationDate: dayjs()
            }}
          >
            <Typography.Title level={4}>
              Thông tin thuốc cho {students.find(s => s.studentID === selectedStudentId)?.fullName}
            </Typography.Title>

            <Form.Item
              name="medicationDate"
              label="Ngày gửi thuốc"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày gửi thuốc!' },
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày gửi thuốc"
                format="DD/MM/YYYY"
                disabledDate={disabledDate}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.List name="medicines">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      className="medicine-form-section"
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'medicineName']}
                            label="Tên thuốc"
                            rules={[{
                              required: true,
                              pattern: /^[a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ\s]*$/,
                              message: 'Tên thuốc không hợp lệ'
                            }]}
                          >
                            <Input placeholder="Ví dụ: Paracetamol" />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'dosage']}
                            label="Liều lượng"
                            rules={[{
                              required: true,
                              pattern: /^[a-zA-Z0-9À-ỹ\\/][a-zA-Z0-9À-ỹ\s\\/]*$/,
                              message: 'Liều lượng không hợp lệ'
                            }]}
                          >
                            <Input placeholder="Ví dụ: 1 viên/ngày" />
                          </Form.Item>
                        </Col>

                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'timeToUseList']}
                            label="Thời gian"
                            rules={[{ required: true, message: 'Chọn thời gian uống' }]}
                          >
                            <Select placeholder="Chọn thời gian"  mode="multiple" allowClear>
                              <Option value="Sáng">Sáng</Option>
                              <Option value="Trưa">Trưa</Option>
                              <Option value="Chiều">Chiều</Option>
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
                        rules={[{
                          pattern: /^[a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ\s]*$/,
                          message: 'Ghi chú không hợp lệ'
                        }]}
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

            <Form.Item
              name="medicineImage"
              label="Ảnh thuốc (PNG)"
              valuePropName="fileList"
              getValueFromEvent={handleFileChange}
            >
              <Upload
                maxCount={1}
                beforeUpload={beforeUpload}
                accept="image/png"
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh PNG</Button>
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