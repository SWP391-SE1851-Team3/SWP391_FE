import React, { useState, useEffect } from 'react';
import {Table,
  Button,
  Input,
  Select,
  Card,
  Space,
  Tag,
  Pagination,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge,
  Modal,
  Form,
  TimePicker,
  DatePicker,
  message,
  Alert,
  Switch,
  InputNumber
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  AlertOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import './Events.css';
import moment from 'moment';
import { formatDateTime } from '../../../utils/formatDate';
import {
  createEmergencyEvent,
  updateMedicalEvent,
  getAllMedicalEvents,
  fetchStudentsByClass,
  getEventDetailsByEndpoint,
  getEventNames,
  getMedicalSupplies
} from '/src/api/medicalEventsAPI.js';
import { isPositiveNumber, isStringLengthInRange, hasNoSpecialCharacters } from '../../../validations';
import { isFever, isHypothermia, isTachycardia, isBradycardia } from '../../../validations';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
  const [currentPage2, setCurrentPage2] = useState(1);
  const [currentPage3, setCurrentPage3] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchSupplyText, setSearchSupplyText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplyStatusFilter, setSupplyStatusFilter] = useState('');
  const [isSupplyViewModalVisible, setIsSupplyViewModalVisible] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [eventTypeList, setEventTypeList] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [selectedSupplies, setSelectedSupplies] = useState([]);
  const [temperatureWarning, setTemperatureWarning] = useState('');
  const [heartRateWarning, setHeartRateWarning] = useState('');

  //Dự liệu mẫu cho sự kiện y tế
  const [events, setEvents] = useState([]);

  // Dữ liệu mẫu cho vật tư y tế
  const [medicalSupplies, setMedicalSupplies] = useState([]);

  const eventColumns = [
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type) => (
        <Tag color="red">{type}</Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text) => {
        if (!text) return '-';
        const date = moment(text, 'HH:mm, DD/MM/YYYY');
        if (!date.isValid()) {
          console.error('Invalid date received from API for rendering:', text); 
          return 'Invalid date format';
        }
        return date.format('HH:mm, DD/MM/YYYY');
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        
        
        let color = 'default';
        let text = 'Chờ xử lí';
        
        const currentStatus = status?.toUpperCase() || record.processingStatus?.toUpperCase() || 'PENDING';
        console.log('Current status:', currentStatus); // Debug log
        
        switch (currentStatus) {
          case 'PROCESSING':
            color = 'processing';
            text = 'Đang xử lí';
            break;
          case 'COMPLETED':
            color = 'success';
            text = 'Hoàn thành';
            break;
          case 'PENDING': 
            color = 'error';
            text = 'Chờ xử lí';
            break;
          case 'DELETED':
            color = 'default';
            text = 'Đã xóa';
            break;
        }
        
        // Debug log
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const supplyColumns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
     
      render: (text, record) => (
        <span>
          {text} {record.unit}
        </span>
      )
    },
    {
      title: 'Loại vật tư',
      dataIndex: 'category',
      key: 'category',
     
      render: (text) => <Tag>{text}</Tag>
    },
  ];


  // Hàm lọc dữ liệu
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Lọc theo từ khóa tìm kiếm
      const searchLower = searchText.toLowerCase();
      const matchesSearch = searchText === '' || 
        (event.studentName && event.studentName.toLowerCase().includes(searchLower)) ||
        (event.eventType && event.eventType.toLowerCase().includes(searchLower)) ||
        (event.time && moment(event.time).format('DD/MM/YYYY HH:mm').toLowerCase().includes(searchLower)) ||
        (event.processingStatus && event.processingStatus.toLowerCase().includes(searchLower));

      // Lọc theo loại sự kiện
      const matchesStatus = statusFilter === '' || 
        (event.eventType && event.eventType.toLowerCase() === statusFilter.toLowerCase());

      // Lọc theo trạng thái
      const matchesState = stateFilter === '' ||
        (event.processingStatus && event.processingStatus === stateFilter);

      return matchesSearch && matchesStatus && matchesState;
    });
  };

  // Hàm lọc vật tư y tế
  const getFilteredSupplies = () => {
    return medicalSupplies.filter(supply => {
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch = searchSupplyText === '' || 
        supply.name.toLowerCase().includes(searchSupplyText.toLowerCase()) ||
        supply.category.toLowerCase().includes(searchSupplyText.toLowerCase());

      // Lọc theo loại vật tư
      const matchesCategory = categoryFilter === '' || 
        supply.category === categoryFilter;

      // Lọc theo trạng thái
      const matchesStatus = supplyStatusFilter === '' || 
        supply.status === supplyStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  // Table columns for selecting supplies
  const supplySelectColumns = [
    {
      title: 'Chọn',
      dataIndex: 'selected',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={!!selectedSupplies.find(s => s.medicalSupplyId === record.key)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedSupplies(prev => ([
                ...prev,
                {
                  medicalSupplyId: record.key,
                  supplyName: record.name,
                  unit: record.unit,
                  quantityUsed: 1
                }
              ]));
            } else {
              setSelectedSupplies(prev => prev.filter(s => s.medicalSupplyId !== record.key));
            }
          }}
        />
      )
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Số lượng sử dụng',
      dataIndex: 'quantityUsed',
      render: (_, record) => {
        const selected = selectedSupplies.find(s => s.medicalSupplyId === record.key);
        return (
          <InputNumber
            min={1}
            disabled={!selected}
            value={selected ? selected.quantityUsed : 1}
            onChange={val => {
              setSelectedSupplies(prev => prev.map(s =>
                s.medicalSupplyId === record.key ? { ...s, quantityUsed: val } : s
              ));
            }}
          />
        );
      }
    }
  ];

  // Xử lý tạo sự kiện mới
  const handleCreateEvent = () => {
    form.validateFields().then(async values => {
      try {
        if (!selectedEventType) {
          message.error('Vui lòng chọn loại sự kiện');
          return;
        }
        if (!selectedStudent) {
          message.error('Vui lòng chọn học sinh');
          return;
        }
        // Lấy thông tin nurse từ localStorage
        const nurseId = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
        const nurseName = localStorage.getItem('nurseName') || localStorage.getItem('fullName') || localStorage.getItem('email') || '';
        // Nếu có cập nhật bởi y tá khác, có thể lấy tương tự hoặc để trống
        const updatedByNurseId = nurseId;
        const updatedByNurseName = nurseName;
        
        // Convert date string to proper format using moment
        const dateObj = values.date; // DatePicker returns a moment object
        const timeObj = values.time;
        const eventDateTime = dateObj.format('YYYY-MM-DD') + 'T' + timeObj.format('HH:mm:ss.SSS') + 'Z';
        
        const eventData = {
          eventId: values?.eventId,
          studentId: selectedStudent.studentID,
          parentID: selectedStudent.parentID || 0,
          typeName: values?.typeName || '',
          nurseId,
          nurseName,
          updatedByNurseId,
          updatedByNurseName,
          usageMethod: values?.usageMethod || '',
          hasParentBeenInformed: values?.hasParentBeenInformed || false,
          temperature: values?.temperature || '',
          heartRate: values?.heartRate || '',
          eventDateTime: eventDateTime,
          note: values?.note || '',
          result: values?.result || '',
          processingStatus: 'PENDING',
          eventTypeId: selectedEventType.eventTypeId,
          // Thêm các trường mới theo API mới
          medicalSupplies: selectedSupplies,
          emergency: values?.emergency || false
        };

        console.log("📤 Final Payload gửi lên API:", eventData);
        console.log("Debug: selectedStudent before API call", selectedStudent);
        
        const response = await createEmergencyEvent(eventData);
        message.success('Tạo sự kiện khẩn cấp thành công!');
        
        // Reload all events data
        try {
          const eventsData = await getAllMedicalEvents();
          const transformedEvents = eventsData.map(event => ({
            key: event.eventId,
            eventId: event.eventId,
            studentName: event.studentName ? event.studentName.split(' - ')[0] : '', // Extract only the name
            eventType: event.eventType,
            time: event.time,
            status: event.processingStatus || 'PROCESSING',
            processingStatus: event.processingStatus || 'PROCESSING'
          }));
          setEvents(transformedEvents);
        } catch (error) {
          console.error('Error reloading events:', error);
          message.error('Có lỗi xảy ra khi tải lại danh sách sự kiện');
        }
        
        setIsModalVisible(false);
        form.resetFields();
        setSelectedClass(null);
        setSelectedStudent(null);
        setStudents([]);
        setSelectedEventType(null);
        setSelectedSupplies([]);
      } catch (error) {
        console.error('Error creating emergency event:', error);
        message.error('Có lỗi xảy ra khi tạo sự kiện khẩn cấp');
      }
    });
  };

  // Xử lý xem chi tiết
  const handleViewDetails = async (record) => {
    try {
      const eventDetails = await getEventDetailsByEndpoint(record.eventId);
      console.log('Event Details (for view modal):', eventDetails); // Debug log
      setSelectedEvent(eventDetails);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error('Error loading event details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin chi tiết sự kiện');
    }
  };

  // Xử lý cập nhật sự kiện
  const handleUpdateEvent = () => {
    editForm.validateFields().then(async values => {
      try {
        console.log("Form values before update:", values); // Debug log
        // Lấy nurseId và nurseName từ localStorage
        const nurseId = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
        const nurseName = localStorage.getItem('nurseName') || localStorage.getItem('fullName') || localStorage.getItem('email') || '';
        
        // Convert date string to proper format using moment
        const dateObj = values.date; // DatePicker returns a moment object
        const timeObj = values.time;
        const eventDateTime = dateObj.format('YYYY-MM-DD') + 'T' + timeObj.format('HH:mm:ss.SSS') + 'Z';
        
        const eventData = {
          eventId: selectedEvent.eventId,
          usageMethod: values.usageMethod || '',
          isEmergency: values.isEmergency || false,
          hasParentBeenInformed: values.hasParentBeenInformed || false,
          temperature: values.temperature || '',
          heartRate: values.heartRate || '',
          eventDateTime: eventDateTime,
          nurseId,
          studentId: values.studentId,
          note: values.description,
          result: values.result,
          processingStatus: values.processingStatus,
          nurseName,
          medicalSupplies: selectedSupplies,
        };

        console.log("Event data before API call:", eventData); // Debug log

        // Find the event type ID from the eventTypeList
        const selectedType = eventTypeList.find(type => type.typeName === values.typeName);
        if (!selectedType) {
          message.error('Không tìm thấy loại sự kiện');
          return;
        }

        // Pass the correct eventTypeId to the API
        const updatedEvent = await updateMedicalEvent(selectedEvent.eventId, selectedType.eventTypeId, eventData);
        console.log("API Response after update:", updatedEvent); // Debug log
        message.success('Cập nhật sự kiện y tế thành công!');

        // Reload all events data to reflect changes from backend
        try {
          const eventsData = await getAllMedicalEvents();
          console.log("Raw events data from API:", eventsData); // Debug log
          const transformedEvents = eventsData.map(event => {
            const transformed = {
              key: event.eventId,
              eventId: event.eventId,
              studentName: event.studentName ? event.studentName.split(' - ')[0] : '',
              eventType: event.eventType,
              time: event.time,
              status: event.processingStatus || 'PROCESSING',
              processingStatus: event.processingStatus || 'PROCESSING'
            };
            console.log("Transformed event:", transformed); // Debug log
            return transformed;
          });
          console.log("Final transformed events:", transformedEvents); // Debug log
          setEvents(transformedEvents);
        } catch (error) {
          console.error('Error reloading events:', error);
          message.error('Có lỗi xảy ra khi tải lại danh sách sự kiện');
        }

        setIsEditModalVisible(false);
        editForm.resetFields();
        setSelectedEvent(null); // Reset selected event after successful update
      } catch (error) {
        console.error('Error updating event:', error);
        message.error('Có lỗi xảy ra khi cập nhật sự kiện y tế');
      }
    });
  };

  // UseEffect to populate edit form when modal becomes visible and data is available
  useEffect(() => {
    if (isEditModalVisible && selectedEvent) {
      console.log("Selected Event in useEffect:", selectedEvent); // Debug log
      const eventDateTime = moment(selectedEvent.eventDateTime);

      const eventTypeNameForForm = selectedEvent.eventTypeNames && selectedEvent.eventTypeNames.length > 0 
        ? selectedEvent.eventTypeNames[0].trim() 
        : '';

      const preSelectedEventType = eventTypeList.find(type =>
        type.typeName.trim().toLowerCase() === eventTypeNameForForm.toLowerCase()
      );

      const formValues = {
        className: selectedEvent.className,
        studentId: selectedEvent.studentId,
        typeName: preSelectedEventType ? preSelectedEventType.typeName : undefined, 
        processingStatus: selectedEvent.processingStatus,
        temperature: selectedEvent.temperature,
        heartRate: selectedEvent.heartRate,
        date: eventDateTime, // DatePicker expects a moment object
        time: eventDateTime,
        isEmergency: selectedEvent.isEmergency,
        hasParentBeenInformed: selectedEvent.hasParentBeenInformed,
        usageMethod: selectedEvent.usageMethod,
        description: selectedEvent.note,
        result: selectedEvent.result
      };

      console.log("Setting form values:", formValues); // Debug log
      editForm.setFieldsValue(formValues);

      // Đồng bộ selectedSupplies nếu có listMedicalSupplies
      if (selectedEvent.listMedicalSupplies && Array.isArray(selectedEvent.listMedicalSupplies)) {
        setSelectedSupplies(selectedEvent.listMedicalSupplies.map(s => ({
          medicalSupplyId: s.medicalSupplyId,
          supplyName: s.supplyName,
          unit: s.unit,
          quantityUsed: s.quantityUsed || 1
        })));
      } else {
        setSelectedSupplies([]);
      }
    }
  }, [isEditModalVisible, selectedEvent, eventTypeList, editForm]);

  // Xử lý chỉnh sửa
  const handleEdit = async (record) => {
    try {
      const eventDetails = await getEventDetailsByEndpoint(record.eventId);
      console.log('Event Details (for edit modal - FULL OBJECT):', eventDetails); // NEW DEBUG LOG
      setSelectedEvent(eventDetails);
      
      // Fetch students for the class associated with the event
      let studentsData = [];
      if (eventDetails.className) {
        try {
          studentsData = await fetchStudentsByClass(eventDetails.className);
          setStudents(studentsData); // Populate students for the dropdown
        } catch (error) {
          console.error('Error fetching students for pre-selected class in edit:', error);
          message.error('Có lỗi xảy ra khi tải danh sách học sinh cho lớp đã chọn');
        }
      } else {
        setStudents([]); // Clear students if no class
      }

      // Find the pre-selected student from the fetched list
      const preSelectedStudent = studentsData.find(s => s.studentID === eventDetails.studentId);
      if (preSelectedStudent) {
          setSelectedStudent(preSelectedStudent);
      } else {
          setSelectedStudent(null);
      }

      // Open modal - form fields will be set by useEffect
      setIsEditModalVisible(true);

      // Đồng bộ selectedSupplies nếu có listMedicalSupplies
      if (eventDetails.listMedicalSupplies && Array.isArray(eventDetails.listMedicalSupplies)) {
        setSelectedSupplies(eventDetails.listMedicalSupplies.map(s => ({
          medicalSupplyId: s.medicalSupplyId,
          supplyName: s.supplyName,
          unit: s.unit,
          quantityUsed: s.quantityUsed || 1
        })));
      } else {
        setSelectedSupplies([]);
      }

    } catch (error) {
      console.error('Error loading event details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin sự kiện');
    }
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setSelectedEventType(null); // Reset selectedEventType on cancel
  };

  // Xử lý đánh dấu hoàn thành
  const handleMarkComplete = (record) => {
    Modal.confirm({
      title: 'Xác nhận hoàn thành',
      content: 'Bạn có chắc chắn muốn đánh dấu sự kiện này đã hoàn thành?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const eventData = {
            ...record,
            processingStatus: 'COMPLETED',
            isEmergency: record.isEmergency || false,
            medicalSupplies: record.medicalSupplies || [],
          };

          // Find the event type ID from the eventTypeList
          const selectedType = eventTypeList.find(type => type.typeName === record.eventType);
          if (!selectedType) {
            message.error('Không tìm thấy loại sự kiện');
            return;
          }

          // Pass the correct eventTypeId to the API
          await updateMedicalEvent(record.eventId, selectedType.eventTypeId, eventData);
          
          // Reload all events data
          const eventsData = await getAllMedicalEvents();
          const transformedEvents = eventsData.map(event => ({
            key: event.eventId,
            eventId: event.eventId,
            studentName: event.studentName ? event.studentName.split(' - ')[0] : '',
            eventType: event.eventType,
            time: event.time,
            status: event.processingStatus || 'PROCESSING',
            processingStatus: event.processingStatus || 'PROCESSING'
          }));
          setEvents(transformedEvents);

          message.success('Đã đánh dấu sự kiện hoàn thành!');
        } catch (error) {
          console.error('Error marking event as complete:', error);
          message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
      }
    });
  };

  // Xử lý xem chi tiết vật tư
  const handleViewSupplyDetails = (record) => {
    setSelectedSupply(record);
    setIsSupplyViewModalVisible(true);
  };

  // Hàm xử lý khi chọn học sinh
  const handleStudentChange = (value) => {
    console.log('Selected student value:', value); // Debug log: value will now be just the student ID
    const student = students.find(s => s.studentID === value); // Find by ID directly
    console.log('Found student:', student); // Debug log
    if (student) {
      setSelectedStudent(student);
      form.setFieldsValue({
        studentId: student.studentID, // Set studentId to just the ID
        parentId: student.parentID || ''
      });
    } else {
      // Reset form fields if no student is found or deselected
      form.setFieldsValue({
        studentId: undefined,
        parentId: undefined
      });
    }
  };

  // Hàm xử lý khi chọn lớp
  const handleClassChange = async (className) => {
    console.log('Selected class:', className); // Debug log
    setSelectedClass(className);
    setSelectedStudent(null);
    form.setFieldsValue({ 
      studentId: undefined,
      parentId: undefined 
    });
    
    if (className) {
      try {
        console.log('Fetching students for class:', className); // Debug log
        const studentsData = await fetchStudentsByClass(className);
        console.log('Fetched students:', studentsData); // Debug log
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
        message.error('Có lỗi xảy ra khi tải danh sách học sinh');
      }
    } else {
      setStudents([]);
    }
  };

  // Hàm xử lý khi mở modal tạo sự kiện mới
  const handleOpenCreateModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setSelectedClass(null);
    setSelectedStudent(null);
    setStudents([]);
    setSelectedSupplies([]);
  };

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await getAllMedicalEvents();
        console.log('API Response:', eventsData); // Debug log
        // Transform the data to match the desired structure for the table
        const transformedEvents = eventsData.map(event => ({
          key: event.eventId,
          eventId: event.eventId,
          studentName: event.studentName ? event.studentName.split(' - ')[0] : '', // Extract only the name
          eventType: event.eventType,
          time: event.time,
          status: event.processingStatus || 'PROCESSING',
          processingStatus: event.processingStatus || 'PROCESSING'
        }));

        // Sort events by time in descending order (newest first)
        transformedEvents.sort((a, b) => {
          const timeA = moment(a.time);
          const timeB = moment(b.time);
          return timeB - timeA;
        });

        console.log('Transformed Events:', transformedEvents); // Debug log
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        message.error('Có lỗi xảy ra khi tải danh sách sự kiện');
      }
    };

    loadEvents();

    const loadEventNames = async () => {
      try {
        const names = await getEventNames();
        setEventTypeList(names);
      } catch (error) {
        console.error('Error loading event names:', error);
        message.error('Có lỗi xảy ra khi tải danh sách loại sự kiện');
      }
    };
    loadEventNames();
  }, []);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const supplies = await getMedicalSupplies();
        // Khi map dữ liệu từ API, bỏ trường status:
        const mapped = supplies.map(item => ({
          key: item.medicalSupplyID,
          name: item.supplyName,
          quantity: item.quantityAvailable,
          unit: item.unit,
          category: item.categoryName || item.categoryID || 'Khác',
          // Các trường gốc giữ lại nếu cần dùng
          medicalSupplyID: item.medicalSupplyID,
          supplyName: item.supplyName,
          dateAdded: item.dateAdded,
          storageTemperature: item.storageTemperature,
          reorderLevel: item.reorderLevel,
          categoryID: item.categoryID,
          quantityAvailable: item.quantityAvailable,
          categoryName: item.categoryName,
        }));
        setMedicalSupplies(mapped);
      } catch (error) {
        message.error('Không thể tải danh sách vật tư y tế');
      }
    };
    fetchSupplies();
  }, []);

  // Lấy dữ liệu đã lọc
  const filteredEvents = getFilteredEvents();

  // Add this useEffect to monitor events state changes
  useEffect(() => {
    console.log('Events state updated:', events);
  }, [events]);

  return (
    <div className="medical-management-app">
      <div className="app-header">
        <Title level={2} className="app-title">Quản lý Sự kiện Y tế</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="create-btn"
          onClick={handleOpenCreateModal}
        >
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Sự kiện gần đây */}
      <Card className="events-card" title="Sự kiện gần đây">
        <div className="filters-section custom-filters-section">
          <Row gutter={16} justify="center" align="middle" wrap={false}>
            <Col>
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ minWidth: 220 }}
                allowClear
              />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả loại sự kiện"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả loại sự kiện</Option>
                {eventTypeList.map(eventType => (
                  <Option key={eventType.eventTypeId} value={eventType.typeName}>
                    {eventType.typeName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Tất cả trạng thái"
                value={stateFilter}
                onChange={setStateFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="PROCESSING">Đang xử lý</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="PENDING">Chờ xử lý</Option>
                <Option value="DELETED">Đã xóa</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={eventColumns}
          dataSource={filteredEvents}
          pagination={{
            current: currentPage2,
            pageSize: 10,
            total: filteredEvents.length,
            onChange: (page) => setCurrentPage2(page),
            showSizeChanger: false,
            showQuickJumper: false
          }}
          className="events-table"
        />
      </Card>

      {/* Quản lý vật tư y tế */}
      <Card className="supplies-card" title="Danh sách vật tư y tế">
        <div className="filters-section custom-filters-section">
          <Row gutter={16} justify="space-between" align="middle">
            <Col flex="auto">
            <Input
              placeholder="Tìm kiếm vật tư..."
              prefix={<SearchOutlined />}
              value={searchSupplyText}
              onChange={(e) => setSearchSupplyText(e.target.value)}
              allowClear
            />
            </Col>
            <Col>
              <Select
                placeholder="Tất cả loại vật tư"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả loại vật tư</Option>
                <Option value="Bảo hộ">Bảo hộ</Option>
                <Option value="Dụng cụ">Dụng cụ</Option>
                <Option value="Băng gạc">Băng gạc</Option>
                <Option value="Khử trùng">Khử trùng</Option>
                <Option value="Thiết bị">Thiết bị</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={[
            {
              title: 'Tên vật tư',
              dataIndex: 'name',
              key: 'name',
              
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
             
              render: (text, record) => (
                <span>
                  {text} {record.unit}
                </span>
              )
            },
            {
              title: 'Loại vật tư',
              dataIndex: 'category',
              key: 'category',
             
              render: (text) => <Tag>{text}</Tag>
            },
          ]}
          dataSource={getFilteredSupplies()}
          pagination={false}
          className="events-table"
        />

        <div className="pagination-section">
          <Pagination
            current={currentPage3}
            total={getFilteredSupplies().length}
            pageSize={10}
            onChange={(page) => setCurrentPage3(page)}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      </Card>

      {/* Modal tạo sự kiện mới */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Tạo sự kiện y tế mới</span>}
        open={isModalVisible}
        onOk={handleCreateEvent}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Tạo sự kiện"
        cancelText="Hủy"
        maskClosable={false}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        afterOpenChange={(visible) => {
          if (!visible) {
            form.resetFields();
            setSelectedClass(null);
            setSelectedStudent(null);
            setStudents([]);
            setSelectedEventType(null);
            setSelectedSupplies([]);
          }
        }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            preserve={true}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="className"
                  label="Lớp"
                  rules={[{ required: true, message: 'Vui lòng chọn lớp' }]}
                  initialValue={undefined}
                >
                  <Select
                    placeholder="Chọn lớp"
                    onChange={handleClassChange}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="Lớp 5A">Lớp 5A</Option>
                    <Option value="Lớp 4B">Lớp 4B</Option>
                    <Option value="Lớp 3C">Lớp 3C</Option>
                    <Option value="Lớp 2A">Lớp 2A</Option>
                    <Option value="Lớp 1B">Lớp 1B</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="studentId"
                  label="Học sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
                >
                  <Select
                    placeholder="Chọn học sinh"
                    onChange={handleStudentChange}
                    disabled={!selectedClass}
                    loading={!selectedClass}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) => {
                      const studentName = option?.label?.toLowerCase() || '';
                      return studentName.includes(input.toLowerCase());
                    }}
                  >
                    {students && students.length > 0 ? (
                      students.map(student => (
                        <Option 
                          key={student.studentID} 
                          value={student.studentID}
                          label={`${student.fullName} - ${student.gender === 1 ? 'Nam' : 'Nữ'}`}
                        >
                          {student.fullName} - {student.gender === 1 ? 'Nam' : 'Nữ'}
                        </Option>
                      ))
                    ) : (
                      <Option disabled value="no-data">Không có dữ liệu học sinh</Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="typeName"
              label="Loại sự kiện"
              rules={[{ required: true, message: 'Vui lòng nhập loại sự kiện' }]}
            >
              <Select 
                placeholder="Chọn loại sự kiện" 
                allowClear
                onChange={(value, option) => {
                  const selectedType = eventTypeList.find(type => type.typeName === value);
                  setSelectedEventType(selectedType);
                }}
              >
                {eventTypeList.map(eventType => (
                  <Option key={eventType.eventTypeId} value={eventType.typeName}>
                    {eventType.typeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="temperature"
                  label={<span>Nhiệt độ () {temperatureWarning && <span style={{color:'red', marginLeft:8}}>{temperatureWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhiệt độ' },
                    { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        const num = Number(value);
                        if (!isPositiveNumber(num)) return Promise.reject('Nhiệt độ phải là số dương!');
                        if (isFever(num)) setTemperatureWarning('Sốt');
                        else if (isHypothermia(num)) setTemperatureWarning('Hạ thân nhiệt');
                        else setTemperatureWarning('');
                      return Promise.resolve();
                      }
                    }
                    
                  ]}
                >
                  <Input placeholder="Nhập nhiệt độ" onChange={e => {
                    const num = Number(e.target.value);
                    if (isFever(num)) setTemperatureWarning('Sốt');
                    else if (isHypothermia(num)) setTemperatureWarning('Hạ thân nhiệt');
                    else setTemperatureWarning('');
                  }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="heartRate"
                  label={<span>Nhịp tim {heartRateWarning && <span style={{color:'red', marginLeft:8}}>{heartRateWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhịp tim' },
                    { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        const num = Number(value);
                        if (!isPositiveNumber(num)) return Promise.reject('Nhịp tim phải là số dương!');
                        if (isTachycardia(num)) setHeartRateWarning('Nhịp nhanh');
                        else if (isBradycardia(num)) setHeartRateWarning('Nhịp chậm');
                        else setHeartRateWarning('');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input placeholder="Nhập nhịp tim" onChange={e => {
                    const num = Number(e.target.value);
                    if (isTachycardia(num)) setHeartRateWarning('Nhịp nhanh');
                    else if (isBradycardia(num)) setHeartRateWarning('Nhịp chậm');
                    else setHeartRateWarning('');
                  }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Ngày"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="time"
                  label="Giờ"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="emergency"
                  label="Tình trạng khẩn cấp"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hasParentBeenInformed"
                  label="Thông báo cho phụ huynh"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="usageMethod"
              label="Phương pháp xử lý"
              rules={[
                { 
                  validator: (_, value) => {
                    if (value === undefined || value === '') return Promise.resolve();
                    if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Phương pháp xử lý không quá 255 ký tự!');
                    if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="Nhập phương pháp xử lý" />
            </Form.Item>

            <Form.Item
              label="Vật tư y tế sử dụng"
              extra="Chọn vật tư y tế đã sử dụng cho sự kiện và nhập số lượng sử dụng."
            >
              <Select
                mode="multiple"
                placeholder="Chọn vật tư y tế sử dụng"
                value={selectedSupplies.map(s => s.medicalSupplyId)}
                onChange={ids => {
                  // Thêm mới các vật tư được chọn
                  const newSelected = ids.map(id => {
                    const existed = selectedSupplies.find(s => s.medicalSupplyId === id);
                    if (existed) return existed;
                    // Ưu tiên lấy tên từ medicalSupplies, nếu không có thì lấy từ selectedSupplies
                    const found = medicalSupplies.find(s => s.key === id);
                    if (found) {
                      return {
                        medicalSupplyId: found.key,
                        supplyName: found.name,
                        unit: found.unit,
                        quantityUsed: 1
                      };
                    }
                    // Nếu không tìm thấy trong medicalSupplies, lấy từ selectedSupplies (giữ supplyName cũ)
                    const existedOld = selectedSupplies.find(s => s.medicalSupplyId === id);
                    if (existedOld) return existedOld;
                    return null;
                  }).filter(Boolean);
                  setSelectedSupplies(newSelected);
                }}
                style={{ width: '100%' }}
                optionLabelProp="label"
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {selectedSupplies.map(supply => (
                  <Option key={supply.medicalSupplyId} value={supply.medicalSupplyId} label={supply.supplyName}>
                    {supply.supplyName} ({supply.unit})
                  </Option>
                ))}
                {/* Đảm bảo các vật tư mới cũng có thể chọn */}
                {medicalSupplies.filter(s => !selectedSupplies.find(sel => sel.medicalSupplyId === s.key)).map(supply => (
                  <Option key={supply.key} value={supply.key} label={supply.name}>
                    {supply.name} ({supply.unit})
                  </Option>
                ))}
              </Select>
              {/* Table nhập số lượng cho các vật tư đã chọn */}
              {selectedSupplies.length > 0 && (
                <Table
                  columns={[
                    { title: 'Tên vật tư', dataIndex: 'supplyName', key: 'supplyName' },
                    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
                    {
                      title: 'Số lượng sử dụng',
                      dataIndex: 'quantityUsed',
                      render: (val, record) => (
                        <InputNumber
                          min={1}
                          value={val}
                          onChange={v => {
                            setSelectedSupplies(prev => prev.map(s =>
                              s.medicalSupplyId === record.medicalSupplyId ? { ...s, quantityUsed: v } : s
                            ));
                          }}
                        />
                      )
                    },
                    {
                      title: '',
                      key: 'remove',
                      render: (_, record) => (
                        <Button type="link" danger onClick={() => {
                          setSelectedSupplies(prev => prev.filter(s => s.medicalSupplyId !== record.medicalSupplyId));
                        }}>Xóa</Button>
                      )
                    }
                  ]}
                  dataSource={selectedSupplies}
                  pagination={false}
                  rowKey="medicalSupplyId"
                  size="small"
                  style={{ marginTop: 12 }}
                />
              )}
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết sự kiện y tế</span>}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        width={800}
      >
        {selectedEvent && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Tên học sinh:</Typography.Text><br />
                <Typography.Text strong style={{ fontSize: 16 }}>{selectedEvent.fullName}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Lớp:</Typography.Text><br />
                <Typography.Text strong>{selectedEvent.className}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Loại sự kiện:</Typography.Text><br />
                <Typography.Text>{selectedEvent.eventTypeNames && selectedEvent.eventTypeNames.length > 0 ? selectedEvent.eventTypeNames[0] : selectedEvent.eventType}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thời gian:</Typography.Text><br />
                <Typography.Text>{formatDateTime(selectedEvent.eventDateTime)}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Trạng thái:</Typography.Text><br />
                <Tag color={
                  selectedEvent.processingStatus === 'COMPLETED' ? 'success' :
                  selectedEvent.processingStatus === 'PROCESSING' ? 'processing' :
                  selectedEvent.processingStatus === 'PENDING' ? 'error' :
                  selectedEvent.processingStatus === 'DELETED' ? 'default' : 'default'
                }>
                  {selectedEvent.processingStatus === 'COMPLETED' ? 'Hoàn thành' :
                   selectedEvent.processingStatus === 'PROCESSING' ? 'Đang xử lý' :
                   selectedEvent.processingStatus === 'PENDING' ? 'Chờ xử lí' :
                   selectedEvent.processingStatus === 'DELETED' ? 'Đã xóa' : 'Chưa xử lý'}
                </Tag>
              </Col>
              {selectedEvent.createdByNurseName && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Người tạo sự kiện:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.createdByNurseName}</Typography.Text>
                </Col>
              )}
              {selectedEvent.updatedByNurseName && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Người cập nhật cuối:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.updatedByNurseName}</Typography.Text>
                </Col>
              )}
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Khẩn cấp:</Typography.Text><br />
                <Tag color={selectedEvent.isEmergency || selectedEvent.emergency ? 'red' : 'default'}>
                  {(selectedEvent.isEmergency || selectedEvent.emergency) ? 'Có' : 'Không'}
                </Tag>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thông báo cho phụ huynh:</Typography.Text><br />
                <Tag color={selectedEvent.hasParentBeenInformed ? 'green' : 'default'}>
                  {selectedEvent.hasParentBeenInformed ? 'Đã thông báo' : 'Chưa thông báo'}
                </Tag>
              </Col>
              {selectedEvent.temperature && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Nhiệt độ:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.temperature}</Typography.Text>
                </Col>
              )}
              {selectedEvent.heartRate && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Nhịp tim:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.heartRate}</Typography.Text>
                </Col>
              )}
              {selectedEvent.usageMethod && (
                <Col span={12} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Phương pháp xử lý:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.usageMethod}</Typography.Text>
                </Col>
              )}
              {selectedEvent.note && (
                <Col span={24} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Ghi chú:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.note}</Typography.Text>
                </Col>
              )}
              {selectedEvent.result && (
                <Col span={24} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Kết quả xử lý:</Typography.Text><br />
                  <Typography.Text>{selectedEvent.result}</Typography.Text>
                </Col>
              )}
              {selectedEvent.listMedicalSupplies && selectedEvent.listMedicalSupplies.length > 0 && (
                <Col span={24} style={{ marginBottom: 6 }}>
                  <Typography.Text type="secondary" strong>Vật tư y tế sử dụng:</Typography.Text>
                  <ul>
                    {selectedEvent.listMedicalSupplies.map((supply, idx) => (
                      <li key={idx}>
                        {supply.supplyName} - {supply.quantityUsed} {supply.unit}
                      </li>
                    ))}
                  </ul>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chỉnh sửa sự kiện y tế</span>}
        open={isEditModalVisible}
        onOk={handleUpdateEvent}
        onCancel={handleCancelEdit}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
        maskClosable={false}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
        afterOpenChange={(visible) => {
          if (!visible) {
            editForm.resetFields();
            setSelectedClass(null);
            setSelectedStudent(null);
            setStudents([]);
          }
        }}
      >
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
          <Form
            form={editForm}
            layout="vertical"
            requiredMark={false}
            preserve={true}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="className"
                  label="Lớp"
                  rules={[{ required: true, message: 'Vui lòng chọn lớp' }]}
                  initialValue={undefined}
                >
                  <Select
                    placeholder="Chọn lớp"
                    onChange={handleClassChange}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="Lớp 5A">Lớp 5A</Option>
                    <Option value="Lớp 4B">Lớp 4B</Option>
                    <Option value="Lớp 3C">Lớp 3C</Option>
                    <Option value="Lớp 2A">Lớp 2A</Option>
                    <Option value="Lớp 1B">Lớp 1B</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="studentId"
                  label="Học sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
                >
                  <Select
                    placeholder="Chọn học sinh"
                    onChange={handleStudentChange}
                    disabled={!selectedClass}
                    loading={!selectedClass}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) => {
                      const studentName = option?.label?.toLowerCase() || '';
                      return studentName.includes(input.toLowerCase());
                    }}
                  >
                    {students && students.length > 0 ? (
                      students.map(student => (
                        <Option 
                          key={student.studentID} 
                          value={student.studentID}
                          label={`${student.fullName} - ${student.gender === 1 ? 'Nam' : 'Nữ'}`}
                        >
                          {student.fullName} - {student.gender === 1 ? 'Nam' : 'Nữ'}
                        </Option>
                      ))
                    ) : (
                      <Option disabled value="no-data">Không có dữ liệu học sinh</Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="typeName"
                  label="Loại sự kiện"
                  rules={[{ required: true, message: 'Vui lòng nhập loại sự kiện' }]}
                >
                  <Select 
                    placeholder="Chọn loại sự kiện" 
                    allowClear
                    onChange={(value, option) => {
                      const selectedType = eventTypeList.find(type => type.typeName === value);
                      setSelectedEventType(selectedType);
                    }}
                    value={editForm.getFieldValue('typeName')}
                    key={selectedEvent?.eventId || 'new'}
                  >
                    {eventTypeList.map(eventType => (
                      <Option key={eventType.eventTypeId} value={eventType.typeName}>
                        {eventType.typeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="processingStatus"
                  label="Trạng thái xử lý"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="PROCESSING">Đang xử lý</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="PENDING">Chờ xử lí</Option>
                    <Option value="DELETED">Đã xóa</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="temperature"
                  label={<span>Nhiệt độ {temperatureWarning && <span style={{color:'red', marginLeft:8}}>{temperatureWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhiệt độ' },
                    { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        const num = Number(value);
                        if (!isPositiveNumber(num)) return Promise.reject('Nhiệt độ phải là số dương!');
                        if (isFever(num)) setTemperatureWarning('Sốt');
                        else if (isHypothermia(num)) setTemperatureWarning('Hạ thân nhiệt');
                        else setTemperatureWarning('');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input placeholder="Nhập nhiệt độ" onChange={e => {
                    const num = Number(e.target.value);
                    if (isFever(num)) setTemperatureWarning('Sốt');
                    else if (isHypothermia(num)) setTemperatureWarning('Hạ thân nhiệt');
                    else setTemperatureWarning('');
                  }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="heartRate"
                  label={<span>Nhịp tim {heartRateWarning && <span style={{color:'red', marginLeft:8}}>{heartRateWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhịp tim' },
                    { validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        const num = Number(value);
                        if (!isPositiveNumber(num)) return Promise.reject('Nhịp tim phải là số dương!');
                        if (isTachycardia(num)) setHeartRateWarning('Nhịp nhanh');
                        else if (isBradycardia(num)) setHeartRateWarning('Nhịp chậm');
                        else setHeartRateWarning('');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input placeholder="Nhập nhịp tim" onChange={e => {
                    const num = Number(e.target.value);
                    if (isTachycardia(num)) setHeartRateWarning('Nhịp nhanh');
                    else if (isBradycardia(num)) setHeartRateWarning('Nhịp chậm');
                    else setHeartRateWarning('');
                  }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Ngày sự kiện"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="time"
                  label="Giờ sự kiện"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isEmergency"
                  label="Khẩn cấp"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hasParentBeenInformed"
                  label="Thông báo cho phụ huynh"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="usageMethod"
                  label="Phương pháp xử lý"
                  rules={[
                    { 
                      validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Phương pháp xử lý không quá 255 ký tự!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input placeholder="Nhập phương pháp xử lý" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Ghi chú"
                  rules={[
                    { 
                      validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Ghi chú không quá 255 ký tự!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="result"
                  label="Kết quả xử lý"
                  rules={[
                    { 
                      validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Kết quả không quá 255 ký tự!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Không được nhập ký tự đặc biệt!');
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input.TextArea rows={3} placeholder="Nhập kết quả xử lý" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Vật tư y tế sử dụng"
                  extra="Chọn vật tư y tế đã sử dụng cho sự kiện và nhập số lượng sử dụng."
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn vật tư y tế sử dụng"
                    value={selectedSupplies.map(s => s.medicalSupplyId)}
                    onChange={ids => {
                      // Thêm mới các vật tư được chọn
                      const newSelected = ids.map(id => {
                        const existed = selectedSupplies.find(s => s.medicalSupplyId === id);
                        if (existed) return existed;
                        // Ưu tiên lấy tên từ medicalSupplies, nếu không có thì lấy từ selectedSupplies
                        const found = medicalSupplies.find(s => s.key === id);
                        if (found) {
                          return {
                            medicalSupplyId: found.key,
                            supplyName: found.name,
                            unit: found.unit,
                            quantityUsed: 1
                          };
                        }
                        // Nếu không tìm thấy trong medicalSupplies, lấy từ selectedSupplies (giữ supplyName cũ)
                        const existedOld = selectedSupplies.find(s => s.medicalSupplyId === id);
                        if (existedOld) return existedOld;
                        return null;
                      }).filter(Boolean);
                      setSelectedSupplies(newSelected);
                    }}
                    style={{ width: '100%' }}
                    optionLabelProp="label"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {selectedSupplies.map(supply => (
                      <Option key={supply.medicalSupplyId} value={supply.medicalSupplyId} label={supply.supplyName}>
                        {supply.supplyName} ({supply.unit})
                      </Option>
                    ))}
                    {/* Đảm bảo các vật tư mới cũng có thể chọn */}
                    {medicalSupplies.filter(s => !selectedSupplies.find(sel => sel.medicalSupplyId === s.key)).map(supply => (
                      <Option key={supply.key} value={supply.key} label={supply.name}>
                        {supply.name} ({supply.unit})
                      </Option>
                    ))}
                  </Select>
                  {/* Table nhập số lượng cho các vật tư đã chọn */}
                  {selectedSupplies.length > 0 && (
                    <Table
                      columns={[
                        { title: 'Tên vật tư', dataIndex: 'supplyName', key: 'supplyName' },
                        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
                        {
                          title: 'Số lượng sử dụng',
                          dataIndex: 'quantityUsed',
                          render: (val, record) => (
                            <InputNumber
                              min={1}
                              value={val}
                              onChange={v => {
                                setSelectedSupplies(prev => prev.map(s =>
                                  s.medicalSupplyId === record.medicalSupplyId ? { ...s, quantityUsed: v } : s
                                ));
                              }}
                            />
                          )
                        },
                        {
                          title: '',
                          key: 'remove',
                          render: (_, record) => (
                            <Button type="link" danger onClick={() => {
                              setSelectedSupplies(prev => prev.filter(s => s.medicalSupplyId !== record.medicalSupplyId));
                            }}>Xóa</Button>
                          )
                        }
                      ]}
                      dataSource={selectedSupplies}
                      pagination={false}
                      rowKey="medicalSupplyId"
                      size="small"
                      style={{ marginTop: 12 }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>

    </div>
  );
};

export default App;