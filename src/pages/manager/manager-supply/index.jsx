import React, { useEffect, useState, useRef } from "react";
import {
    Table,
    Form,
    Input,
    Button,
    Row,
    Col,
    message,
    Tag,
    Popconfirm,
    Select,
} from "antd";
import {
    getAllMedicalSupplies,
    createMedicalSupply,
    updateMedicalSupply,
    deleteMedicalSupply,
    searchMedicalSuppliesByName,
    searchMedicalSuppliesByCategoryId,
} from "../../../api/manager_supply";
import "./managerSupply.css";

const { Option } = Select;

const categoryOptions = [
    { value: "1", label: "Thuốc Kháng Sinh" },
    { value: "2", label: "Dụng Cụ Y Tế" },
];

const initialForm = {
    supplyName: "",
    categoryId: "",
    unit: "",
    quantityAvailable: "",
    reorderLevel: "",
    storageTemperature: "",
};

const SupplyManagement = () => {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [editingSupply, setEditingSupply] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);

    const reloadSupplies = async () => {
        setLoading(true);
        try {
            const res = await getAllMedicalSupplies();
            setSupplies(res || []);
        } catch {
            setSupplies([]);
            message.error("Không thể tải danh sách vật tư!");
        }
        setLoading(false);
    };

    useEffect(() => {
        reloadSupplies();
    }, []);

    const handleSearch = async (value) => {
        setLoading(true);
        try {
            if (!value.trim()) {
                reloadSupplies();
                setLoading(false);
                return;
            }
            const data = await searchMedicalSuppliesByName(value);
            setSupplies(data || []);
        } catch {
            setSupplies([]);
            message.error("Tìm kiếm thất bại!");
        }
        setLoading(false);
    };

    const handleCategoryChange = async (value) => {
        setSelectedCategory(value);
        setLoading(true);
        try {
            if (!value) {
                reloadSupplies();
                setLoading(false);
                return;
            }
            const data = await searchMedicalSuppliesByCategoryId(value);
            setSupplies(data || []);
        } catch {
            setSupplies([]);
            message.error("Không thể lọc theo danh mục!");
        }
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditingSupply(record);

        form.setFieldsValue({
            supplyName: record.supplyName,
            categoryId: String(record.categoryID || record.categoryId),
            unit: record.unit,
            quantityAvailable: record.quantityAvailable,
            reorderLevel: record.reorderLevel,
            storageTemperature: record.storageTemperature,
        });
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    const handleDelete = async (supplyId) => {
        try {
            await deleteMedicalSupply(supplyId);
            message.success("Xóa thành công!");
            reloadSupplies();
        } catch {
            message.error("Xóa thất bại!");
        }
    };

    const handleFinish = async (values) => {
        const now = new Date().toISOString();
        const payload = {
            supplyName: values.supplyName,
            categoryID: Number(values.categoryId),
            unit: values.unit,
            quantityAvailable: values.quantityAvailable || 0,
            reorderLevel: values.reorderLevel || 0,
            storageTemperature: values.storageTemperature,
            dateAdded: now,
        };

        try {
            if (editingSupply) {
                await updateMedicalSupply(editingSupply.supplyId, payload);
                message.success("Cập nhật thành công!");
            } else {
                await createMedicalSupply(payload);
                message.success("Thêm mới thành công!");
            }
            reloadSupplies();
            setEditingSupply(null);
            form.resetFields();
        } catch {
            message.error(editingSupply ? "Cập nhật thất bại!" : "Thêm mới thất bại!");
        }
    };

    const columns = [
        { title: "Tên vật tư", dataIndex: "supplyName" },
        {
            title: "Danh mục",
            dataIndex: "categoryName",
            render: (_, record) => {
                if (record.categoryName) return record.categoryName;
                if (record.categoryId === 1) return "Thuốc Kháng Sinh";
                if (record.categoryId === 2) return "Dụng Cụ Y Tế";
                return "";
            },
        },
        { title: "Đơn vị", dataIndex: "unit" },
        { title: "Số lượng", dataIndex: "quantityAvailable" },
        { title: "Mức cảnh báo", dataIndex: "reorderLevel" },
        { title: "Nhiệt độ bảo quản", dataIndex: "storageTemperature" },
        {
            title: "Trạng thái",
            dataIndex: "isBelowReorderLevel",
            render: (isBelowReorderLevel) =>
                isBelowReorderLevel ? (
                    <Tag color="error">Cần Bổ Sung</Tag>
                ) : (
                    <Tag color="success">Bình thường</Tag>
                ),
            width: 130,
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Button
                        type="primary"
                        size="middle"
                        onClick={() => handleEdit(record)}
                        style={{
                            background: "#1890ff",
                            borderColor: "#1890ff",
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.supplyId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        size="middle"
                    >
                        <Button danger size="middle">Xóa</Button>
                    </Popconfirm>
                </div>
            ),
            width: 110,
        },
    ];

    return (
        <div className="supply-management-container">
            <h2 className="supply-management-header">Quản Lý Vật Tư Y Tế</h2>
            <div className="supply-search-bar">
                <Select
                    allowClear
                    placeholder="Chọn danh mục"
                    style={{ width: 200, marginRight: 12 }}
                    value={selectedCategory || undefined}
                    onChange={handleCategoryChange}
                >
                    <Option value="">Tất cả</Option>
                    {categoryOptions.map((cat) => (
                        <Option key={cat.value} value={cat.value}>
                            {cat.label}
                        </Option>
                    ))}
                </Select>

                <Input
                    placeholder="Tìm kiếm theo tên vật tư"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 200, marginRight: 8 }}
                    onPressEnter={() => handleSearch(search)}
                />
                <Button type="primary" onClick={() => handleSearch(search)}>
                    Tìm kiếm
                </Button>

                <Button
                    type="default"
                    onClick={() => {
                        setSearch("");
                        setSelectedCategory("");
                        reloadSupplies();
                    }}
                    style={{ marginLeft: 12 }}
                >
                    Làm mới
                </Button>
            </div>

            <Table
                dataSource={supplies}
                columns={columns}
                rowKey={(r) => r.supplyId}
                loading={loading}
                pagination={false}
                style={{ marginTop: 20 }}
                rowClassName={(record) =>
                    record.isBelowReorderLevel ? "below-reorder-row" : ""
                }
            />

            <div ref={formRef} className="supply-management-form-card">
                <h3 className="form-header">
                    {editingSupply ? "Cập nhật vật tư" : "Thêm vật tư mới"}
                </h3>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={initialForm}
                >
                    <Row gutter={50}>
                        <Col xs={24} md={10}>
                            <Form.Item
                                label="Tên vật tư"
                                name="supplyName"
                                rules={[{ required: true, message: "Nhập tên vật tư!" }]}
                            >
                                <Input placeholder="Tên vật tư" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Danh mục"
                                name="categoryName"
                                rules={[{ required: true, message: "Chọn danh mục!" }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categoryOptions.map((cat) => (
                                        <Option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={10}>
                            <Form.Item
                                label="Đơn vị"
                                name="unit"
                                rules={[{ required: true, message: "Nhập đơn vị!" }]}
                            >
                                <Input placeholder="Đơn vị" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Số lượng"
                                name="quantityAvailable"
                                rules={[{ required: true, message: "Nhập số lượng!" }]}
                            >
                                <Input type="number" placeholder="Số lượng" min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={10}>
                            <Form.Item
                                label="Mức cảnh báo"
                                name="reorderLevel"
                                rules={[{ required: true, message: "Nhập mức cảnh báo!" }]}
                            >
                                <Input type="number" placeholder="Mức cảnh báo" min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nhiệt độ bảo quản"
                                name="storageTemperature"
                                rules={[{ required: true, message: "Nhập nhiệt độ bảo quản!" }]}
                            >
                                <Input placeholder="Ví dụ: 2-8°C, nhiệt độ phòng..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingSupply ? "Cập nhật" : "Thêm mới"}
                        </Button>
                        {editingSupply && (
                            <Button
                                style={{
                                    marginLeft: 12,
                                    background: "#52c41a",
                                    color: "#fff",
                                    border: "none",
                                }}
                                onClick={() => {
                                    setEditingSupply(null);
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

export default SupplyManagement;
