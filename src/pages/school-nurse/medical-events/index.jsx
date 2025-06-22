import React, { useState, useEffect } from 'react';
import {
  Table,
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
  Switch
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
import {
  createEmergencyEvent,
  updateMedicalEvent,
  getAllMedicalEvents,
  fetchStudentsByClass,
  getEventDetailsByEndpoint,
  getEventNames,
} from '/src/api/medicalEventsAPI.js';

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
  const [addSupplyForm] = Form.useForm();
  const [isAddSupplyModalVisible, setIsAddSupplyModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [eventTypeList, setEventTypeList] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState(null);

  //Dự liệu mẫu cho sự kiện y tế
  const [events, setEvents] = useState([]);

  // Dữ liệu mẫu cho vật tư y tế
  const [medicalSupplies, setMedicalSupplies] = useState([
    {
      key: '1',
      name: 'Khẩu trang y tế',
      quantity: 1200,
      unit: 'cái',
      status: 'normal',
      category: 'Bảo hộ'
    },
    {
      key: '2',
      name: 'Găng tay latex',
      quantity: 50,
      unit: 'hộp',
      status: 'low',
      statusText: 'Sắp hết',
      category: 'Bảo hộ'
    },
    {
      key: '3',
      name: 'Ống tiêm 5ml',
      quantity: 5,
      unit: 'hộp',
      status: 'critical',
      statusText: 'Cần đặt gấp',
      category: 'Dụng cụ'
    },
  ]);

  const eventColumns = [
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 150,
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 150,
      render: (type) => (
        <Tag color="red">{type}</Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 180,
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
      width: 120,
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
      fixed: 'right',
      width: 120,
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
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      
      render: (status) => {
        switch (status) {
          case 'critical':
            return <Tag color="red">Cấp bách</Tag>;
          case 'low':
            return <Tag color="orange">Thấp</Tag>;
          default:
            return <Tag color="green">Bình thường</Tag>;
        }
      }
    },
    {
      title: 'Hành động',
      key: 'action',
     
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSupply(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  //trạng thái vật tư
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'critical-status';
      case 'low':
        return 'low-status';
      default:
        return 'normal-status';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return <Tag color="red">Cấp bách</Tag>;
      case 'low':
        return <Tag color="orange">Thấp</Tag>;
      default:
        return <Tag color="green">Bình thường</Tag>;
    }
  };

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
          isEmergency: values?.isEmergency || false,
          emergency: values?.emergency || false,
          hasParentBeenInformed: values?.hasParentBeenInformed || false,
          temperature: values?.temperature || '',
          heartRate: values?.heartRate || '',
          eventDateTime: eventDateTime,
          usageMethod: values?.usageMethod || '',
          eventTypeId: selectedEventType.eventTypeId,
          note: values?.note || '',
          result: values?.result || '',
          processingStatus: 'PENDING',
          nurseId,
          nurseName,
          updatedByNurseId,
          updatedByNurseName
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
          nurseName
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
            processingStatus: 'COMPLETED'
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

  const showAddSupplyModal = () => {
    setIsAddSupplyModalVisible(true);
    addSupplyForm.resetFields();
  };
  //Hàm thêm vật tư 
  const handleAddSupply = () => {
    addSupplyForm.validateFields()
      .then(values => {
        const newSupply = {
          key: String(medicalSupplies.length + 1), // Simple key generation
          name: values.name,
          quantity: values.quantity,
          unit: values.unit,
          category: values.category,
          status: values.quantity <= 10 ? 'critical' : (values.quantity <= 50 ? 'low' : 'normal'), // Basic status logic
          statusText: values.quantity <= 10 ? 'Cần đặt gấp' : (values.quantity <= 50 ? 'Sắp hết' : null),
        };
        setMedicalSupplies(prevSupplies => [...prevSupplies, newSupply]);
        message.success('Thêm vật tư thành công!');
        setIsAddSupplyModalVisible(false);
        addSupplyForm.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        message.error('Vui lòng điền đầy đủ thông tin cần thiết.');
      });
  };

  const handleCancelAddSupply = () => {
    setIsAddSupplyModalVisible(false);
    addSupplyForm.resetFields();
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
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Quản lý vật tư y tế */}
      <Card className="supplies-card" title="Quản lý vật tư y tế">
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
            <Col>
              <Select
                placeholder="Tất cả trạng thái"
                value={supplyStatusFilter}
                onChange={setSupplyStatusFilter}
                style={{ minWidth: 170 }}
                allowClear
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="normal">Bình thường</Option>
                <Option value="low">Sắp hết</Option>
                <Option value="critical">Cấp bách</Option>
              </Select>
            </Col>
            <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddSupplyModal}>
            Thêm vật tư
          </Button>
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
            {
              title: 'Trạng thái',
              dataIndex: 'status',
          
              render: (status) => {
                switch (status) {
                  case 'critical':
                    return <Tag color="red">Cấp bách</Tag>;
                  case 'low':
                    return <Tag color="orange">Sắp hết</Tag>;
                  default:
                    return <Tag color="green">Bình thường</Tag>;
                }
              }
            },
            {
              title: 'Hành động',
              key: 'action',
              
              render: (_, record) => (
                <Space size="middle">
                  <Tooltip title="Xem chi tiết">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => handleViewSupplyDetails(record)}
                    />
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEditSupply(record)}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
          dataSource={getFilteredSupplies()}
          pagination={false}
          className="events-table"
          scroll={{ x: 'max-content' }}
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
        title="Tạo sự kiện y tế khẩn cấp"
        open={isModalVisible}
        onOk={handleCreateEvent}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedClass(null);
          setSelectedStudent(null);
          setStudents([]);
        }}
        width={800}
        okText="Tạo sự kiện"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
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
                  <Option value="Lớp 1B">Lớp 1B</Option>
                  <Option value="Lớp 2A">Lớp 2A</Option>
                  <Option value="Lớp 3C">Lớp 3C</Option>
                  <Option value="Lớp 4B">Lớp 4B</Option>
                  <Option value="Lớp 5A">Lớp 5A</Option>
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
                label="Nhiệt độ"
              >
                <Input placeholder="Nhập nhiệt độ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="heartRate"
                label="Nhịp tim"
              >
                <Input placeholder="Nhập nhịp tim" />
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
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hasParentBeenInformed"
                label="Đã thông báo phụ huynh"
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
          >
            <Input placeholder="Nhập phương pháp xử lý" />
          </Form.Item>

          {/* Ẩn phần ghi chú và kết quả xử lý khi tạo sự kiện mới
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú chi tiết về sự kiện y tế..." />
          </Form.Item>
          <Form.Item name="result" label="Kết quả xử lý">
            <TextArea rows={3} placeholder="Nhập kết quả xử lý..." />
          </Form.Item>
          */}
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết sự kiện y tế"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEvent && (
          <div className="event-details">
            <div className="detail-item">
              <span className="label">ID Sự kiện:</span>
              <span className="value">{selectedEvent.eventId}</span>
            </div>
            <div className="detail-item">
              <span className="label">ID Học sinh:</span>
              <span className="value">{selectedEvent.studentId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Tên học sinh:</span>
              <span className="value">{selectedEvent.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Lớp:</span>
              <span className="value">{selectedEvent.className}</span>
            </div>
            <div className="detail-item">
              <span className="label">Giới tính:</span>
              <span className="value">{selectedEvent.gender === 1 ? 'Nam' : 'Nữ'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Loại sự kiện:</span>
              <div className="value">
                {selectedEvent.eventTypeNames && selectedEvent.eventTypeNames.map((type, index) => (
                  <Tag key={index} color="red">{type}</Tag>
                ))}
              </div>
            </div>
            <div className="detail-item">
              <span className="label">Thời gian:</span>
              <span className="value">{moment(selectedEvent.eventDateTime).format('HH:mm, DD/MM/YYYY')}</span>
            </div>
            <div className="detail-item">
              <span className="label">Trạng thái:</span>
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
            </div>
           
            {selectedEvent.createdByNurseName && (
              <div className="detail-item">
                <span className="label">Người tạo sự kiện: </span>
                <span className="value">{selectedEvent.createdByNurseName}</span>
              </div>
            )}
            {selectedEvent.updatedByNurseName && (
              <div className="detail-item">
                <span className="label">Người cập nhật cuối: </span>
                <span className="value">{selectedEvent.updatedByNurseName}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="label">Khẩn cấp:</span>
              <Tag color={selectedEvent.isEmergency || selectedEvent.emergency ? 'red' : 'default'}>
                {(selectedEvent.isEmergency || selectedEvent.emergency) ? 'Có' : 'Không'}
              </Tag>
            </div>
            <div className="detail-item">
              <span className="label">Đã thông báo PH:</span>
              <Tag color={selectedEvent.hasParentBeenInformed ? 'green' : 'default'}>
                {selectedEvent.hasParentBeenInformed ? 'Đã thông báo' : 'Chưa thông báo'}
              </Tag>
            </div>
            {selectedEvent.temperature && (
              <div className="detail-item">
                <span className="label">Nhiệt độ:</span>
                <span className="value">{selectedEvent.temperature}</span>
              </div>
            )}
            {selectedEvent.heartRate && (
              <div className="detail-item">
                <span className="label">Nhịp tim:</span>
                <span className="value">{selectedEvent.heartRate}</span>
              </div>
            )}
            {selectedEvent.usageMethod && (
              <div className="detail-item">
                <span className="label">Phương pháp xử lý:</span>
                <span className="value">{selectedEvent.usageMethod}</span>
              </div>
            )}
            {selectedEvent.note && (
              <div className="detail-item">
                <span className="label">Ghi chú:</span>
                <div className="value description">{selectedEvent.note}</div>
              </div>
            )}
            {selectedEvent.result && (
              <div className="detail-item">
                <span className="label">Kết quả xử lý:</span>
                <div className="value description">{selectedEvent.result}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa sự kiện y tế"
        open={isEditModalVisible}
        onOk={handleUpdateEvent}
        onCancel={handleCancelEdit}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
        maskClosable={false}
        afterOpenChange={(visible) => {
          if (!visible) {
            editForm.resetFields();
            setSelectedClass(null);
            setSelectedStudent(null);
            setStudents([]);
          }
        }}
      >
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
                  <Option value="Lớp 4A">Lớp 4A</Option>
                  <Option value="Lớp 4B">Lớp 4B</Option>
                  <Option value="Lớp 4C">Lớp 4C</Option>
                  <Option value="Lớp 5A">Lớp 5A</Option>
                  <Option value="Lớp 5B">Lớp 5B</Option>
                  <Option value="Lớp 5C">Lớp 5C</Option>
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
                label="Nhiệt độ"
              >
                <Input placeholder="Nhập nhiệt độ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="heartRate"
                label="Nhịp tim"
              >
                <Input placeholder="Nhập nhịp tim" />
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
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hasParentBeenInformed"
                label="Đã thông báo phụ huynh"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="usageMethod"
            label="Phương pháp xử lý"
          >
            <Input placeholder="Nhập phương pháp xử lý" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Ghi chú"
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập ghi chú chi tiết về sự kiện y tế..."
            />
          </Form.Item>

          <Form.Item
            name="result"
            label="Kết quả xử lý"
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập kết quả xử lý..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm Vật Tư Mới"
        open={isAddSupplyModalVisible}
        onOk={handleAddSupply}
        onCancel={handleCancelAddSupply}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
      >
        <Form
          form={addSupplyForm}
          layout="vertical"
          name="add_supply_form"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Tên Vật Tư"
            rules={[{ required: true, message: 'Vui lòng nhập tên vật tư!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số Lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }, { min: 1, message: 'Số lượng phải là số dương!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn Vị"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Loại Vật Tư"
            rules={[{ required: true, message: 'Vui lòng chọn loại vật tư!' }]}
          >
            <Select placeholder="Chọn loại vật tư">
              <Option value="Bảo hộ">Bảo hộ</Option>
              <Option value="Dụng cụ">Dụng cụ</Option>
              <Option value="Băng gạc">Băng gạc</Option>
              <Option value="Khử trùng">Khử trùng</Option>
              <Option value="Thiết bị">Thiết bị</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết vật tư */}
      <Modal
        title="Chi tiết vật tư y tế"
        open={isSupplyViewModalVisible}
        onCancel={() => setIsSupplyViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSupply && (
          <div className="event-details">
            <div className="detail-item">
              <span className="label">Tên vật tư:</span>
              <span className="value">{selectedSupply.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Số lượng:</span>
              <span className="value">{selectedSupply.quantity} {selectedSupply.unit}</span>
            </div>
            <div className="detail-item">
              <span className="label">Loại vật tư:</span>
              <Tag>{selectedSupply.category}</Tag>
            </div>
            <div className="detail-item">
              <span className="label">Trạng thái:</span>
              {selectedSupply.status === 'critical' && <Tag color="red">Cấp bách</Tag>}
              {selectedSupply.status === 'low' && <Tag color="orange">Sắp hết</Tag>}
              {selectedSupply.status === 'normal' && <Tag color="green">Bình thường</Tag>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;