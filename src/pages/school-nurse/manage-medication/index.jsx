import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Select, Button, Card, Typography, Space, Tag, Row, Col, Modal,
    Form, message, Calendar, Badge , Empty, Upload, Collapse
} from 'antd';
import {
  SearchOutlined, EyeOutlined, CheckOutlined, CalendarOutlined, FileTextOutlined,
  UploadOutlined, PictureOutlined, ClockCircleOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import { getMedicationSubmissions, updateMedicationStatus, getMedicationSubmissionDetails, 
  getMedicationConfirmationBySubmission, uploadEvidenceImage, getScheduleEvidenceImage, updateScheduleStatus } from '../../../api/medicalSubmissionNurse';
import { formatDate } from '../../../utils/formatDate';
import './Medication.css';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { getMedicationImage } from '../../../api/medicalSubmissionNurse';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Constants
const STATUS_CONFIG = {
  'Đang xử lí': { color: 'processing', label: 'Đang xử lí' },
  'Đã hoàn thành': { color: 'success', label: 'Đã hoàn thành' },
  'Đã Hủy': { color: 'red', label: 'Đã Hủy' },
  'Đã phát thuốc': { color: 'success', label: 'Đã phát thuốc' },
  'Từ chối': { color: 'red', label: 'Từ chối' }
};

const CLASS_OPTIONS = [
  { value: 'Lớp 5A', label: 'Lớp 5A' },
  { value: 'Lớp 4B', label: 'Lớp 4B' },
  { value: 'Lớp 3C', label: 'Lớp 3C' },
  { value: 'Lớp 2A', label: 'Lớp 2A' },
  { value: 'Lớp 1B', label: 'Lớp 1B' }
];

const MedicationManagement = () => {
  // State management
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [scheduleStatusMap, setScheduleStatusMap] = useState({}); // Lưu trạng thái schedule của mỗi submission

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Image modal states
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);
  const [isScheduleEvidenceModalVisible, setIsScheduleEvidenceModalVisible] = useState(false);
  const [scheduleEvidenceImageToShow, setScheduleEvidenceImageToShow] = useState(null);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);

  // Form states
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [updateStatusForm] = Form.useForm();

  // Schedule modal states
  const [isUpdateScheduleModalVisible, setIsUpdateScheduleModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [updateScheduleForm] = Form.useForm();
  const [scheduleEvidenceFileList, setScheduleEvidenceFileList] = useState([]);
  const [uploadingScheduleEvidence, setUploadingScheduleEvidence] = useState(false);

  // Confirmation modal states
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Utility functions
  const getStatusTag = (status) => {
    const config = STATUS_CONFIG[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const handleApiError = (error, customMessage) => {
    message.error(customMessage || getErrorMessage(error));
  };

  // Data processing functions
  const formatSubmissionData = (submissions) => {
    return submissions.map((submission, index) => {
      const firstDetail = Array.isArray(submission.medicationDetails) && submission.medicationDetails.length > 0 
        ? submission.medicationDetails[0] 
        : {};
      
        const timeToUseString = firstDetail.timeToUseList && Array.isArray(firstDetail.timeToUseList) 
          ? firstDetail.timeToUseList.join(', ') 
          : '';
        
        return {
          key: submission.submissionId?.toString() || index.toString(),
        id: submission.submissionId,
          student: submission.studentName,
          className: submission.className || '',
        medication: Array.isArray(submission.medicationDetails) 
          ? submission.medicationDetails.map(m => m.medicineName).join(', ') 
          : '',
        status: submission.status,
          time: formatDate(submission.submissionDate),
          submissionDate: submission.submissionDate,
          medicationDetails: submission.medicationDetails,
          dosage: firstDetail.dosage || '',
        timeToUse: timeToUseString,
          note: firstDetail.note || '',
        noteSchedule: firstDetail.noteSchedule || '',
        medicationDetailId: firstDetail.medicationDetailId,
          studentId: submission.studentId,
        confirmId: submission.confirmId,
      };
    }).sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  };

  const updateSelectedDateData = useCallback((allData, date) => {
    const selectedDateStr = date.format('YYYY-MM-DD');
    const filteredData = allData.filter(item => {
      const itemDate = dayjs(item.submissionDate).format('YYYY-MM-DD');
      return itemDate === selectedDateStr;
    });
    setSelectedDateData(filteredData);
  }, []);

  const getFilteredData = useCallback(() => {
    let filtered = data;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.student.toLowerCase().includes(searchLower) ||
          item.medication.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (classFilter) {
      filtered = filtered.filter((item) => item.className === classFilter);
    }

    return filtered;
  }, [data, searchText, statusFilter, classFilter]);

  const getStatusCount = useCallback((status) => {
    return selectedDateData.filter(item => item.status === status).length;
  }, [selectedDateData]);

  const getTabData = useCallback(() => {
    if (activeTab === 'all') return selectedDateData;
    const statusMap = {
      'processing': 'Đang xử lí',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã Hủy'
    };
    const targetStatus = statusMap[activeTab];
    return targetStatus ? selectedDateData.filter(item => item.status === targetStatus) : selectedDateData;
  }, [selectedDateData, activeTab]);

  // API functions
  const fetchMedicationSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const submissions = await getMedicationSubmissions();
      const formattedData = formatSubmissionData(submissions);
      setData(formattedData);
      updateSelectedDateData(formattedData, selectedDate);
      
      // Tải trước thông tin schedule cho tất cả submissions
      const schedulePromises = formattedData.map(async (submission) => {
        try {
          const detailsArray = await getMedicationSubmissionDetails(submission.id);
          return { id: submission.id, details: detailsArray };
        } catch (error) {
          console.warn(`Không thể tải schedule cho submission ${submission.id}:`, error);
          return { id: submission.id, details: [] };
        }
      });
      
      const scheduleResults = await Promise.allSettled(schedulePromises);
      const newScheduleStatusMap = {};
      
      scheduleResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          newScheduleStatusMap[result.value.id] = result.value.details;
        }
      });
      
      setScheduleStatusMap(newScheduleStatusMap);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, updateSelectedDateData]);

  // Hàm kiểm tra có schedule nào bị từ chối không
  const hasRejectedSchedule = useCallback((submissionId) => {
    return scheduleStatusMap[submissionId]?.some(schedule => schedule.status === 'Từ chối') || false;
  }, [scheduleStatusMap]);

  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    setDetailData([]);
    setConfirmationData(null);
    
    if (record?.id) {
      setDetailLoading(true);
      try {
        const [detailsArray, confirmation] = await Promise.allSettled([
          getMedicationSubmissionDetails(record.id),
          getMedicationConfirmationBySubmission(record.id)
        ]);
        
        if (detailsArray.status === 'fulfilled' && detailsArray.value) {
          setDetailData(detailsArray.value);
          // Lưu trạng thái schedule vào map
          setScheduleStatusMap(prev => ({
            ...prev,
            [record.id]: detailsArray.value
          }));
        }
        
        if (confirmation.status === 'fulfilled') {
          setConfirmationData(confirmation.value);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleUpdateStatus = async (record) => {
    updateStatusForm.resetFields();
    const nurseId = localStorage.getItem('userId') || '';
    
    try {
      const confirmation = await getMedicationConfirmationBySubmission(record.id);
      setConfirmationData(confirmation);
    setSelectedRecord({ ...record, confirmId: confirmation?.confirmId || record.confirmId });
      
      updateStatusForm.setFieldsValue({
        status: confirmation?.status || record.status,
        reason: confirmation?.reason || '',
        nurseId: nurseId,
      });
    } catch (error) {
      setConfirmationData(null);
      setSelectedRecord({ ...record, confirmId: record.confirmId });
      updateStatusForm.setFieldsValue({
        status: record.status,
        nurseId: nurseId,
      });
    }
    
    setIsUpdateStatusModalVisible(true);
  };



  const handleScheduleEvidenceUpload = async (file) => {
    const medicationScheduleId = selectedSchedule?.medicationScheduleId;
    if (!medicationScheduleId) {
      message.error('Không tìm thấy mã lịch trình để upload ảnh!');
      return false;
    }

    try {
      setUploadingScheduleEvidence(true);
      await uploadEvidenceImage(file, medicationScheduleId);
      message.success('Upload ảnh bằng chứng thành công!');
      return true;
    } catch (error) {
      handleApiError(error, 'Lỗi khi upload ảnh: ' + getErrorMessage(error));
      return false;
    } finally {
      setUploadingScheduleEvidence(false);
    }
  };

  const handleViewMedicationImage = async () => {
    let hideLoading = null;
    try {
      hideLoading = message.loading('Đang tải ảnh...', 0);
      const base64String = await getMedicationImage(selectedRecord.id);
      const imgSrc = base64String.startsWith('data:image') ? base64String : `data:image/png;base64,${base64String}`;
      setImageToShow(imgSrc);
      setIsImageModalVisible(true);
    } catch (error) {
      setImageToShow(null);
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem ảnh này');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy ảnh thuốc cho phiếu này');
      } else {
        message.error('Không thể tải ảnh: ' + getErrorMessage(error));
      }
    } finally {
      if (hideLoading) hideLoading();
    }
  };

  const handleViewScheduleEvidenceImage = async (medicationScheduleId) => {
    let hideLoading = null;
    try {
      hideLoading = message.loading('Đang tải ảnh bằng chứng...', 0);
      const base64String = await getScheduleEvidenceImage(medicationScheduleId);
      const imgSrc = base64String.startsWith('data:image') ? base64String : `data:image/png;base64,${base64String}`;
      setScheduleEvidenceImageToShow(imgSrc);
      setCurrentScheduleId(medicationScheduleId);
      setIsScheduleEvidenceModalVisible(true);
    } catch (error) {
      setScheduleEvidenceImageToShow(null);
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem ảnh này');
      } else if (error.response?.status === 404) {
        message.error('Nhân viên y tế chưa cập nhật ảnh bằng chứng');
      } else {
        message.error('Không thể tải ảnh bằng chứng: ' + getErrorMessage(error));
      }
    } finally {
      if (hideLoading) hideLoading();
    }
  };



  const handleConfirmSubmit = async (values, confirmId) => {
    try {
      await updateMedicationStatus(confirmId, values);
      message.success('Cập nhật tình trạng thuốc thành công!');
      setIsUpdateStatusModalVisible(false);
      setIsConfirmModalVisible(false);
      fetchMedicationSubmissions();
    } catch (error) {
      handleApiError(error);
    }
  };

  const validateStatusTransition = (currentStatus, newStatus) => {
    const invalidTransitions = {
      'Đã hoàn thành': ['Từ chối'],
      'Đã Hủy': ['Đang xử lí', 'Đã hoàn thành'],
      'Đã phát thuốc': ['Từ chối']
    };
    const invalidTargets = invalidTransitions[currentStatus];
    if (invalidTargets?.includes(newStatus)) {
      message.error(`Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"!`);
      return false;
    }
    return true;
  };

  const handleSubmitUpdateStatus = async () => {
    try {
      const values = await updateStatusForm.validateFields();
      const confirmId = selectedRecord?.confirmId;
      
      if (!confirmId) {
        message.error('Không tìm thấy mã xác nhận để cập nhật!');
        return;
      }

      if (!validateStatusTransition(selectedRecord.status, values.status)) {
        return;
      }
      
      if (values.status === 'Đã Hủy') {
        setConfirmAction({
          type: 'cancel',
          message: 'Bạn có chắc chắn muốn hủy phiếu gửi thuốc này?',
          description: 'Hành động này không thể hoàn tác.',
          onConfirm: () => handleConfirmSubmit(values, confirmId)
        });
        setIsConfirmModalVisible(true);
        return;
      }

      await handleConfirmSubmit(values, confirmId);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateScheduleStatus = (schedule) => {
    if (!schedule?.medicationScheduleId || schedule.medicationScheduleId === 0) {
      message.error('Lịch trình thuốc không hợp lệ!');
      return;
    }
    
    setSelectedSchedule(schedule);
    updateScheduleForm.resetFields();
    updateScheduleForm.setFieldsValue({
      status: schedule.status || 'Chờ nhận thuốc',
      noteSchedule: schedule.noteSchedule || ''
    });
    setIsUpdateScheduleModalVisible(true);
  };

  const handleConfirmScheduleSubmit = async (requestData, scheduleId) => {
    try {
      if (scheduleEvidenceFileList.length > 0) {
        const uploadSuccess = await handleScheduleEvidenceUpload(scheduleEvidenceFileList[0].originFileObj);
        if (!uploadSuccess) return;
      }

      await updateScheduleStatus(scheduleId, requestData);
      message.success('Cập nhật trạng thái lịch trình thành công!');
      setIsUpdateScheduleModalVisible(false);
      setIsConfirmModalVisible(false);
      setScheduleEvidenceFileList([]);
      
      if (selectedRecord?.id) {
        const detailsArray = await getMedicationSubmissionDetails(selectedRecord.id);
        if (detailsArray) {
          setDetailData(detailsArray);
          // Cập nhật lại schedule status map
          setScheduleStatusMap(prev => ({
            ...prev,
            [selectedRecord.id]: detailsArray
          }));
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSubmitUpdateScheduleStatus = async () => {
    try {
      const values = await updateScheduleForm.validateFields();
      
      if (!selectedSchedule?.medicationScheduleId || selectedSchedule.medicationScheduleId === 0) {
        message.error('Không tìm thấy thông tin lịch trình thuốc!');
        return;
      }
      
      const requestData = {
        status: values.status,
        noteSchedule: values.noteSchedule
      };
      
      if (!validateStatusTransition(selectedSchedule.status, values.status)) {
        return;
      }

      if (values.status === 'Từ chối') {
        setConfirmAction({
          type: 'reject',
          message: 'Bạn có chắc chắn muốn từ chối lịch trình thuốc này?',
          description: 'Hành động này sẽ ghi chú lý do từ chối.',
          onConfirm: () => handleConfirmScheduleSubmit(requestData, selectedSchedule.medicationScheduleId)
        });
        setIsConfirmModalVisible(true);
        return;
      }

      await handleConfirmScheduleSubmit(requestData, selectedSchedule.medicationScheduleId);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Event handlers
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    updateSelectedDateData(data, date);
  };

  const handleCloseImageModal = () => {
    setIsImageModalVisible(false);
    setImageToShow(null);
  };

  const handleCloseScheduleEvidenceModal = () => {
    setIsScheduleEvidenceModalVisible(false);
    setScheduleEvidenceImageToShow(null);
    setCurrentScheduleId(null);
  };



  // Calendar render functions
  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = data.filter(item => dayjs(item.submissionDate).format('YYYY-MM-DD') === dateStr);
    return dayData.length > 0 ? (
      <div className="calendar-cell">
        <Badge count={dayData.length} size="small" />
      </div>
    ) : null;
  };

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

  // Upload props
  const scheduleEvidenceUploadProps = {
    name: 'file',
    multiple: false,
    fileList: scheduleEvidenceFileList,
    beforeUpload: (file) => {
      if (!file.type.startsWith('image/')) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }
      if (file.size / 1024 / 1024 >= 5) {
        message.error('Kích thước file phải nhỏ hơn 5MB!');
        return false;
      }
      return false;
    },
    onChange: (info) => setScheduleEvidenceFileList(info.fileList.slice(-1)),
    onRemove: () => setScheduleEvidenceFileList([])
  };

  // Table columns
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
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ];

  // Effects
  useEffect(() => {
    fetchMedicationSubmissions();
  }, [fetchMedicationSubmissions]);

  const displayedData = getFilteredData();

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
              <Button type={activeTab === 'processing' ? 'primary' : 'default'} onClick={() => setActiveTab('processing')} style={{ marginRight: 8 }}>Đang xử lí ({getStatusCount('Đang xử lí')})</Button>
              <Button type={activeTab === 'completed' ? 'primary' : 'default'} onClick={() => setActiveTab('completed')} style={{ marginRight: 8 }}>Đã hoàn thành ({getStatusCount('Đã hoàn thành')})</Button>
              <Button type={activeTab === 'cancelled' ? 'primary' : 'default'} onClick={() => setActiveTab('cancelled')}>Đã Hủy ({getStatusCount('Đã Hủy')})</Button>
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
                    .map((item) => (
                      <div 
                        key={item.id} 
                        className={`medication-batch-card ${item.status === 'Từ chối' || hasRejectedSchedule(item.id) ? 'rejected' : ''}`}
                      >
                        <div className="medication-batch-card-header">
                          <div>
                            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                              Học sinh: {item.student} - {item.className}
                            </Typography.Title>
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
                            Tình trạng đơn thuốc
                          </Button>
                        </div>
                      </div>
                    ))}
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
                <Option value="Đang xử lí">Đang xử lí</Option>
                <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                <Option value="Đã Hủy">Đã Hủy</Option>
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
                {CLASS_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={displayedData}
          pagination={{ pageSize: 5 }}
          className="events-table"
          loading={loading}
        />
      </Card>

      {/* Modal hiển thị chi tiết */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết phiếu gửi thuốc</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
                centered
      >
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <Row gutter={[24, 16]}>
              {/* Thông tin học sinh và lớp */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Học sinh:</Typography.Text><br />
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {detailData && detailData.length > 0 ? detailData[0].studentName : selectedRecord.student}
                </Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Lớp học sinh:</Typography.Text><br />
                <Typography.Text>
                  {detailData && detailData.length > 0 ? detailData[0].studentClass : selectedRecord.className}
                </Typography.Text>
              </Col>
              {/* Thời gian gửi và trạng thái */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thời gian gửi:</Typography.Text><br />
                <Typography.Text>
                  {detailData && detailData.length > 0 ? formatDate(detailData[0].submissionDate) : selectedRecord.time}
                </Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Trạng thái:</Typography.Text><br />
                <span>{getStatusTag(selectedRecord.status)}</span>
              </Col>
              
              {/* Chi tiết từng lịch trình thuốc */}
              {detailData && detailData.length > 0 && (
                <Col span={24} style={{ marginTop: 20 }}>
                  <Typography.Text type="secondary" strong style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                    Chi tiết lịch trình thuốc:
                  </Typography.Text>
                  <div style={{ marginTop: 12 }}>
                    <Collapse 
                      accordion 
                      bordered={false}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      {detailData.map((schedule) => (
                        <Panel
                          header={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ 
                                fontWeight: 600, 
                                color: schedule.status === 'Từ chối' ? '#ff4d4f' : '#0056b3' 
                              }}>
                                <ClockCircleOutlined style={{ 
                                  marginRight: 8, 
                                  color: schedule.status === 'Từ chối' ? '#ff4d4f' : '#52c41a' 
                                }} />
                                Lịch trình ID: {schedule.medicationScheduleId || 'N/A'} - {schedule.timeToUse || 'N/A'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Tag color={
                                  schedule.status === 'Đã phát thuốc' ? 'success' :
                                  schedule.status === 'Từ chối' ? 'red' :
                                  'geekblue'
                                }>
                                  {schedule.status}
                                </Tag>
                                <Button 
                                  size="small" 
                                  type="primary" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateScheduleStatus(schedule);
                                  }}
                                >
                                  Cập nhật
                                </Button>
                              </div>
                            </div>
                          }
                          key={schedule.medicationScheduleId}
                          style={{ 
                            marginBottom: 8,
                            border: schedule.status === 'Từ chối' ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                            borderRadius: 6,
                            backgroundColor: schedule.status === 'Từ chối' ? '#fff2f0' : '#fff'
                          }}
                        >
                          <div style={{ padding: '8px 12px' }}>
                            {/* Thông tin lịch trình */}
                            <div style={{ 
                              marginBottom: 16, 
                              padding: 12, 
                              backgroundColor: schedule.status === 'Từ chối' ? '#fff2f0' : '#f0f8ff', 
                              borderRadius: 4, 
                              border: schedule.status === 'Từ chối' ? '1px solid #ffccc7' : '1px solid #bae7ff' 
                            }}>
                              <Row gutter={[16, 8]}>
                                {schedule.noteSchedule && (
                                  <Col span={24}>
                                    <Typography.Text type="secondary" strong>Ghi chú lịch trình:</Typography.Text><br />
                                    <Typography.Text italic style={{ 
                                      color: schedule.status === 'Từ chối' ? '#cf1322' : '#666' 
                                    }}>{schedule.noteSchedule}</Typography.Text>
              </Col>
                                )}
                              </Row>
                            </div>
                            {/* Danh sách thuốc trong lịch trình */}
                            <Typography.Text strong style={{ color: '#595959' }}>Danh sách thuốc:</Typography.Text>
                            <div style={{ marginTop: 8 }}>
                              {schedule.medicationDetails.map((medication, medIdx) => (
                                <div 
                                  key={medication.medicationDetailID || medIdx} 
                                  style={{ 
                                    marginBottom: 12, 
                                    padding: 12, 
                                    backgroundColor: '#fafafa', 
                                    borderRadius: 4,
                                    border: '1px solid #f0f0f0'
                                  }}
                                >
                                  <Row gutter={[16, 4]}>
                                    <Col span={12}>
                                      <Typography.Text type="secondary">Tên thuốc:</Typography.Text><br />
                                      <Typography.Text strong style={{ color: '#0056b3' }}>
                                        <MedicineBoxOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                                        {medication.medicineName}
                                      </Typography.Text>
                                    </Col>
                                    <Col span={12}>
                                      <Typography.Text type="secondary">Liều dùng:</Typography.Text><br />
                                      <Typography.Text>{medication.dosage}</Typography.Text>
                                    </Col>
                                    {medication.note && (
                                      <Col span={24}>
                                        <Typography.Text type="secondary">Ghi chú:</Typography.Text><br />
                                        <Typography.Text italic style={{ color: '#666' }}>{medication.note}</Typography.Text>
                                      </Col>
                                    )}
                                  </Row>
                                </div>
                              ))}
                            </div>
                            
                            {/* Bằng chứng ảnh cho lịch trình */}
                            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
                              <Typography.Text strong style={{ color: '#52c41a' }}>Bằng chứng ảnh:</Typography.Text>
                              <div style={{ marginTop: 8 }}>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<PictureOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewScheduleEvidenceImage(schedule.medicationScheduleId);
                                  }}
                                >
                                  Xem ảnh bằng chứng
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                </Col>
              )}
              
              {/* Ảnh thuốc */}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>Ảnh thuốc:</Typography.Text><br />
                <Button type="primary" onClick={handleViewMedicationImage}>
                  Xem ảnh đơn thuốc
                </Button>
              </Col>
              
              {/* Thông tin xác nhận của nhân viên y tế */}
              {confirmationData && (
                <Col span={24} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" strong style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>Thông tin xác nhận của nhân viên y tế:</Typography.Text>
                  <div style={{ marginTop: 8, marginLeft: 12 }}>
                    <div><Typography.Text strong>Trạng thái:</Typography.Text> <Typography.Text>{confirmationData.status}</Typography.Text></div>
                    <div><Typography.Text strong>Ghi chú:</Typography.Text> <Typography.Text>{confirmationData.reason}</Typography.Text></div>
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

      {/* Modal hiển thị ảnh bằng chứng lịch trình */}
      <Modal
        open={isScheduleEvidenceModalVisible}
        onCancel={handleCloseScheduleEvidenceModal}
        footer={null}
        title={`Ảnh bằng chứng - Lịch trình ID: ${currentScheduleId}`}
        centered
        width={600}
      >
        {scheduleEvidenceImageToShow ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={scheduleEvidenceImageToShow}
              alt="schedule evidence"
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onError={() => {
                message.error('Không thể hiển thị ảnh bằng chứng');
                setScheduleEvidenceImageToShow(null);
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text type="secondary">Không có ảnh bằng chứng cho lịch trình này</Typography.Text>
          </div>
        )}
      </Modal>



      {/* Modal cập nhật tình trạng thuốc */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Tình trạng đơn thuốc</span>}
        open={isUpdateStatusModalVisible}
        onOk={handleSubmitUpdateStatus}
        onCancel={() => {
          setIsUpdateStatusModalVisible(false);
        }}  
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={updateStatusForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="Đang xử lí">Đang xử lí</Option>
              <Option value="Đã hoàn thành">Đã hoàn thành</Option>
              <Option value="Đã Hủy">Đã Hủy</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="Ghi chú" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea placeholder="Nhập lý do" />
          </Form.Item>
          <Form.Item name="nurseId" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật trạng thái schedule */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Cập nhật trạng thái lịch trình</span>}
        open={isUpdateScheduleModalVisible}
        onOk={handleSubmitUpdateScheduleStatus}
        onCancel={() => {
          setIsUpdateScheduleModalVisible(false);
          updateScheduleForm.resetFields();
          setScheduleEvidenceFileList([]);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={uploadingScheduleEvidence}
      >
        {selectedSchedule && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
            <Typography.Text strong>Lịch trình ID: {selectedSchedule.medicationScheduleId}</Typography.Text><br />
            <Typography.Text type="secondary">Thời gian: {selectedSchedule.timeToUse}</Typography.Text>
          </div>
        )}
        <Form form={updateScheduleForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="Đã phát thuốc" style={{ color: '#52c41a' }}>Đã phát thuốc</Option>
              <Option value="Từ chối" style={{ color: '#ff4d4f' }}>Từ chối</Option>
            </Select>
          </Form.Item>
          <Form.Item name="noteSchedule" label="Ghi chú lịch trình" rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}>
            <Input.TextArea placeholder="Nhập ghi chú cho lịch trình" rows={3} />
          </Form.Item>

          <Form.Item label="Bằng chứng (Ảnh)">
            <Upload.Dragger {...scheduleEvidenceUploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Nhấn hoặc kéo thả file vào đây để upload</p>
              <p className="ant-upload-hint">
                Hỗ trợ upload file ảnh. Kích thước tối đa 5MB.
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: confirmAction?.type === 'cancel' ? '#ff4d4f' : '#faad14' }}>
              {confirmAction?.type === 'cancel' ? '⚠️' : '❓'}
            </span>
            <span style={{ fontWeight: 600 }}>Xác nhận hành động</span>
          </div>
        }
        open={isConfirmModalVisible}
        onOk={() => {
          if (confirmAction?.onConfirm) {
            confirmAction.onConfirm();
          }
        }}
        onCancel={() => {
          setIsConfirmModalVisible(false);
          setConfirmAction(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          danger: confirmAction?.type === 'cancel',
          type: confirmAction?.type === 'cancel' ? 'primary' : 'default'
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <Typography.Title level={5} style={{ marginBottom: 8 }}>
            {confirmAction?.message}
          </Typography.Title>
          <Typography.Text type="secondary">
            {confirmAction?.description}
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
};

export default MedicationManagement;
