import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  Form,
  message,
  Calendar,
  Badge,
  Empty,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ClockCircleTwoTone,
  FileTextOutlined
} from '@ant-design/icons';
import { getMedicationSubmissions, updateMedicationStatus, getMedicationSubmissionDetails, getMedicationConfirmationBySubmission } from '../../../api/medicalSubmissionNurse';
import { formatDateTime } from '../../../utils/formatDate';
import './Medication.css';
import { hasNoSpecialCharacters } from '../../../validations';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { getMedicationImage } from '../../../api/medicalSubmissionNurse';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const MedicationManagement = () => {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [timelineRejectModalVisible, setTimelineRejectModalVisible] = useState(false);
  const [timelineRejectForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentCardPage, setCurrentCardPage] = useState(1);
  const cardsPerPage = 3;
  const tablePageSize = 5;
  // Thêm state để điều khiển modal ảnh thuốc
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);
  // 1. Thêm state cho modal cập nhật tình trạng thuốc
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [updateStatusForm] = Form.useForm();
  const [confirmationData, setConfirmationData] = useState(null);

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

  const fetchMedicationSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const submissions = await getMedicationSubmissions();
      const formattedData = submissions.map((submission, index) => {
        // Lấy thông tin từ medicationDetails đầu tiên (nếu có)
        const firstDetail = Array.isArray(submission.medicationDetails) && submission.medicationDetails.length > 0 ? submission.medicationDetails[0] : {};
        return {
          key: index.toString(),
          id: index + 1,
          student: submission.studentName,
          className: submission.className || '',
          medication: Array.isArray(submission.medicationDetails) ? submission.medicationDetails.map(m => m.medicineName).join(', ') : '',
          status: mapStatusToFE(submission.status),
          time: formatDateTime(submission.submissionDate),
          submissionDate: submission.submissionDate,
          actions: mapStatusToFE(submission.status) === 'pending' ? ['view', 'confirm', 'cancel'] : ['view'],
          rejectReason: '',
          medicationDetails: submission.medicationDetails,
          dosage: firstDetail.dosage || '',
          timeToUse: firstDetail.timeToUse || '',
          note: firstDetail.note || '',
        };
      });
      formattedData.sort((a, b) => {
        const dateA = new Date(a.submissionDate);
        const dateB = new Date(b.submissionDate);
        return dateB - dateA;
      });
      setData(formattedData);
      updateSelectedDateData(formattedData, selectedDate);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const updateSelectedDateData = (allData, date) => {
    const selectedDateStr = date.format('YYYY-MM-DD');
    const filteredData = allData.filter(item => {
      const itemDate = dayjs(item.submissionDate).format('YYYY-MM-DD');
      return itemDate === selectedDateStr;
    });
    setSelectedDateData(filteredData);
  };

  useEffect(() => {
    fetchMedicationSubmissions();
  }, [fetchMedicationSubmissions]);

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

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Chờ duyệt</Tag>;
      case 'confirmed':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'expired':
        return <Tag color="red">Từ chối</Tag>;
      case 'completed':
        return <Tag color="blue">Đã phát thuốc</Tag>;
      case 'uncompleted':
        return <Tag color="volcano">Chưa phát thuốc</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getStatusCount = (status) => {
    return selectedDateData.filter(item => item.status === status).length;
  };

  const getTabData = () => {
    if (activeTab === 'all') return selectedDateData;
    if (activeTab === 'pending') return selectedDateData.filter(item => item.status === 'pending');
    if (activeTab === 'confirmed') return selectedDateData.filter(item => item.status === 'confirmed');
    return selectedDateData;
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
        </Space>
      )
    }
  ];

  // 2. Sửa lại handleUpdateStatus để mở modal thay vì cập nhật trực tiếp
  const handleUpdateStatus = (record) => {
    updateStatusForm.resetFields();
    // Lấy nurseId từ localStorage
    const nurseId = localStorage.getItem('userId') || '';
    // Nếu có dữ liệu xác nhận, điền các field từ confirmationData
    if (confirmationData) {
      updateStatusForm.setFieldsValue({
        status: confirmationData.status,
        reason: confirmationData.reason,
        nurseId: nurseId,
        evidence: confirmationData.evidence
      });
    } else {
      updateStatusForm.setFieldsValue({
        status: record.status,
        reason: record.rejectReason,
        nurseId: nurseId,
        evidence: record.evidence
      });
    }
    setIsUpdateStatusModalVisible(true);
  };

  // 3. Hàm xử lý submit cập nhật tình trạng thuốc
  const handleSubmitUpdateStatus = async () => {
    try {
      const values = await updateStatusForm.validateFields();
      // Lấy confirmId từ confirmationData nếu có, hoặc từ selectedRecord nếu có
      const confirmId = confirmationData?.confirmId;
      if (!confirmId) {
        message.error('Không tìm thấy mã xác nhận để cập nhật!');
        return;
      }
      await updateMedicationStatus(confirmId, values);
      message.success('Cập nhật tình trạng thuốc thành công!');
      setIsUpdateStatusModalVisible(false);
      fetchMedicationSubmissions();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleReject = () => {
    rejectForm.validateFields().then(async values => {
      try {
        await updateMedicationStatus(selectedRecord.id, mapStatusToBE('expired'), values.reason);
        message.success('Đã từ chối phiếu thành công');
        fetchMedicationSubmissions();
      } catch (error) {
        message.error(getErrorMessage(error));
      }
      setRejectModalVisible(false);
      rejectForm.resetFields();
    });
  };

  const handleTimelineReject = () => {
    timelineRejectForm.validateFields().then(async values => {
      try {
        await updateMedicationStatus(selectedRecord.id, mapStatusToBE('uncompleted'), values.reason);
        message.success('Đã cập nhật trạng thái và lưu lý do từ chối thành công');
        fetchMedicationSubmissions();
      } catch (error) {
        message.error(getErrorMessage(error));
      }
      setTimelineRejectModalVisible(false);
      timelineRejectForm.resetFields();
    });
  };

  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    setDetailData(null);
    setConfirmationData(null);
    if (record && record.id) {
      setDetailLoading(true);
      try {
        const details = await getMedicationSubmissionDetails(record.id);
        // Đảm bảo detailData có đủ các trường nurseName, studentClass, medicineImage, medicationDetails, submissionDate...
        setDetailData({
          medicationSubmissionId: details.medicationSubmissionId,
          parentId: details.parentId,
          studentId: details.studentId,
          medicineImage: details.medicineImage,
          nurseName: details.nurseName,
          studentClass: details.studentClass,
          medicationDetails: details.medicationDetails,
          submissionDate: details.submissionDate,
        });
        // Lấy xác nhận của nhân viên y tế
        const confirmation = await getMedicationConfirmationBySubmission(record.id);
        setConfirmationData(confirmation);
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    updateSelectedDateData(data, date);
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = data.filter(item => {
      const itemDate = dayjs(item.submissionDate).format('YYYY-MM-DD');
      return itemDate === dateStr;
    });
    
    if (dayData.length > 0) {
      return (
        <div className="calendar-cell">
          <Badge count={dayData.length} size="small" />
        </div>
      );
    }
    return null;
  };

  // Reset trang về 1 khi đổi tab
  useEffect(() => { setCurrentCardPage(1); }, [activeTab, selectedDate]);

  // Custom header cho Calendar
  const calendarHeaderRender = ({ value, onChange }) => {
    const current = value.clone();
    return (
      <div className="calendar-custom-header">
        <div className="calendar-header-left">
          <button className="calendar-nav-btn" onClick={() => onChange(current.clone().subtract(1, 'month'))}>{'<'}</button>
          <span className="calendar-header-label">{current.format('MMMM YYYY')}</span>
          <button className="calendar-nav-btn" onClick={() => onChange(current.clone().add(1, 'month'))}>{'>'}</button>
        </div>
        <button className="calendar-today-btn" onClick={() => onChange(dayjs())}>Hôm nay</button>
      </div>
    );
  };

  const handleCloseImageModal = () => {
    if (imageToShow) {
      URL.revokeObjectURL(imageToShow);
    }
    setIsImageModalVisible(false);
    setImageToShow(null);
  };

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Phiếu Gửi Thuốc</Title>
      </div>

      <div className="layout-container">
        {/* Left Column - Calendar */}
        <div className="calendar-section">
          <Card 
            className="calendar-card"
            title={
              <div className="calendar-header">
                <CalendarOutlined className="calendar-icon" />
                <span className="calendar-title">Chọn ngày</span>
              </div>
            }
            variant="outlined"
            styles={{ body: { padding: 24 } }}
          >
            <Calendar
              fullscreen={false}
              value={selectedDate}
              onSelect={handleDateSelect}
              dateCellRender={dateCellRender}
              className="custom-calendar"
              headerRender={calendarHeaderRender}
            />
          </Card>
        </div>

        {/* Right Column - Medication List */}
        <div className="medication-section">
          <Card 
            className="medication-list-card"
            title={
              <div className="medication-header">
                <div className="header-title">
                  Đơn thuốc ngày {selectedDate.format('DD/MM/YYYY')}
                </div>
                <div className="header-subtitle">
                  Tổng: {selectedDateData.length} đơn
                </div>
              </div>
            }
          >
            {/* Tabs for filtering */}
            <div className="medication-tabs" style={{ marginBottom: 16 }}>
              <Button type={activeTab === 'all' ? 'primary' : 'default'} onClick={() => setActiveTab('all')} style={{ marginRight: 8 }}>Tất cả ({selectedDateData.length})</Button>
              <Button type={activeTab === 'pending' ? 'primary' : 'default'} onClick={() => setActiveTab('pending')} style={{ marginRight: 8 }}>Chờ duyệt ({getStatusCount('pending')})</Button>
              <Button type={activeTab === 'confirmed' ? 'primary' : 'default'} onClick={() => setActiveTab('confirmed')}>Đã duyệt ({getStatusCount('confirmed')})</Button>
            </div>
            {/* Card list */}
            {getTabData().length === 0 ? (
              <Empty
                image={<FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                description={
                  <div className="empty-description">
                    <div className="empty-title">Không có đơn thuốc</div>
                    <div className="empty-subtitle">Không có đơn thuốc nào cần xử lý trong ngày này</div>
                  </div>
                }
              />
            ) : (
              <>
                <div className="medication-batch-list">
                  {getTabData()
                    .slice((currentCardPage - 1) * cardsPerPage, currentCardPage * cardsPerPage)
                    .map((item) => (
                      <div key={item.id} className="medication-batch-card">
                        <div className="medication-batch-card-header">
                          <div>
                            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600, color: '#0056b3' }}>Học sinh: {item.student} - {item.className}</Typography.Title>
                  
                          </div>
                          {getStatusTag(item.status)}
                        </div>
                        <div className="medication-batch-card-info">
                          <Space><Typography.Text strong>Tên thuốc:</Typography.Text> <Typography.Text>{item.medication}</Typography.Text></Space>
                          <Space><Typography.Text strong>Thời gian uống:</Typography.Text> <Typography.Text>{item.timeToUse || '-'}</Typography.Text></Space>
                        </div>
                        <div className="medication-batch-card-info" style={{ marginTop: 8 }}>
                          <Space><Typography.Text strong>Ghi chú:</Typography.Text> <Typography.Text>{item.note || '-'}</Typography.Text></Space>
                          <Space><Typography.Text strong>Thời gian gửi:</Typography.Text> <Typography.Text>{item.time}</Typography.Text></Space>
                        </div>
                        <div className="medication-batch-actions">
                          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(item)}>
                            Xem chi tiết
                          </Button>
                          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleUpdateStatus(item)}>
                            Cập nhật tình trạng
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <Pagination
                    current={currentCardPage}
                    total={getTabData().length}
                    pageSize={cardsPerPage}
                    onChange={setCurrentCardPage}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* All Medications Table */}
      <Card
        className="main-card"
        title="Tất cả phiếu gửi thuốc"
        style={{ marginTop: 24 }}
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
                <Option value="pending">Chờ duyệt</Option>
                <Option value="confirmed">Đã duyệt</Option>
                <Option value="expired">Từ chối</Option>
                <Option value="completed">Đã phát thuốc</Option>
                <Option value="uncompleted">Chưa phát thuốc</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả lớp..."
                value={classFilter}
                onChange={setClassFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả lớp</Option>
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
          dataSource={displayedData.slice((currentPage1 - 1) * tablePageSize, currentPage1 * tablePageSize)}
          pagination={false}
          className="events-table"
          loading={loading}
        />

        <div className="pagination-section">
          <Pagination
            current={currentPage1}
            total={displayedData.length}
            pageSize={tablePageSize}
            onChange={(page) => setCurrentPage1(page)}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Modals remain the same */}
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
              {/* Thông tin học sinh và lớp */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Học sinh:</Typography.Text><br />
                <Typography.Text strong style={{ fontSize: 16 }}>{selectedRecord.student}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Lớp học sinh:</Typography.Text><br />
                <Typography.Text>{detailData?.studentClass}</Typography.Text>
              </Col>
              {/* Thời gian gửi và trạng thái */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thời gian gửi:</Typography.Text><br />
                <Typography.Text>{detailData?.submissionDate ? formatDateTime(detailData.submissionDate) : ''}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Trạng thái:</Typography.Text><br />
                <span>{getStatusTag(selectedRecord.status)}</span>
              </Col>
              {/* Tên thuốc và chi tiết thuốc */}
              <Col span={24} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Tên thuốc:</Typography.Text><br />
                <Typography.Text>{selectedRecord.medication}</Typography.Text>
              </Col>
              {detailData?.medicationDetails && Array.isArray(detailData.medicationDetails) && detailData.medicationDetails.length > 0 && (
                <Col span={24} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" strong>Chi tiết thuốc:</Typography.Text>
                  <div style={{marginTop: 8}}>
                    <ul style={{paddingLeft: 20}}>
                      {detailData.medicationDetails.map((item, idx) => (
                        <li key={item.medicationDetailId ? `med-${item.medicationDetailId}` : `idx-${idx}`} style={{marginBottom: 8}}>
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
              {/* Ảnh thuốc */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Ảnh thuốc:</Typography.Text><br />
                <Button type="primary" onClick={async () => {
                  let hideLoading = null;
                  try {
                    hideLoading = message.loading('Đang tải ảnh...', 0);
                    const imgUrl = await getMedicationImage(selectedRecord.id);
                    setImageToShow(imgUrl);
                    setIsImageModalVisible(true);
                  } catch (error) {
                    setImageToShow(null);
                    message.error('Không thể tải ảnh: ' + getErrorMessage(error));
                  } finally {
                    if (hideLoading) hideLoading();
                  }
                }}>
                  Xem ảnh thuốc
                </Button>
              </Col>
              {/* Thông tin xác nhận của nhân viên y tế */}
              {confirmationData && (
                <Col span={24} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" strong>Thông tin xác nhận của nhân viên y tế:</Typography.Text>
                  <div style={{marginTop: 8, marginLeft: 12}}>
                    <div><Typography.Text strong>Mã xác nhận:</Typography.Text> <Typography.Text>{confirmationData.confirmId}</Typography.Text></div>
                    <div><Typography.Text strong>Mã phiếu gửi thuốc:</Typography.Text> <Typography.Text>{confirmationData.medicationSubmissionId}</Typography.Text></div>
                    <div><Typography.Text strong>Trạng thái:</Typography.Text> <Typography.Text>{confirmationData.status}</Typography.Text></div>
                    <div><Typography.Text strong>Mã y tá:</Typography.Text> <Typography.Text>{confirmationData.nurseId}</Typography.Text></div>
                    <div><Typography.Text strong>Lý do:</Typography.Text> <Typography.Text>{confirmationData.reason}</Typography.Text></div>
                    <div><Typography.Text strong>Bằng chứng:</Typography.Text> <Typography.Text>{confirmationData.evidence}</Typography.Text></div>
                  </div>
                </Col>
              )}
              {detailLoading && (
                <Col span={24}><Typography.Text>Đang tải chi tiết...</Typography.Text></Col>
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

      {/* Modal hiển thị ảnh thuốc */}
      <Modal
        open={isImageModalVisible}
        onCancel={handleCloseImageModal}
        footer={null}
        title="Ảnh thuốc"
        centered
        width={600}
      >
        {imageToShow ? (
            <div style={{ textAlign: 'center' }}>
            <img 
              src={imageToShow} 
              alt="medicine" 
              style={{
                maxWidth: '100%', 
                maxHeight: '500px', 
                display: 'block', 
                margin: '0 auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
              onError={() => {
                message.error('Không thể hiển thị ảnh');
                setImageToShow(null);
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text type="secondary">Không có ảnh thuốc</Typography.Text>
          </div>
        )}
      </Modal>

      {/* Modal cập nhật tình trạng thuốc */}
      <Modal
        title="Cập nhật tình trạng thuốc"
        open={isUpdateStatusModalVisible}
        onOk={handleSubmitUpdateStatus}
        onCancel={() => { setIsUpdateStatusModalVisible(false); }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={updateStatusForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}> 
            <Select placeholder="Chọn trạng thái">
              <Option value="APPROVED">Đã duyệt (APPROVED)</Option>
              <Option value="REJECTED">Từ chối (REJECTED)</Option>
              <Option value="ADMINISTERED">Đã phát thuốc (ADMINISTERED)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}> 
            <Input.TextArea placeholder="Nhập lý do" />
          </Form.Item>
          <Form.Item name="nurseId" label="Mã y tá" rules={[{ required: true, message: 'Vui lòng nhập mã y tá' }]}> 
            <Input placeholder="Nhập mã y tá" disabled />
          </Form.Item>
          <Form.Item name="evidence" label="Bằng chứng"> 
            <Input placeholder="Nhập bằng chứng (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;