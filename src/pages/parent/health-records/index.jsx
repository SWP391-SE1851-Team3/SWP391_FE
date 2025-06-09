import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Row, Col, Button, Select, message, InputNumber, Modal, Table
} from 'antd';
import { getStudentHealthProfiles, getStudentHealthProfileByStudentId, createStudentHealthProfile, updateStudentHealthProfile } from "../../../api/studentHealthProfiles";
import './health-record.css';
const { TextArea } = Input;
const { Option } = Select;


const StudentHealthRecord = () => {
    const [form] = Form.useForm();
    const [selectedStudentId, setSelectedStudentId] = useState();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);
    const parentId = localStorage.getItem('parentId');

    // Lấy danh sách phụ huynh lên coi có bao nhiêu hoc sinh 
    useEffect(() => {
        if (!parentId) {
            message.error('Vui lòng đăng nhập!');
            return;
        }
        setLoading(true);
        getStudentHealthProfiles(parentId)
            .then(res => {
                setStudents(res.data);
            })
            .catch(() => message.error('Không tải được danh sách học sinh'))
            .finally(() => setLoading(false));
    }, [parentId]);

    // sau khi chọn học sinh → load tên học sinh
    // và kiểm tra xem học sinh đó đã có hồ sơ sức khỏe chưa
    useEffect(() => {
        if (!selectedStudentId || students.length === 0) return;
        const selectedStudent = students.find(
            (s) => Number(s.studentID) === Number(selectedStudentId)
        );
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
    }, [selectedStudentId, students]);

    // Save health profile
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
            message.error('Lỗi khi lưu, Học sinh có thể có hồ sơ sức khỏe rồi.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        setLoading(true);
        try {
            await updateStudentHealthProfile({
                studentId: selectedStudentId,
                ...values
            });
            setHasProfile(true);
            message.success('Cập nhật hồ sơ sức khỏe thành công.');
        } catch (error) {
            message.error('Lỗi khi cập nhật hồ sơ sức khỏe.');
        } finally {
            setLoading(false);
        }
    };
    //Hàm onSubmit dùng chung cho Form
    const onSubmit = (values) => {
        if (hasProfile === true) {
            handleUpdate(values);
        } else {
            handleSave(values);
        }
    };
    return (
        <Card
            title={
                <span className="health-record-title">
                    {selectedStudentId
                        ? `Hồ sơ sức khỏe của ${students.find(s => s.studentID === selectedStudentId)?.fullName || 'Không rõ'}`
                        : 'Chọn học sinh để nhập hồ sơ sức khỏe'}
                </span>
            }
            className="health-record-container"
        >
            <Select
                value={selectedStudentId ?? undefined}
                placeholder="Chọn học sinh"
                style={{ width: '20%', marginBottom: 16 }}
                onChange={(value) => {
                    form.resetFields(); // reset trước
                    setTimeout(() => {
                        setSelectedStudentId(value); // đổi ID sau
                    }, 0);
                }}
                showSearch
                optionFilterProp="children"
            >
                {students
                    .filter((s) => s.studentID != null)
                    .map((s) => ( // mảng học sinh
                        <Option key={s.studentID} value={s.studentID}>
                            {s.fullName}
                        </Option>
                    ))}
            </Select>

            {selectedStudentId && (
                <Form form={form} layout="vertical" onFinish={onSubmit}>
                    <Form.Item label="Họ tên học sinh" name="fullName"
                        rules={hasProfile == false ? [{ required: true, message: 'Vui lòng nhập họ tên học sinh!' }] : []}
                    >
                        <Input disabled={hasProfile} />
                    </Form.Item>

                    <Form.Item
                        label="Dị ứng"
                        name="allergyDetails"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin dị ứng!' }]}
                    >
                        <Input placeholder="Ví dụ: Dị ứng đậu phộng" />
                    </Form.Item>

                    <Form.Item label="Tiền sử điều trị" name="treatmentHistory">
                        <TextArea rows={3} placeholder="Ví dụ: Từng điều trị viêm phổi năm 2023" />
                    </Form.Item>

                    <Form.Item label="Thị lực">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="visionLeft"
                                    label="Trái"
                                    rules={[{ required: true, message: 'Nhập thị lực mắt trái' }]}
                                >
                                    <Input placeholder="Ví dụ: 6/10" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="visionRight"
                                    label="Phải"
                                    rules={[{ required: true, message: 'Nhập thị lực mắt phải' }]}
                                >
                                    <Input placeholder="Ví dụ: 7/10" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>

                    <Form.Item label="Thính lực" name="hearingScore">
                        <Select placeholder="Chọn mức độ">
                            <Option value="normal">Bình thường</Option>
                            <Option value="mild">Giảm nhẹ</Option>
                            <Option value="moderate">Giảm vừa</Option>
                            <Option value="severe">Giảm nặng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Thông tin tiêm chủng" name="vaccines">
                        <TextArea rows={3} placeholder="Ví dụ: Đã tiêm vaccine sởi 2024" />
                    </Form.Item>

                    <Form.Item label="Chiều cao (cm)" name="height">
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Cân nặng (kg)" name="weight">
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Bệnh mãn tính" name="chronicDiseases">
                        <Input placeholder="Ví dụ: Hen suyễn" />
                    </Form.Item>

                    <Form.Item label="Ghi chú từ phụ huynh" name="noteOfParent">
                        <TextArea rows={2} placeholder="Ví dụ: Cần theo dõi thêm về hô hấp" />
                    </Form.Item>

                    <div className="health-record-actions">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            )}
        </Card>
    );
};
export default StudentHealthRecord;