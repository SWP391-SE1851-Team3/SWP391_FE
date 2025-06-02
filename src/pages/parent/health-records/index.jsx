import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Row, Col, Button, Select, message, InputNumber
} from 'antd';
import { QuestionCircleOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import './health-record.css';

const { TextArea } = Input;
const { Option } = Select;

// Giả lập danh sách học sinh và dữ liệu hồ sơ
const mockStudents = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Nguyễn Thị B' }
];

const mockHealthRecords = {
    1: {
        allergies: 'Dị ứng hải sản',
        medicalHistory: 'Viêm phổi năm 2022',
        visionLeft: 7.5,
        visionRight: 8.0,
        hearing: 'normal',
        vaccination: 'Đã tiêm vaccine sởi 2023'
    }
};

const StudentHealthRecord = () => {
    const [form] = Form.useForm();
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState(mockStudents);

    useEffect(() => {
        if (selectedStudentId && !isNew) {
            const record = mockHealthRecords[selectedStudentId];
            if (record) {
                form.setFieldsValue(record);
            } else {
                form.resetFields();
            }
        }
    }, [selectedStudentId, isNew]);

    const handleSave = async (values) => {
        setLoading(true);
        console.log('Dữ liệu lưu:', values, 'Cho học sinh:', selectedStudentId);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            message.success(isNew ? 'Lưu mới thành công!' : 'Cập nhật thành công!');
        } catch {
            message.error('Lỗi khi lưu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewStudent = () => {
        form.resetFields();
        setSelectedStudentId(null);
        setIsNew(true);
    };

    const renderForm = () => (
        <Card
            title={<span className="health-record-title">
                {selectedStudentId ? `Hồ sơ sức khỏe của ${students.find(s => s.id === selectedStudentId)?.name}` : 'Hồ sơ sức khỏe học sinh mới'}
            </span>}
            className="health-record-container"
        >
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item
                    label={<span className="required-field">Dị ứng</span>}
                    name="allergies"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin dị ứng!' }]}
                >
                    <div className="health-record-input-group">
                        <Input placeholder="Ví dụ: Dị ứng đậu phộng" />
                        <QuestionCircleOutlined className="health-record-help-icon" />
                    </div>
                </Form.Item>

                <Form.Item label="Tiền sử điều trị" name="medicalHistory">
                    <div className="health-record-input-group">
                        <TextArea rows={3} placeholder="Ví dụ: Từng điều trị viêm phổi năm 2023" />
                        <QuestionCircleOutlined className="health-record-help-icon" style={{ alignSelf: 'flex-start', marginTop: '8px' }} />
                    </div>
                </Form.Item>

                <Form.Item label="Thị lực">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="visionLeft"
                                label="Trái"
                                rules={[{ required: true, message: 'Nhập số cho mắt trái' }]}
                            >
                                <div className="health-record-input-group">
                                    <InputNumber min={0} max={10} step={0.1} placeholder="Ví dụ: 8.0" style={{ width: '100%' }} />
                                    <QuestionCircleOutlined className="health-record-help-icon" />
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="visionRight"
                                label="Phải"
                                rules={[{ required: true, message: 'Nhập số cho mắt phải' }]}
                            >
                                <div className="health-record-input-group">
                                    <InputNumber min={0} max={10} step={0.1} placeholder="Ví dụ: 8.5" style={{ width: '100%' }} />
                                    <QuestionCircleOutlined className="health-record-help-icon" />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item label="Thính lực" name="hearing">
                    <Select placeholder="Bình thường">
                        <Option value="normal">Bình thường</Option>
                        <Option value="mild">Giảm nhẹ</Option>
                        <Option value="moderate">Giảm vừa</Option>
                        <Option value="severe">Giảm nặng</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Thông tin tiêm chủng" name="vaccination">
                    <div className="health-record-input-group">
                        <TextArea rows={3} placeholder="Ví dụ: Đã tiêm vaccine sởi 2024" />
                        <QuestionCircleOutlined className="health-record-help-icon" style={{ alignSelf: 'flex-start', marginTop: '8px' }} />
                    </div>
                </Form.Item>

                <div className="health-record-actions">
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {isNew ? 'Lưu' : 'Cập nhật'}
                    </Button>
                    <Button type="link" icon={<HistoryOutlined />}>Xem lịch sử hồ sơ</Button>
                </div>
            </Form>
        </Card>
    );

    return (
        <>
            <Card title="Chọn học sinh để khai báo" style={{ marginBottom: '16px' }}>
                <Row gutter={16}>
                    <Col flex="auto">
                        <Select
                            value={selectedStudentId}
                            placeholder="Chọn học sinh"
                            onChange={(value) => {
                                setSelectedStudentId(value);
                                setIsNew(false);
                            }}
                            style={{ width: '100%' }}
                        >
                            {students.map((student) => (
                                <Option key={student.id} value={student.id}>
                                    {student.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    {/* <Col>
                        <Button icon={<PlusOutlined />} onClick={handleAddNewStudent} type="primary">
                            Thêm học sinh mới
                        </Button>
                    </Col> */}
                </Row>
            </Card>

            {(selectedStudentId || isNew) && renderForm()}
        </>
    );
};

export default StudentHealthRecord;
