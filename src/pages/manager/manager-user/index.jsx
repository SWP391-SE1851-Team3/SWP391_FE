import React, { useEffect, useState } from "react";
import {
    Table,
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    Popconfirm,
    message,
} from "antd";
import {
    fetchUsersByRole,
    createUser,
    updateUser,
    deleteUser,
} from "../../../api/manager_user";
import "./managerUser.css";

const { Option } = Select;

const initialForm = {
    userName: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roleId, setRoleId] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const reloadUsers = async () => {
        setLoading(true);
        try {
            const res = await fetchUsersByRole(roleId);
            const mapped = (res || []).map((u) => ({
                ...u,
                userName: u.userName || u.username || "",
            }));
            setUsers(mapped);
        } catch {
            setUsers([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        reloadUsers();
    }, [roleId]);

    const handleRoleChange = (value) => {
        setRoleId(value);
        setEditingUser(null);
        form.resetFields();
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            userName: record.userName || "",
            password: "", // Cho phép nhập mật khẩu mới nếu cần
            fullName: record.fullName || "",
            email: record.email || "",
            phone: record.phone || "",
        });
    };

    const handleDelete = async (record) => {
        try {
            await deleteUser(record.id, roleId);
            message.success("Xóa thành công!");
            reloadUsers();
            setEditingUser(null);
            form.resetFields();
        } catch {
            message.error("Xóa thất bại!");
        }
    };

    const handleFinish = async (values) => {
        if (editingUser) {
            try {
                await updateUser(editingUser.id, roleId, values);
                message.success("Cập nhật thành công!");
                reloadUsers();
                setEditingUser(null);
                form.resetFields();
            } catch {
                message.error("Cập nhật thất bại!");
            }
        } else {
            try {
                await createUser({ ...values, roleId });
                message.success("Thêm mới thành công!");
                reloadUsers();
                form.resetFields();
            } catch {
                message.error("Thêm mới thất bại!");
            }
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", width: 60 },
        { title: "Tên đăng nhập", dataIndex: "userName" },
        { title: "Mật khẩu", dataIndex: "password" },   // 👈 Thêm lại biến password!
        { title: "Họ tên", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "SĐT", dataIndex: "phone" },
        {
            title: "Hành động",
            render: (_, record) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleEdit(record)}
                        style={{
                            background: "#1890ff",
                            borderColor: "#1890ff",
                        }}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title={`Xác nhận xóa "${record.userName}"?`}
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button
                            size="small"
                            danger
                            style={{
                                background: "#ff4d4f",
                                borderColor: "#ff4d4f",
                                color: "#fff",
                            }}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: 120,
        },

    ];

    return (
        <div className="user-management-container">
            <h2 className="user-management-header">Quản lý người dùng theo vai trò</h2>

            <div className="role-select">
                <span>Chọn vai trò: </span>
                <Select
                    value={roleId}
                    style={{ width: 200 }}
                    onChange={handleRoleChange}
                >
                    <Option value={1}>Phụ Huynh</Option>
                    <Option value={2}>Y Tá</Option>
                    <Option value={3}>Quản Lý</Option>
                </Select>
            </div>

            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                style={{ marginTop: 20 }}
            />

            <div className="user-management-form-card">
                <h3 className="form-header">
                    {editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
                </h3>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={initialForm}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tên đăng nhập"
                                name="userName"
                                rules={[{ required: true, message: "Nhập tên đăng nhập!" }]}
                            >
                                <Input placeholder="Tên đăng nhập" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={
                                    editingUser
                                        ? []
                                        : [{ required: true, message: "Nhập mật khẩu!" }]
                                }
                            >
                                <Input.Password placeholder="Mật khẩu" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Họ tên" name="fullName">
                                <Input placeholder="Họ tên" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Số điện thoại" name="phone">
                                <Input placeholder="Số điện thoại" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={24}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Nhập email!" },
                                    { type: "email", message: "Email không hợp lệ!" },
                                ]}
                            >
                                <Input placeholder="Email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingUser ? "Cập nhật" : "Thêm mới"}
                        </Button>
                        {editingUser && (
                            <Button
                                style={{
                                    marginLeft: 12,
                                    background: "#52c41a",
                                    color: "#fff",
                                    border: "none",
                                }}
                                onClick={() => {
                                    setEditingUser(null);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default UserManagement;
