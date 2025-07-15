import React, { useEffect, useState, useRef } from "react";
import {
    Table,
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    message,
    Switch,
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

const roleOptions = [
    { value: 1, label: "Phụ Huynh" },
    { value: 2, label: "Y Tá" },
    { value: 3, label: "Quản Lý" },
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roleId, setRoleId] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);

    const reloadUsers = async (role = roleId) => {
        setLoading(true);
        try {
            const res = await fetchUsersByRole(role);
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
            userName: record.userName,
            password: record.password, 
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
        });
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    // Xử lý khi nhấn Switch trạng thái hoạt động
    const handleActiveChange = async (checked, record) => {
        try {
            await deleteUser(record.id, roleId); // API này sẽ toggle trạng thái
            message.success(
                checked ? "Đã kích hoạt tài khoản!" : "Đã vô hiệu hóa tài khoản!"
            );
            reloadUsers();
        } catch {
            message.error("Thay đổi trạng thái thất bại!");
        }
    };

    const handleFinish = async (values) => {
        if (editingUser) {
            try {
                await updateUser(editingUser.id, roleId, values);
                message.success("Cập nhật thành công!");
                reloadUsers(roleId);
                setEditingUser(null);
                form.resetFields();
            } catch {
                message.error("Cập nhật thất bại!");
            }
        } else {
            try {
                await createUser({ ...values, roleId });
                message.success("Thêm mới thành công!");
                reloadUsers(roleId);
                form.resetFields();
            } catch {
                message.error("Thêm mới thất bại!");
            }
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", width: 60 },
        { title: "Tên đăng nhập", dataIndex: "userName" },
        { title: "Mật khẩu", dataIndex: "password" },
        { title: "Họ tên", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "SĐT", dataIndex: "phone" },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (isActive, record) => (
                <Switch
                    checked={isActive === 1 || isActive === true || isActive === "1"}
                    onChange={checked => handleActiveChange(checked, record)}
                />
            ),
            width: 100,
        },
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
                </div>
            ),
            width: 90,
        },
    ];

    return (
        <div className="user-management-container">
            <h2 className="user-management-header">Quản Lý Người Dùng Theo Vai Trò</h2>

            <div className="role-select">
                <span>Chọn vai trò: </span>
                <Select
                    value={roleId}
                    style={{ width: 200 }}
                    onChange={handleRoleChange}
                >
                    {roleOptions.map(r => (
                        <Option key={r.value} value={r.value}>{r.label}</Option>
                    ))}
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

            <div ref={formRef} className="user-management-form-card">
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
                                        ? [] // Không required khi sửa
                                        : [{ required: true, message: "Nhập mật khẩu!" }]
                                }
                            >
                                <Input placeholder="Mật khẩu" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Họ tên"
                                name="fullName"
                                rules={[{ required: !editingUser, message: "Nhập họ tên!" }]}
                            >
                                <Input placeholder="Họ tên" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[{ required: !editingUser, message: "Nhập số điện thoại!" }]}
                            >
                                <Input placeholder="Số điện thoại" />
                            </Form.Item>
                        </Col>
                        {!editingUser && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Vai trò"
                                    name="roleId"
                                    initialValue={roleId}
                                    rules={[{ required: true, message: "Chọn vai trò!" }]}
                                >
                                    <Select>
                                        {roleOptions.map(r => (
                                            <Option key={r.value} value={r.value}>{r.label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        )}
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: !editingUser, message: "Nhập email!" },
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