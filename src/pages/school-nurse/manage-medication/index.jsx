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
  Row,
  Col,
  Pagination,
  Modal,
  Form,
  message,
  Calendar,
  Badge,
  Empty,
  Upload,
  Divider,
  Collapse
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UploadOutlined,
  PictureOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { getMedicationSubmissions, updateMedicationStatus, getMedicationSubmissionDetails, getMedicationConfirmationBySubmission, uploadEvidenceImage, getEvidenceImage, updateScheduleStatus } from '../../../api/medicalSubmissionNurse';
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

const MedicationManagement = () => {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState([]); // Thay đổi thành array để chứa nhiều schedule
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const tablePageSize = 5;
  // Thêm state để điều khiển modal ảnh thuốc
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);
  // 1. Thêm state cho modal cập nhật tình trạng thuốc
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [updateStatusForm] = Form.useForm();
  const [confirmationData, setConfirmationData] = useState(null);
  // Thêm state cho upload evidence image
  const [evidenceFileList, setEvidenceFileList] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  // THÊM MỚI: State cho modal ảnh evidence
  const [isEvidenceImageModalVisible, setIsEvidenceImageModalVisible] = useState(false);
  const [evidenceImageToShow, setEvidenceImageToShow] = useState(null);
  // State cho modal cập nhật trạng thái schedule
  const [isUpdateScheduleModalVisible, setIsUpdateScheduleModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [updateScheduleForm] = Form.useForm();
  // State cho modal xác nhận
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchMedicationSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const submissions = await getMedicationSubmissions();
      const formattedData = submissions.map((submission, index) => {
        // Lấy thông tin từ medicationDetails đầu tiên (nếu có)
        const firstDetail = Array.isArray(submission.medicationDetails) && submission.medicationDetails.length > 0 ? submission.medicationDetails[0] : {};
        
        // Xử lý timeToUseList thành chuỗi
        const timeToUseString = firstDetail.timeToUseList && Array.isArray(firstDetail.timeToUseList) 
          ? firstDetail.timeToUseList.join(', ') 
          : '';
        
        return {
          key: submission.submissionId?.toString() || index.toString(),
          id: submission.submissionId, // Sử dụng submissionId từ backend
          student: submission.studentName,
          className: submission.className || '',
          medication: Array.isArray(submission.medicationDetails) ? submission.medicationDetails.map(m => m.medicineName).join(', ') : '',
          status: submission.status, // Lấy trạng thái từ backend
          time: formatDate(submission.submissionDate),
          submissionDate: submission.submissionDate,
          actions: submission.status === 'Chờ nhận thuốc' ? ['view', 'confirm'] : ['view'],

          medicationDetails: submission.medicationDetails,
          dosage: firstDetail.dosage || '',
          timeToUse: timeToUseString, // Sử dụng timeToUseList đã chuyển thành chuỗi
          note: firstDetail.note || '',
          noteSchedule: firstDetail.noteSchedule || '', // Thêm noteSchedule
          medicationDetailId: firstDetail.medicationDetailId, // Thêm medicationDetailId
          studentId: submission.studentId,
          confirmId: submission.confirmId, // Lấy confirmId từ backend nếu có
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
      case 'Đang xử lí':
        return <Tag color="processing">Đang xử lí</Tag>;
      case 'Đã hoàn thành':
        return <Tag color="success">Đã hoàn thành</Tag>;
      case 'Đã Hủy':
        return <Tag color="red">Đã Hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getStatusCount = (status) => {
    return selectedDateData.filter(item => item.status === status).length;
  };

  const getTabData = () => {
    if (activeTab === 'all') return selectedDateData;
    if (activeTab === 'processing') return selectedDateData.filter(item => item.status === 'Đang xử lí');
    if (activeTab === 'completed') return selectedDateData.filter(item => item.status === 'Đã hoàn thành');
    if (activeTab === 'cancelled') return selectedDateData.filter(item => item.status === 'Đã Hủy');
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
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ];

  // 2. Sửa lại handleUpdateStatus để luôn lấy confirmationData khi cập nhật tình trạng
  const handleUpdateStatus = async (record) => {
    updateStatusForm.resetFields();
    setEvidenceFileList([]);
    // Lấy nurseId từ localStorage
    const nurseId = localStorage.getItem('userId') || '';
    let confirmation = null;
    try {
      confirmation = await getMedicationConfirmationBySubmission(record.id);
      setConfirmationData(confirmation);
    } catch (error) {
      confirmation = null;
      setConfirmationData(null);
    }
    // Lưu confirmId vào selectedRecord để dùng khi submit
    setSelectedRecord({ ...record, confirmId: confirmation?.confirmId || record.confirmId });
    // Nếu có dữ liệu xác nhận, điền các field từ confirmation
    if (confirmation) {
      updateStatusForm.setFieldsValue({
        status: confirmation.status,
        reason: confirmation.reason,
        nurseId: nurseId,
      });
    } else {
      updateStatusForm.setFieldsValue({
        status: record.status,

        nurseId: nurseId,
      });
    }
    setIsUpdateStatusModalVisible(true);
  };

  // Hàm xử lý upload evidence image
  const handleEvidenceUpload = async (file) => {
    const confirmId = selectedRecord?.confirmId;
    if (!confirmId) {
      message.error('Không tìm thấy mã xác nhận để upload ảnh!');
      return false;
    }

    try {
      setUploadingEvidence(true);
      await uploadEvidenceImage(file, confirmId);
      message.success('Upload ảnh bằng chứng thành công!');
      return true;
    } catch (error) {
      message.error('Lỗi khi upload ảnh: ' + getErrorMessage(error));
      return false;
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Props cho Upload component
  const evidenceUploadProps = {
    name: 'file',
    multiple: false,
    fileList: evidenceFileList,
    beforeUpload: (file) => {
      // Kiểm tra định dạng file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }

      // Kiểm tra kích thước file (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước file phải nhỏ hơn 5MB!');
        return false;
      }

      return false; // Prevent automatic upload
    },
    onChange: (info) => {
      setEvidenceFileList(info.fileList.slice(-1)); // Chỉ giữ 1 file
    },
    onRemove: () => {
      setEvidenceFileList([]);
    }
  };

  // THÊM MỚI: Hàm xử lý xem ảnh evidence
  const handleViewEvidenceImage = async (confirmId) => {
    let hideLoading = null;
    try {
      hideLoading = message.loading('Đang tải ảnh evidence...', 0);
      const base64String = await getEvidenceImage(confirmId);


      // Đảm bảo có header data:image nếu chưa có
      let imgSrc = base64String.startsWith('data:image') ? base64String : `data:image/png;base64,${base64String}`;

      setEvidenceImageToShow(imgSrc);
      setIsEvidenceImageModalVisible(true);
    } catch (error) {
      setEvidenceImageToShow(null);
      
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem ảnh này');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy ảnh evidence cho xác nhận này');
      } else {
        message.error('Không thể tải ảnh evidence: ' + getErrorMessage(error));
      }
    } finally {
      if (hideLoading) hideLoading();
    }
  };

  // THÊM MỚI: Hàm đóng modal ảnh evidence
  const handleCloseEvidenceImageModal = () => {
    setIsEvidenceImageModalVisible(false);
    setEvidenceImageToShow(null);
  };

  // Hàm xử lý submit sau khi xác nhận
  const handleConfirmSubmit = async (values, confirmId) => {
    try {
      // Nếu có file evidence, upload trước
      if (evidenceFileList.length > 0) {
        const uploadSuccess = await handleEvidenceUpload(evidenceFileList[0].originFileObj);
        if (!uploadSuccess) {
          return;
        }
      }

      await updateMedicationStatus(confirmId, values);
      message.success('Cập nhật tình trạng thuốc thành công!');
      setIsUpdateStatusModalVisible(false);
      setEvidenceFileList([]);
      setIsConfirmModalVisible(false);
      fetchMedicationSubmissions();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // 3. Hàm xử lý submit cập nhật tình trạng thuốc
  const handleSubmitUpdateStatus = async () => {
    try {
      const values = await updateStatusForm.validateFields();
      // Lấy confirmId từ selectedRecord
      const confirmId = selectedRecord?.confirmId;
      if (!confirmId) {
        message.error('Không tìm thấy mã xác nhận để cập nhật!');
        return;
      }

      // Kiểm tra ràng buộc chuyển đổi trạng thái
      const currentStatus = selectedRecord.status;
      const newStatus = values.status;
      
      // Ràng buộc: Không được từ Hoàn thành sang Từ chối
      if (currentStatus === 'Đã hoàn thành' && newStatus === 'Từ chối') {
        message.error('Không thể chuyển từ trạng thái "Đã hoàn thành" sang "Từ chối"!');
        return;
      }
      
      // Ràng buộc: Không được từ Đã Hủy sang Đang xử lí hoặc Đã hoàn thành
      if (currentStatus === 'Đã Hủy' && (newStatus === 'Đang xử lí' || newStatus === 'Đã hoàn thành')) {
        message.error('Không thể chuyển từ trạng thái "Đã Hủy" sang "Đang xử lí" hoặc "Đã hoàn thành"!');
        return;
      }
      
      // Ràng buộc: Không được từ Đã hoàn thành chuyển sang Đã Hủy hoặc Đang xử lí
      if (currentStatus === 'Đã hoàn thành' && (newStatus === 'Đã Hủy' || newStatus === 'Đang xử lí')) {
        message.error('Không thể chuyển từ trạng thái "Đã hoàn thành" sang "Đã Hủy" hoặc "Đang xử lí"!');
        return;
      }

      // Xác nhận khi chuyển sang trạng thái "Đã Hủy"
      if (newStatus === 'Đã Hủy') {
        setConfirmAction({
          type: 'cancel',
          message: 'Bạn có chắc chắn muốn hủy phiếu gửi thuốc này?',
          description: 'Hành động này không thể hoàn tác.',
          onConfirm: () => handleConfirmSubmit(values, confirmId)
        });
        setIsConfirmModalVisible(true);
        return;
      }

      // Nếu không cần xác nhận, thực hiện ngay
      await handleConfirmSubmit(values, confirmId);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // SỬA LẠI hàm handleViewDetails để lưu toàn bộ array schedules
  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    setDetailData([]); // Reset thành array rỗng
    setConfirmationData(null);
    
    if (record && record.id) {
      setDetailLoading(true);
      try {
        // API trả về array của các schedule
        const detailsArray = await getMedicationSubmissionDetails(record.id);
        
        if (detailsArray && Array.isArray(detailsArray) && detailsArray.length > 0) {
          // Lưu toàn bộ array để hiển thị theo từng schedule
          setDetailData(detailsArray);
        }
        
        // Lấy xác nhận của nhân viên y tế
        try {
        const confirmation = await getMedicationConfirmationBySubmission(record.id);
        setConfirmationData(confirmation);
        } catch (confirmError) {
          console.warn('Không thể lấy thông tin xác nhận:', confirmError);
          setConfirmationData(null);
        }
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
    // No need to revoke URL for base64 strings
    setIsImageModalVisible(false);
    setImageToShow(null);
  };

  // Hàm xử lý mở modal cập nhật trạng thái schedule
  const handleUpdateScheduleStatus = (schedule) => {
    // Kiểm tra schedule có ID hợp lệ
    if (!schedule) {
      message.error('Lịch trình thuốc không hợp lệ!');
      return;
    }
    
    if (!schedule.medicationScheduleId || schedule.medicationScheduleId === 0) {
      message.error(`ID lịch trình không hợp lệ: ${schedule.medicationScheduleId}`);
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

  // Hàm xử lý submit schedule sau khi xác nhận
  const handleConfirmScheduleSubmit = async (requestData, scheduleId) => {
    try {
      await updateScheduleStatus(scheduleId, requestData);
      
      message.success(`Cập nhật trạng thái lịch trình thành công!`);
      setIsUpdateScheduleModalVisible(false);
      setIsConfirmModalVisible(false);
      
      // Reload lại dữ liệu chi tiết
      if (selectedRecord && selectedRecord.id) {
        const detailsArray = await getMedicationSubmissionDetails(selectedRecord.id);
        if (detailsArray && Array.isArray(detailsArray) && detailsArray.length > 0) {
          setDetailData(detailsArray);
        }
      }
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // Hàm xử lý submit cập nhật trạng thái schedule
  const handleSubmitUpdateScheduleStatus = async () => {
    try {
      const values = await updateScheduleForm.validateFields();
      
      // Đảm bảo có schedule và ID hợp lệ
      if (!selectedSchedule) {
        message.error('Không tìm thấy thông tin lịch trình thuốc!');
        return;
      }
      
      if (!selectedSchedule.medicationScheduleId || selectedSchedule.medicationScheduleId === 0) {
        message.error(`ID lịch trình không hợp lệ: ${selectedSchedule.medicationScheduleId}`);
        return;
      }
      
      const scheduleId = selectedSchedule.medicationScheduleId;
      
      const requestData = {
        status: values.status,
        noteSchedule: values.noteSchedule
      };
      
      // Kiểm tra ràng buộc chuyển đổi trạng thái lịch trình
      const currentStatus = selectedSchedule.status;
      const newStatus = values.status;
      
      // Ràng buộc: Không được từ "Đã phát thuốc" sang "Từ chối"
      if (currentStatus === 'Đã phát thuốc' && newStatus === 'Từ chối') {
        message.error('Không thể chuyển từ trạng thái "Đã phát thuốc" sang "Từ chối"!');
        return;
      }

      // Xác nhận khi chuyển sang trạng thái "Từ chối"
      if (newStatus === 'Từ chối') {
        setConfirmAction({
          type: 'reject',
          message: 'Bạn có chắc chắn muốn từ chối lịch trình thuốc này?',
          description: 'Hành động này sẽ ghi chú lý do từ chối.',
          onConfirm: () => handleConfirmScheduleSubmit(requestData, scheduleId)
        });
        setIsConfirmModalVisible(true);
        return;
      }

      // Nếu không cần xác nhận, thực hiện ngay
      await handleConfirmScheduleSubmit(requestData, scheduleId);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
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

      {/* Modal hiển thị chi tiết - CẬP NHẬT THEO SCHEDULE */}
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
                              <span style={{ fontWeight: 600, color: '#0056b3' }}>
                                <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
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
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                            backgroundColor: '#fff'
                          }}
                        >
                          <div style={{ padding: '8px 12px' }}>
                            {/* Thông tin lịch trình */}
                            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 4, border: '1px solid #bae7ff' }}>
                              <Row gutter={[16, 8]}>
                                {schedule.noteSchedule && (
                                  <Col span={24}>
                                    <Typography.Text type="secondary" strong>Ghi chú lịch trình:</Typography.Text><br />
                                    <Typography.Text italic style={{ color: '#666' }}>{schedule.noteSchedule}</Typography.Text>
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
                <Button type="primary" onClick={async () => {
                  let hideLoading = null;
                  try {
                    hideLoading = message.loading('Đang tải ảnh...', 0);
                    const base64String = await getMedicationImage(selectedRecord.id);
            
                    let imgSrc = base64String.startsWith('data:image') ? base64String : `data:image/png;base64,${base64String}`;
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
                }}>
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
                    <div>
                      <Typography.Text strong>Bằng chứng:</Typography.Text>{' '}
                      {confirmationData.evidence ? (
                        <Button
                          type="link"
                          icon={<PictureOutlined />}
                          size="small"
                          onClick={() => handleViewEvidenceImage(confirmationData.confirmId)}
                        >
                          Xem ảnh bằng chứng
                        </Button>
                      ) : (
                        <Typography.Text type="secondary">Chưa có ảnh bằng chứng</Typography.Text>
                      )}
                    </div>
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

      {/* THÊM MỚI: Modal hiển thị ảnh evidence */}
      <Modal
        open={isEvidenceImageModalVisible}
        onCancel={handleCloseEvidenceImageModal}
        footer={null}
        title="Ảnh bằng chứng"
        centered
        width={600}
      >
        {evidenceImageToShow ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={evidenceImageToShow}
              alt="evidence"
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
                setEvidenceImageToShow(null);
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text type="secondary">Không có ảnh bằng chứng</Typography.Text>
          </div>
        )}
      </Modal>

      {/* Modal cập nhật tình trạng thuốc */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Cập nhật tình trạng thuốc</span>}
        open={isUpdateStatusModalVisible}
        onOk={handleSubmitUpdateStatus}
        onCancel={() => {
          setIsUpdateStatusModalVisible(false);
          setEvidenceFileList([]);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={uploadingEvidence}
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

          <Form.Item label="Bằng chứng (Ảnh)">
            <Upload.Dragger {...evidenceUploadProps}>
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

      {/* Modal cập nhật trạng thái schedule */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Cập nhật trạng thái lịch trình</span>}
        open={isUpdateScheduleModalVisible}
        onOk={handleSubmitUpdateScheduleStatus}
        onCancel={() => {
          setIsUpdateScheduleModalVisible(false);
          updateScheduleForm.resetFields();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
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