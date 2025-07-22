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
  DatePicker,
  Checkbox
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import {
  getStudentHealthProfiles,
  submitMedicationForm,
  uploadMedicineImage
} from '../../../api/medicalSubmission';
import MedicineHistory from './medicalHistory';
import './medicineForm.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MedicineForm = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [form] = Form.useForm();

  const parentId = localStorage.getItem('userId');

  useEffect(() => {
    if (!parentId) {
      message.error('Vui lòng đăng nhập!');
      return;
    }
    setLoading(true);
    getStudentHealthProfiles(parentId)
      .then(data => {
        setStudents(data || []);
      })
      .catch(() => message.error('Không tải được danh sách học sinh'))
      .finally(() => setLoading(false));
  }, [parentId]);

  // Chỉ cho upload file .png
  const beforeUpload = (file) => {
    const isPng = file.type === 'image/png';
    if (!isPng) {
      message.error('Chỉ chấp nhận file PNG!');
    }
    return isPng ? false : Upload.LIST_IGNORE;
  };

  const onFinish = async (values) => {
    try {
      const studentId = selectedStudentId;

      const medicationDetails = values.medicines.map(item => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        timeToUse: item.time ? item.time.join(', ') : '',
        note: item.note || "",
        startDate: item.dateRange ? item.dateRange[0].format('YYYY-MM-DD') : '',
        endDate: item.dateRange ? item.dateRange[1].format('YYYY-MM-DD') : ''
      }));

      const submissionDate = new Date().toISOString();

      const submitData = {
        parentId: parseInt(parentId),
        studentId: parseInt(studentId),
        medicineImage: '', // upload ảnh sau
        medicationDetails,
        submissionDate
      };

      const result = await submitMedicationForm(submitData);
      const submissionId = result.submissionId || result.id;

      if (
        values.medicineImage &&
        values.medicineImage.fileList &&
        values.medicineImage.fileList.length > 0
      ) {
        const fileObj = values.medicineImage.fileList[0].originFileObj;
        if (fileObj) {
          await uploadMedicineImage(submissionId, fileObj, true);
          message.success("Đơn thuốc & ảnh đã được gửi thành công!");
        } else {
          message.warning("Không tìm thấy file hợp lệ để upload.");
        }
      } else {
        message.success("Đơn thuốc đã được gửi thành công!");
      }

      form.resetFields();
      setSelectedStudentId(null);
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi đơn thuốc!");
    }
  };

  // Tùy chọn thời gian uống thuốc
  const timeOptions = [
    { label: 'Sáng', value: 'sang' },
    { label: 'Trưa', value: 'trua' },
    { label: 'Chiều', value: 'chieu' },
    { label: 'Tối', value: 'toi' }
  ];

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
                    <div
                      key={key}
                      style={{
                        border: '1px solid #ddd',
                        padding: 16,
                        marginBottom: 16,
                        borderRadius: 8
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'medicineName']}
                            label="Tên thuốc"
                            rules={[
                              {required: true,
                                pattern: /^[a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ\s]*$/,
                                message: 'Tên thuốc không được bắt đầu bằng khoảng trắng hoặc chứa ký tự đặc biệt'
                              }
                            ]}
                          >
                            <Input placeholder="Ví dụ: Paracetamol" />
                          </Form.Item>
                        </Col>

                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            name={[name, 'dosage']}
                            label="Liều lượng"
                            rules={[
                              { required: true, message: 'Vui lòng nhập liều lượng' },
                              {
                                pattern: /^[a-zA-Z0-9À-ỹ\\/][a-zA-Z0-9À-ỹ\s\\/]*$/,
                                message: 'Liều lượng không được bắt đầu bằng khoảng trắng hoặc chứa ký tự đặc biệt'
                              }
                            ]}
                          >
                            <Input placeholder="Ví dụ: 1 viên/ngày" />
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

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'time']}
                            label="Thời gian uống thuốc (có thể chọn nhiều)"
                            rules={[{ required: true, message: 'Chọn ít nhất một thời gian uống' }]}
                          >
                            <Checkbox.Group options={timeOptions} />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'dateRange']}
                            label="Thời gian sử dụng"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu và kết thúc' }]}
                          >
                            <RangePicker
                              style={{ width: '100%' }}
                              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                              format="DD/MM/YYYY"
                              disabledDate={(current) => {
                                // Không cho chọn ngày trong quá khứ
                                return current && current < dayjs().startOf('day');
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        {...restField}
                        name={[name, 'note']}
                        label="Ghi chú"
                        rules={[
                          {
                            pattern: /^[a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ\s]*$/,
                            message: 'Ghi chú không được bắt đầu bằng khoảng trắng hoặc chứa ký tự đặc biệt'
                          }
                        ]}
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
              label="Ảnh thuốc (chỉ nhận PNG)"
              valuePropName="fileList"
              getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
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