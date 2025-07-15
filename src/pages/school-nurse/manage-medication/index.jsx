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
import { formatDateTime } from '../../../utils/formatDate';
import './Medication.css';
import { hasNoSpecialCharacters } from '../../../validations';
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
  const [timelineData, setTimelineData] = useState([]);
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
        className: submission.className || '',
        medication: submission.medicationDetails.map(m => m.medicineName).join(', '),
        status: mapStatusToFE(submission.status),
                  time: formatDateTime(submission.submissionDate),
        actions: mapStatusToFE(submission.status) === 'pending' ? ['view', 'confirm', 'cancel'] : ['view'],
        rejectReason: '',
        medicationDetails: submission.medicationDetails
      }));
      // Sắp xếp theo ngày và giờ giảm dần (mới nhất lên đầu)
      formattedData.sort((a, b) => {
        const dateA = new Date(submissions[a.id - 1].submissionDate);
        const dateB = new Date(submissions[b.id - 1].submissionDate);
        return dateB - dateA;
      });
      setData(formattedData);

      // Không lọc theo ngày nữa, lấy tất cả submissions cho timelineData
      const todayTimeline = submissions
        .map((submission, idx) => ({
          id: idx + 1,
          time: new Date(submission.submissionDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          student: submission.studentName,
          medication: submission.medicationDetails.map(m => `${m.medicineName} - ${m.dosage || ''} ${m.timeToUse ? `(${m.timeToUse})` : ''}`).join(', '),
          status: mapStatusToFE(submission.status),
          color: 'orange',
          rejectReason: submission.rejectReason || ''
        }));
      // Sắp xếp lại timelineData theo ngày và giờ giảm dần
      todayTimeline.sort((a, b) => {
        const dateA = new Date(submissions[a.id - 1].submissionDate);
        const dateB = new Date(submissions[b.id - 1].submissionDate);
        return dateB - dateA;
      });
      setTimelineData(todayTimeline);
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
      filtered = filtered.filter((item) => item.className === classFilter);
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
        return <Tag color="orange">Chờ nhận thuốc</Tag>;
      case 'confirmed':
        return <Tag color="green">Đã nhận thuốc</Tag>;
      case 'expired':
        return <Tag color="red">Từ chối thuốc</Tag>;
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
      width: '20%'
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: '10%'
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
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: '20%'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'confirmed')}
              >
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'expired')}
              >
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
    timelineRejectForm.validateFields().then(async values => {
      try {
        await updateMedicationStatus(timelineRejectingId, mapStatusToBE('uncompleted'), values.reason);
        message.success('Đã cập nhật trạng thái và lưu lý do từ chối thành công');
        fetchMedicationSubmissions();
      } catch (error) {
        message.error('Cập nhật trạng thái thất bại');
      }
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
                placeholder="Tất cả trạng thái ..."
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="pending">Chờ nhận thuốc</Option>
                <Option value="confirmed">Đã nhận thuốc</Option>
                <Option value="expired">Từ chối thuốc</Option>
                <Option value="completed">Đã phát thuốc</Option>
                <Option value="uncompleted">Chưa phát thuốc</Option>
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
                <Option value="Lớp 5A">Lớp 5A</Option>
                <Option value="Lớp 4B">Lớp 4B</Option>
                <Option value="Lớp 3C">Lớp 3C</Option>
                <Option value="Lớp 2A">Lớp 2A</Option>
                <Option value="Lớp 1B">Lớp 1B</Option>
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
            else if (item.status === 'confirmed') statusText = 'Đã nhận thuốc';
            else if (item.status === 'expired') statusText = 'Từ chối thuốc';
            else statusText = 'Chờ nhận thuốc';

            // Tìm trạng thái ở danh sách (data) theo id
            const listRecord = data.find(d => d.id === item.id);
            const listStatus = listRecord ? listRecord.status : null;
            // Chỉ cho phép cập nhật trạng thái nếu trạng thái ở danh sách là 'confirmed'
            const allowUpdate = listStatus === 'confirmed';

            return (
             
                <div className={cardClass}>
                  <div className="timeline-header">
                    <span className="timeline-student">Phát thuốc cho {item.student}</span>
                    <span className="timeline-status">
                      {item.status === 'completed' && <CheckCircleTwoTone twoToneColor="#52c41a" style={{marginRight: 4}} />}
                      {item.status === 'uncompleted' && <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{marginRight: 4}} />}
                      {item.status === 'pending' && <ClockCircleTwoTone twoToneColor="#faad14" style={{marginRight: 4}} />}
                      {item.status === 'confirmed' && <CheckCircleTwoTone twoToneColor="#1890ff" style={{marginRight: 4}} />}
                      {item.status === 'expired' && <CloseCircleTwoTone twoToneColor="#d4380d" style={{marginRight: 4}} />}
                      {statusText}
                    </span>
                    <div className="timeline-actions">
                      {allowUpdate && <>
                        <Button
                          size="small"
                          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                          onClick={() => handleUpdateStatus(item.id, 'completed')}
                          type="primary"
                        ></Button>
                        <Button
                          size="small"
                          icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                          onClick={() => handleUpdateStatus(item.id, 'uncompleted')}
                          danger
                        ></Button>
                      </>}
                      {(item.status === 'completed' || item.status === 'uncompleted') && (
                        <Button
                          size="small"
                          icon={<ClockCircleTwoTone twoToneColor="#faad14" />}
                          onClick={() => handleUpdateStatus(item.id, 'pending')}
                        ></Button>
                      )}
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(item)}
                      ></Button>
                    </div>
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-medication">{item.medication}</div>
                  </div>
                </div>
             
            );
          })}
        </Timeline>
      </Card>

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết phiếu gửi thuốc</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedRecord && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Học sinh:</Typography.Text><br />
                <Typography.Text strong style={{ fontSize: 16 }}>{selectedRecord.student}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Lớp:</Typography.Text><br />
                <Typography.Text strong>{detailData?.studentClass || selectedRecord.className}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Tên thuốc:</Typography.Text><br />
                <Typography.Text>{selectedRecord.medication}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Trạng thái:</Typography.Text><br />
                <span>{getStatusTag(selectedRecord.status)}</span>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thời gian:</Typography.Text><br />
                <Typography.Text>{selectedRecord.time}</Typography.Text>
              </Col>
              {detailData?.nurseName && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Y tá nhận:</Typography.Text><br />
                  <Typography.Text>{detailData.nurseName}</Typography.Text>
                </Col>
              )}
              {selectedRecord.status === 'expired' && selectedRecord.rejectReason && (
                <Col span={24} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Lý do từ chối:</Typography.Text><br />
                  <Typography.Text>{selectedRecord.rejectReason}</Typography.Text>
                </Col>
              )}
              {selectedRecord.status === 'uncompleted' && selectedRecord.rejectReason && (
                <Col span={24} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Lý do từ chối:</Typography.Text><br />
                  <Typography.Text>{selectedRecord.rejectReason}</Typography.Text>
                </Col>
              )}
              {detailData?.medicineImage && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Ảnh thuốc:</Typography.Text><br />
                  <img src={detailData.medicineImage} alt="medicine" style={{maxWidth: 120}} />
                </Col>
              )}
              {detailLoading && (
                <Col span={24}><Typography.Text>Đang tải chi tiết...</Typography.Text></Col>
              )}
              {detailData?.medicationDetails && Array.isArray(detailData.medicationDetails) && detailData.medicationDetails.length > 0 && (
                <Col span={24} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" strong>Chi tiết thuốc:</Typography.Text>
                  <div style={{marginTop: 8}}>
                    <ul style={{paddingLeft: 20}}>
                      {detailData.medicationDetails.map((item) => (
                        <li key={item.medicationDetailId} style={{marginBottom: 8}}>
                          <div><Typography.Text type="secondary">Tên thuốc:</Typography.Text> <Typography.Text>{item.medicineName}</Typography.Text></div>
                          <div><Typography.Text type="secondary">Liều dùng:</Typography.Text> <Typography.Text>{item.dosage}</Typography.Text></div>
                          <div><Typography.Text type="secondary">Thời gian sử dụng:</Typography.Text> <Typography.Text>{item.timeToUse}</Typography.Text></div>
                          <div><Typography.Text type="secondary">Ghi chú:</Typography.Text> <Typography.Text>{item.note}</Typography.Text></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={<span style={{ fontWeight: 900, fontSize: 20, color: '#FDE366' }}>Xác nhận từ chối phiếu</span>}
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(255,77,79,0.08)', border: '1px solid #ffe6e6' }}>
          <Form form={rejectForm} layout="vertical">
            <Form.Item
              name="reason"
              label={<span style={{ fontWeight: 600, color: '#ff4d4f' }}>Lý do từ chối</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập lý do từ chối' },
                
                 { validator: (_, value) => {
                    if (value === undefined || value === '') return Promise.resolve();
                    if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input.TextArea rows={4} placeholder="Nhập lý do từ chối phiếu..." />
            </Form.Item>
          </Form>
        </div>
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
            rules={[
              { required: true, message: 'Vui lòng nhập lý do từ chối' },
              
               { validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do từ chối phát thuốc..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;
