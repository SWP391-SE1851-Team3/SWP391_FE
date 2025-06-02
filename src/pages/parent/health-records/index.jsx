import React from 'react';
import { Card, Form, Input, Row, Col, Button, Select } from 'antd';
import { QuestionCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import './health-record.css';

const { TextArea } = Input;
const { Option } = Select;

const StudentHealthRecord = () => {
    const [form] = Form.useForm();

    return (
        <Card
            title={<span className="health-record-title">Hồ sơ sức khỏe của Nguyễn Văn A</span>}
            className="health-record-container"
        >
            <Form form={form} layout="vertical" className="health-record-form">
                <Form.Item
                    label={<span className="required-field">Dị ứng</span>}
                    name="allergies"
                >
                    <div className="health-record-input-group">
                        <Input
                            placeholder="Ví dụ: Dị ứng đậu phộng"
                        />
                        <QuestionCircleOutlined className="health-record-help-icon" />
                    </div>
                </Form.Item>

                <Form.Item
                    label="Tiền sử điều trị"
                    name="medicalHistory"
                >
                    <div className="health-record-input-group">
                        <TextArea
                            rows={3}
                            placeholder="Ví dụ: Từng điều trị viêm phổi năm 2023"
                            className="health-record-textarea"
                        />
                        <QuestionCircleOutlined className="health-record-help-icon" style={{ alignSelf: 'flex-start', marginTop: '8px' }} />
                    </div>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Thị lực" className="vision-section">
                            <div>
                                <div className="vision-eye-group">
                                    <span className="vision-eye-label">Trái</span>
                                    <div className="health-record-input-group">
                                        <Input placeholder="Ví dụ: 8/10" />
                                        <QuestionCircleOutlined className="health-record-help-icon" />
                                    </div>
                                </div>
                                <div className="vision-eye-group">
                                    <span className="vision-eye-label">Phải</span>
                                    <div className="health-record-input-group">
                                        <Input placeholder="Ví dụ: 8/10" />
                                        <QuestionCircleOutlined className="health-record-help-icon" />
                                    </div>
                                </div>
                            </div>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Thính lực" name="hearing">
                            <Select placeholder="Bình thường" className="w-full">
                                <Option value="normal">Bình thường</Option>
                                <Option value="mild">Giảm nhẹ</Option>
                                <Option value="moderate">Giảm vừa</Option>
                                <Option value="severe">Giảm nặng</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Thông tin tiêm chủng"
                    name="vaccination"
                >
                    <div className="health-record-input-group">
                        <TextArea
                            rows={3}
                            placeholder="Ví dụ: Đã tiêm vaccine sởi 2024"
                            className="health-record-textarea"
                        />
                        <QuestionCircleOutlined className="health-record-help-icon" style={{ alignSelf: 'flex-start', marginTop: '8px' }} />
                    </div>
                </Form.Item>

                <div className="health-record-actions">
                    <div className="health-record-buttons">
                        <Button type="default" className="health-record-draft-btn">
                            Lưu nháp
                        </Button>
                        <Button type="primary" className="health-record-save-btn">
                            Lưu
                        </Button>
                    </div>
                    <Button
                        type="link"
                        icon={<HistoryOutlined />}
                        className="health-record-history-btn"
                    >
                        Xem lịch sử hồ sơ
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default StudentHealthRecord;
