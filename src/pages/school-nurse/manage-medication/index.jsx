import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Timeline,
  Row,
  Col,
  Pagination,
  Avatar,
  Modal,
  Form,
  message
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ClockCircleTwoTone
} from '@ant-design/icons';
import { getMedicationSubmissions, updateMedicationStatus, getMedicationSubmissionDetails } from '../../../api/medicalSubmissionNurse';
import './Medication.css';

const { Title } = Typography;
const { Option } = Select;

const MedicationManagement = () => {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [rejectingId, setRejectingId] = useState(null);
  const [timelineRejectModalVisible, setTimelineRejectModalVisible] = useState(false);
  const [timelineRejectForm] = Form.useForm();
  const [timelineRejectingId, setTimelineRejectingId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timelineData, setTimelineData] = useState([
    {
      time: '12:00 PM',
      student: 'Nguyễn Văn A',
      medication: 'Paracetamol - 1 viên sau bữa trua',
      status: 'pending',
      color: 'orange',
      id: 1
    },
    {
      time: '09:00 AM',
      student: 'Trần Văn C',
      medication: 'Thuốc nhỏ mắt - 1 giọt mỗi mắt sau bữa sáng',
      status: 'pending',
      color: 'orange',
      id: 3
    },
    {
      time: '15:00 PM',
      student: 'Nguyễn Thị B',
      medication: 'Vitamin C - 1 viên sau bữa chiều',
      status: 'pending',
      color: 'orange',
      id: 2
    },
    {
      time: '16:00 PM',
      student: 'Phạm Văn D',
      medication: 'Kháng sinh - 1 viên sau bữa tối',
      status: 'pending',
      color: 'orange',
      id: 5
    }
  ]);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMedicationSubmissions();
  }, []);

  const mapStatusToFE = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'confirmed';
      case 'REJECTED':
        return 'expired';
      case 'ADMINISTERED':
        return 'completed';
      case 'PENDING':
        return 'pending';
      default:
        return status?.toLowerCase?.() || status;
    }
  };

  const mapStatusToBE = (status) => {
    switch (status) {
      case 'confirmed':
        return 'APPROVED';
      case 'expired':
        return 'REJECTED';
      case 'completed':
        return 'ADMINISTERED';
      case 'pending':
        return 'PENDING';
      default:
        return status?.toUpperCase?.() || status;
    }
  };

  const fetchMedicationSubmissions = async () => {
    try {
      setLoading(true);
      const submissions = await getMedicationSubmissions();
      const formattedData = submissions.map((submission, index) => ({
        key: index.toString(),
        id: index + 1,
        student: submission.studentName,
        medication: submission.medicationDetails.map(m => m.medicineName).join(', '),
        status: mapStatusToFE(submission.status),
        time: new Date(submission.submissionDate).toLocaleString('vi-VN'),
        actions: mapStatusToFE(submission.status) === 'pending' ? ['view', 'confirm', 'cancel'] : ['view'],
        rejectReason: '',
        medicationDetails: submission.medicationDetails
      }));
      setData(formattedData);
    } catch (error) {
      message.error('Failed to fetch medication submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data for the table
  const getFilteredData = () => {
    let filtered = data;

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.student.toLowerCase().includes(searchText.toLowerCase()) ||
          item.medication.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (classFilter) {
      filtered = filtered.filter((item) => item.student.includes(classFilter));
    }

    return filtered;
  };

  const displayedData = getFilteredData();

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case 'confirmed':
        return <Tag color="green">Đã xác nhận</Tag>;
      case 'expired':
        return <Tag color="red">Đã từ chối</Tag>;
      case 'completed':
        return <Tag color="blue">Đã phát thuốc</Tag>;
      case 'uncompleted':
        return <Tag color="volcano">Chưa phát thuốc</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getActionButtons = (record) => {
    return (
      <Space>
        <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
        {record.actions.includes('confirm') && (
          <Button
            icon={<CheckOutlined  />}
            size="small"
            type="primary"
            onClick={() => handleUpdateStatus(record.id, 'confirmed')}
          />
        )}
        {record.actions.includes('cancel') && (
          <Button
            icon={<CloseOutlined />}
            size="small"
            danger
            onClick={() => handleUpdateStatus(record.id, 'expired')}
          />
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      width: '25%'
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medication',
      key: 'medication',
      width: '20%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'time',
      key: 'time',
      width: '20%'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'confirmed')}
              >
                Xác nhận
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'expired')}
              >
                Từ chối
              </Button>
            </>
          )}
          {(record.status === 'confirmed' || record.status === 'expired') && (
            <Button
              size="small"
              icon={<ClockCircleTwoTone twoToneColor="#faad14" />}
              onClick={() => handleUpdateStatus(record.id, 'pending')}
            >
              Chuyển về chờ xử lý
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleUpdateStatus = async (id, newStatus) => {
    const statusTextMap = {
      'confirmed': 'xác nhận hoàn thành',
      'expired': 'từ chối phiếu',
      'completed': 'xác nhận đã phát thuốc',
      'uncompleted': 'chuyển sang chưa hoàn thành',
      'pending': 'chuyển về chờ xử lý'
    };

    if (newStatus === 'expired') {
      setRejectingId(id);
      setRejectModalVisible(true);
      return;
    }

    if (newStatus === 'uncompleted') {
      setTimelineRejectingId(id);
      setTimelineRejectModalVisible(true);
      return;
    }

    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${statusTextMap[newStatus] || 'thay đổi trạng thái'}?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateMedicationStatus(id, mapStatusToBE(newStatus));
          message.success('Cập nhật trạng thái thành công');
          fetchMedicationSubmissions();
        } catch (error) {
          message.error('Cập nhật trạng thái thất bại');
          console.error('Error updating status:', error);
        }
      }
    });
  };

  const handleReject = () => {
    rejectForm.validateFields().then(async values => {
      try {
        await updateMedicationStatus(rejectingId, mapStatusToBE('expired'), values.reason);
        message.success('Đã từ chối phiếu thành công');
        fetchMedicationSubmissions();
      } catch (error) {
        message.error('Từ chối phiếu thất bại');
      }
      setRejectModalVisible(false);
      rejectForm.resetFields();
    });
  };

  const handleTimelineReject = () => {
    timelineRejectForm.validateFields().then(values => {
      setTimelineData(prev =>
        prev.map(item => 
          item.id === timelineRejectingId 
            ? { ...item, status: 'uncompleted', rejectReason: values.reason } 
            : item
        )
      );
      setTimelineRejectModalVisible(false);
      timelineRejectForm.resetFields();
    });
  };

  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    setDetailData(null);
    if (record && record.id) {
      setDetailLoading(true);
      try {
        const details = await getMedicationSubmissionDetails(record.id);
        setDetailData(details);
      } catch (error) {
        message.error('Không lấy được chi tiết phiếu gửi thuốc');
      } finally {
        setDetailLoading(false);
      }
    }
  };

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Phiếu Gửi Thuốc</Title>
      </div>

      <Card
        className="main-card"
        title="Danh sách phiếu gửi thuốc"
      >
        <div className="filters-section filter-section">
          <Row gutter={16} justify="center" align="middle" wrap={false}>
            <Col>
              <Input
                placeholder="Tìm kiếm phiếu gửi thuốc..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                style={{ minWidth: 220 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả loại ..."
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả loại</Option>
                <Option value="pending">Chờ xác nhận</Option>
                <Option value="confirmed">Đã xác nhận</Option>
                <Option value="expired">Đã từ chối</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả trạng thái..."
                value={classFilter}
                onChange={setClassFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="1A">Lớp 1A</Option>
                <Option value="1B">Lớp 1B</Option>
                <Option value="2A">Lớp 2A</Option>
                <Option value="2B">Lớp 2B</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={displayedData}
          pagination={false}
          className="events-table"
          loading={loading}
        />

        <div className="pagination-section">
          <Pagination
            current={currentPage1}
            total={displayedData.length}
            pageSize={10}
            onChange={(page) => setCurrentPage1(page)}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Lịch phát thuốc hôm nay */}
      <Card className="supplies-card" title={null} style={{ marginBottom: 24 }}>
        <div className="header-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="header-title">Lịch phát thuốc hôm nay</div>
              <Space className="header-subtitle">
                <CalendarOutlined />
                <span>{today}</span>
              </Space>
            </div>
            
          </div>
        </div>
        <Timeline className="medication-timeline">
          {timelineData.map((item, idx) => {
            let cardClass = 'timeline-card ';
            if (item.status === 'completed') cardClass += 'completed';
            else if (item.status === 'uncompleted') cardClass += 'uncompleted';
            else cardClass += 'pending';

            let statusText = '';
            if (item.status === 'completed') statusText = 'Đã hoàn thành';
            else if (item.status === 'uncompleted') statusText = 'Chưa hoàn thành';
            else statusText = 'Chờ xử lý';

            return (
              <Timeline.Item key={idx} dot={
                <span className="timeline-time-badge">{item.time}</span>
              } color="transparent">
                <div className={cardClass}>
                  <div className="timeline-header">
                    <span className="timeline-student">Phát thuốc cho {item.student}</span>
                    <span className="timeline-status">
                      {item.status === 'completed' && <CheckCircleTwoTone twoToneColor="#52c41a" style={{marginRight: 4}} />}
                      {item.status === 'uncompleted' && <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{marginRight: 4}} />}
                      {item.status === 'pending' && <ClockCircleTwoTone twoToneColor="#faad14" style={{marginRight: 4}} />}
                      {statusText}
                    </span>
                    <div className="timeline-actions">
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                          />
                          <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleUpdateStatus(item.id, 'uncompleted')}
                          />
                        </>
                      )}
                      {(item.status === 'completed' || item.status === 'uncompleted') && (
                        <>
                          <Button
                            size="small"
                            icon={<ClockCircleTwoTone twoToneColor="#faad14" />}
                            onClick={() => handleUpdateStatus(item.id, 'pending')}
                          />
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(item)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-medication">{item.medication}</div>
                  </div>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>

      <Modal
        title="Chi tiết phiếu gửi thuốc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedRecord && (
          <div>
            <p><strong>Học sinh:</strong> {selectedRecord.student}</p>
            <p><strong>Tên thuốc:</strong> {selectedRecord.medication}</p>
            <p><strong>Trạng thái:</strong> {getStatusTag(selectedRecord.status)}</p>
            <p><strong>Thời gian gửi:</strong> {selectedRecord.time}</p>
            {selectedRecord.status === 'expired' && selectedRecord.rejectReason && (
              <p><strong>Lý do từ chối:</strong> {selectedRecord.rejectReason}</p>
            )}
            {selectedRecord.status === 'uncompleted' && selectedRecord.rejectReason && (
              <p><strong>Lý do từ chối:</strong> {selectedRecord.rejectReason}</p>
            )}
            {detailLoading && <p>Đang tải chi tiết...</p>}
            {detailData && Array.isArray(detailData) && detailData.length > 0 && (
              <div style={{marginTop: 16}}>
                <strong>Chi tiết thuốc:</strong>
                <ul>
                  {detailData.map((item) => (
                    <li key={item.medicationDetailId} style={{marginBottom: 8}}>
                      <div><strong>Tên thuốc:</strong> {item.medicineName}</div>
                      <div><strong>Liều dùng:</strong> {item.dosage}</div>
                      <div><strong>Thời gian sử dụng:</strong> {item.timeToUse}</div>
                      <div><strong>Ghi chú:</strong> {item.note}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Xác nhận từ chối phiếu"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={rejectForm}>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do từ chối phiếu..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận từ chối phát thuốc"
        open={timelineRejectModalVisible}
        onOk={handleTimelineReject}
        onCancel={() => {
          setTimelineRejectModalVisible(false);
          timelineRejectForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={timelineRejectForm}>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do từ chối phát thuốc..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;
