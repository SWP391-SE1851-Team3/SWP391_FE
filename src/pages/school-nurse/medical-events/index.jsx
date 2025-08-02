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
import { isPositiveNumber, isStringLengthInRange, hasNoSpecialCharacters, isOnlyWhitespace } from '../../../validations';
import { isFever, isHypothermia, isTachycardia, isBradycardia } from '../../../validations';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchSupplyText, setSearchSupplyText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [eventTypeList, setEventTypeList] = useState([]);
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
      render: (eventType) => {
        // eventType là mảng chuỗi
        if (Array.isArray(eventType)) {
          return eventType.map((name, idx) => (
            <Tag color="red" key={idx} style={{ display: 'block', marginBottom: 2 }}>
              {name}
            </Tag>
          ));
        }
        // Nếu không phải mảng, fallback về chuỗi
        return <Tag color="red">{eventType}</Tag>;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text) => {
        if (!text) return '-';
        const date = moment(text, 'HH:mm, DD/MM/YYYY');
        if (!date.isValid()) {
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
        const currentStatus = status || record.processingStatus || 'Chờ xử lí';
        switch (currentStatus) {
          case 'Đang xử lí':
            color = 'processing';
            text = 'Đang xử lí';
            break;
          case 'Hoàn thành':
            color = 'success';
            text = 'Hoàn thành';
            break;
          case 'Chờ xử lí':
            color = 'error';
            text = 'Chờ xử lí';
            break;
        }
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

  // Hàm lọc dữ liệu
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Lọc theo từ khóa tìm kiếm
      const searchLower = searchText.toLowerCase();
      const matchesSearch = searchText === '' ||
        (event.studentName && event.studentName.toLowerCase().includes(searchLower)) ||
        (event.eventType && Array.isArray(event.eventType) &&
         event.eventType.some(type =>
           (typeof type === 'string' ? type : (type.typeName || type)).toLowerCase().includes(searchLower)
         )) ||
        (event.time && moment(event.time).format('DD/MM/YYYY HH:mm').toLowerCase().includes(searchLower)) ||
        (event.processingStatus && event.processingStatus.toLowerCase().includes(searchLower));

      // Lọc theo loại sự kiện
      const matchesStatus = statusFilter === '' ||
        (
          (event.eventTypeNames && Array.isArray(event.eventTypeNames) &&
            event.eventTypeNames.some(type =>
              (type.typeName || type).toLowerCase() === statusFilter.toLowerCase()
            )
          ) ||
          (event.eventType && Array.isArray(event.eventType) &&
            event.eventType.some(type =>
              (typeof type === 'string' ? type : (type.typeName || type)).toLowerCase() === statusFilter.toLowerCase()
            )
          )
        );

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

      return matchesSearch && matchesCategory;
    });
  };

  // Xử lý tạo sự kiện mới
  const handleCreateEvent = () => {
    form.validateFields().then(async values => {
      try {
        if (!values.typeName || values.typeName.length === 0) {
          message.error('Vui lòng chọn loại sự kiện');
          return;
        }
        if (!values.studentId || values.studentId.length === 0) {
          message.error('Vui lòng chọn học sinh');
          return;
        }
        // Lấy thông tin nurse từ localStorage
        const nurseId = localStorage.getItem('userId') || '';
        const nurseName = localStorage.getItem('nurseName') || localStorage.getItem('fullName') || localStorage.getItem('email') || '';

        // Convert date string to proper format using moment
        const dateObj = values.date; // DatePicker returns a moment object
        const timeObj = values.time;
        const eventDateTime = dateObj.format('YYYY-MM-DD') + 'T' + timeObj.format('HH:mm:ss.SSS') + 'Z';

        // Map selectedSupplies to API format
        const mappedSupplies = selectedSupplies.map(supply => ({
          medicalSupplyId: supply.medicalSupplyId || supply.key,
          supplyName: supply.supplyName || supply.name,
          unit: supply.unit,
          quantityUsed: supply.quantityUsed || 1
        }));

        // Lấy danh sách loại sự kiện
        const selectedTypes = eventTypeList.filter(type => values.typeName.includes(type.typeName));
        const listMedicalEventTypes = selectedTypes.map(type => ({
          eventTypeId: type.eventTypeId,
          typeName: type.typeName
        }));

        const eventData = {
          eventId: values?.eventId,
          usageMethod: values?.usageMethod || '',
          isEmergency: values?.isEmergency || 'Bình thường',
          hasParentBeenInformed: values?.hasParentBeenInformed || false,
          temperature: values?.temperature || '',
          heartRate: values?.heartRate || '',
          eventDateTime: eventDateTime,
          parentID: values.studentId.map(id => {
            const student = students.find(s => s.studentID === id);
            return student ? student.parentID : 0;
          }),
          studentId: values.studentId,
          nurseId: parseInt(nurseId),
          nurseName: nurseName,
          note: values?.note || '',
          result: values?.result || '',
          processingStatus: 'Chờ xử lí',
          listMedicalEventTypes,
          medicalSupplies: mappedSupplies
        };

        await createEmergencyEvent(eventData);
        message.success('Tạo sự kiện khẩn cấp thành công!');
        // Gọi lại loadEvents để cập nhật danh sách sự kiện
        if (typeof loadEvents === 'function') {
          await loadEvents();
        }

        setIsModalVisible(false);
        form.resetFields();
        setSelectedClass(null);
        setStudents([]);
        setSelectedSupplies([]);
      } catch (error) {
        console.error('Error creating emergency event:', error);
        message.error(getErrorMessage(error));
      }
    });
  };

  // Xử lý xem chi tiết
  const handleViewDetails = async (record) => {
    try {
      const eventDetails = await getEventDetailsByEndpoint(record.eventDetailsID);
      setSelectedEvent(eventDetails);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error('Error loading event details:', error);
      message.error(getErrorMessage(error));
    }
  };

  // Xử lý cập nhật sự kiện
  const handleUpdateEvent = () => {
    editForm.validateFields().then(async values => {
      try {
        // Lấy nurseId và nurseName từ localStorage
        const nurseId = localStorage.getItem('userId') || '';
        const nurseName = localStorage.getItem('fullname') || '';

        // Convert date string to proper format using moment
        const dateObj = values.date; // DatePicker returns a moment object
        const timeObj = values.time;
        const eventDateTime = dateObj.format('YYYY-MM-DD') + 'T' + timeObj.format('HH:mm:ss.SSS') + 'Z';

        // Build eventData according to the new API structure
        const eventData = {
          usageMethod: values.usageMethod || '',
          isEmergency: values.isEmergency || 'Bình thường',
          hasParentBeenInformed: values.hasParentBeenInformed || false,
          temperature: values.temperature || '',
          heartRate: values.heartRate || '',
          eventDateTime: eventDateTime,
          nurseId,
          studentId: Array.isArray(values.studentId) ? values.studentId[0] : values.studentId, // API expects a single ID
          note: values.description,
          result: values.result,
          processingStatus: 'Hoàn thành',
          nurseName,
          listMedicalEventTypes: (Array.isArray(values.typeName) ? values.typeName : []).map(typeName => {
            const found = eventTypeList.find(t => t.typeName === typeName);
            return found ? { eventTypeId: found.eventTypeId, typeName: found.typeName } : { eventTypeId: null, typeName };
          }),
          medicalSupplies: Array.isArray(selectedSupplies) ? selectedSupplies.map(s => ({
            medicalSupplyId: s.medicalSupplyId,
            supplyName: s.supplyName,
            unit: s.unit,
            quantityUsed: s.quantityUsed || 1
          })) : []
        };

        // Ensure eventId is present in eventData
        let eventIdToUse = selectedEvent.eventId;
        if (!eventIdToUse) {
          // Try to get from editForm or events list
          const formEventId = editForm.getFieldValue('eventId');
          if (formEventId) {
            eventIdToUse = formEventId;
          } else {
            // Try to find in events list by eventDetailsID
            const found = events.find(e => e.eventDetailsID === selectedEvent.eventDetailsID);
            if (found && found.eventId) {
              eventIdToUse = found.eventId;
            }
          }
        }
        eventData.eventId = eventIdToUse;

        // Always use the correct eventDetailsId for update
        const eventDetailsId = selectedEvent.eventDetailsID || selectedEvent.evenDetailsId;
        if (!eventDetailsId) {
          message.error('Không tìm thấy eventDetailsID để cập nhật!');
          return;
        }
        // Try eventId first, then fallback to eventDetailsID/evenDetailsId
        let updateId = selectedEvent.eventId;
        if (!updateId) {
          updateId = selectedEvent.eventDetailsID || selectedEvent.evenDetailsId;
        }
        if (!updateId) {
          message.error('Không tìm thấy ID để cập nhật!');
          return;
        }
        await updateMedicalEvent(updateId, eventData);
        message.success('Cập nhật sự kiện y tế thành công!');

        // Reload all events data to reflect changes from backend
        try {
          const eventsData = await getAllMedicalEvents();
          const transformedEvents = eventsData.map(event => ({
            key: event.eventDetailsID,
            eventId: event.eventId,
            eventDetailsID: event.eventDetailsID,
            studentName: event.studentName,
            eventType: Array.isArray(event.eventType) ? event.eventType : [event.eventType],
            time: event.time,
            status: event.processingStatus || 'PROCESSING',
            processingStatus: event.processingStatus || 'PROCESSING',
            actions: event.actions || ''
          }));
          setEvents(transformedEvents);
        } catch (error) {
          console.error('Error reloading events:', error);
          message.error(getErrorMessage(error));
        }

        setIsEditModalVisible(false);
        editForm.resetFields();
        setSelectedEvent(null); // Reset selected event after successful update
      } catch (error) {
        console.error('Error updating event:', error);
        message.error(getErrorMessage(error));
      }
    });
  };

  // UseEffect to populate edit form when modal becomes visible and data is available
  useEffect(() => {
    if (isEditModalVisible && selectedEvent) {
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
        processingStatus: 'Hoàn thành',
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
      const eventDetails = await getEventDetailsByEndpoint(record.eventDetailsID);
      // Ensure both eventDetailsID and evenDetailsId are available for compatibility
      setSelectedEvent({
        ...eventDetails,
        eventDetailsID: eventDetails.eventDetailsID || eventDetails.evenDetailsId,
        evenDetailsId: eventDetails.evenDetailsId || eventDetails.eventDetailsID,
        medicalSupplies: eventDetails.medicalSupplies || eventDetails.listMedicalSupplies || [],
      });
      // Fetch students for the class associated with the event
      let studentsData = [];
      if (eventDetails.className) {
        try {
          studentsData = await fetchStudentsByClass(eventDetails.className);
          setStudents(studentsData); // Populate students for the dropdown
        } catch (error) {
          console.error('Error fetching students for pre-selected class in edit:', error);
          message.error(getErrorMessage(error));
        }
      } else {
        setStudents([]); // Clear students if no class
      }
      // Find the pre-selected student from the fetched list
      const preSelectedStudent = studentsData.find(s => s.studentID === eventDetails.studentId);
      if (preSelectedStudent) {
        // setSelectedStudent(preSelectedStudent); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
      } else {
        // setSelectedStudent(null); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
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
      message.error(getErrorMessage(error));
    }
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    // setSelectedEventType(null); // Reset selectedEventType on cancel
  };

  // Hàm xử lý khi chọn học sinh
  const handleStudentChange = (value) => {
    // value là mảng studentID khi dùng mode="multiple"
    form.setFieldsValue({
      studentId: value
    });
  };

  // Hàm xử lý khi chọn lớp
  const handleClassChange = async (className) => {
    setSelectedClass(className);
    // setSelectedStudent(null); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
    form.setFieldsValue({
      studentId: undefined,
      parentId: undefined
    });

    if (className) {
      try {
        const studentsData = await fetchStudentsByClass(className);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
        message.error(getErrorMessage(error));
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
    // setSelectedStudent(null); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
    setStudents([]);
    setSelectedSupplies([]);
  };

  // Đưa loadEvents ra ngoài để có thể gọi lại sau khi tạo sự kiện
  const loadEvents = async () => {
    try {
      const eventsData = await getAllMedicalEvents();
      
      // Transform the data to match the new structure for the table
      const transformedEvents = eventsData.map(event => {
        return {
          key: event.eventDetailsID,
          eventId: event.eventId,
          eventDetailsID: event.eventDetailsID,
          studentName: event.studentName,
          eventType: Array.isArray(event.eventType) ? event.eventType : [event.eventType],
          time: event.time,
          status: event.processingStatus || 'PROCESSING',
          processingStatus: event.processingStatus || 'PROCESSING',
          isEmergency: event.isEmergency || 'Bình thường',
          actions: event.actions || ''
        };
      });

      // Sort events by time in descending order (newest first)
      transformedEvents.sort((a, b) => {
        const timeA = moment(a.time);
        const timeB = moment(b.time);
        return timeB - timeA;
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      message.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadEvents();

    const loadEventNames = async () => {
      try {
        const names = await getEventNames();
        setEventTypeList(names);
      } catch (error) {
        console.error('Error loading event names:', error);
        message.error(getErrorMessage(error));
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
        message.error(getErrorMessage(error));
      }
    };
    fetchSupplies();
  }, []);

  // Lấy dữ liệu đã lọc
  const filteredEvents = getFilteredEvents();

  // Thêm hàm kiểm tra ngày không cho chọn ngày trong quá khứ
  const disabledPastDate = (current) => {
    return current && current < moment().startOf('day');
  };

  // Hàm xác định className cho từng hàng dựa trên mức độ nghiêm trọng
  const getRowClassName = (record) => {
    if (record.isEmergency === 'Nặng') {
      return 'emergency-row';
    }
    return '';
  };

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
            
                <Option value="Hoàn thành">Hoàn thành</Option>
                <Option value="Chờ xử lí">Chờ xử lí</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={eventColumns}
          dataSource={filteredEvents}
          pagination={{ pageSize: 5 }}
          className="events-table"
          rowKey={record => `${record.eventDetailsID}-${record.eventId}`}
          rowClassName={getRowClassName}
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
                <Option value="Dụng cụ y tế">Dụng cụ y tế</Option>
                <Option value="Thuốc kháng sinh">Thuốc kháng sinh</Option>
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
            // setSelectedStudent(null); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
            setStudents([]);
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
                    mode="multiple"
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
                  rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn học sinh' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn học sinh"
                    value={Array.isArray(form.getFieldValue('studentId')) ? form.getFieldValue('studentId') : []}
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
                      [...students].sort((a, b) => {
                        if (a.className < b.className) return -1;
                        if (a.className > b.className) return 1;
                        return 0;
                      }).map(student => (
                        <Option
                          key={student.studentID}
                          value={student.studentID}
                          label={`${student.fullName} - ${student.className} `}
                        >
                          {student.fullName} - {student.className}
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
                mode="multiple"
                placeholder="Chọn loại sự kiện"
                allowClear
                value={Array.isArray(form.getFieldValue('typeName')) ? form.getFieldValue('typeName') : []}
                onChange={() => { }}
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
                  name="date"
                  label="Ngày"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker style={{ width: '100%' }} disabledDate={disabledPastDate} />
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
                  label="Mức độ nghiêm trọng"
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
                    if (isOnlyWhitespace(value)) return Promise.reject('Phương pháp xử lý không được để khoảng trắng đầu dòng!');
                    if (!hasNoSpecialCharacters(value)) return Promise.reject('Phương pháp xử lý không được nhập ký tự đặc biệt!');
                    if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Phương pháp xử lý không quá 255 ký tự!');
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
                value={Array.isArray(selectedSupplies) ? selectedSupplies.map(s => s.medicalSupplyId) : []}
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
                <Typography.Text type="secondary" strong>Giới tính:</Typography.Text><br />
                <Typography.Text>{selectedEvent.gender === 1 ? 'Nam' : selectedEvent.gender === 2 ? 'Nữ' : 'Khác'}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Thời gian:</Typography.Text><br />
                <Typography.Text>{formatDateTime(selectedEvent.eventDateTime)}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Trạng thái:</Typography.Text><br />
                <Tag color={
                  selectedEvent.processingStatus === 'Hoàn thành' ? 'success' :
                    selectedEvent.processingStatus === 'Đang xử lí' ? 'processing' :
                      selectedEvent.processingStatus === 'Đã xóa' ? 'default' : 'error'
                }>
                  {selectedEvent.processingStatus === 'Hoàn thành' ? 'Hoàn thành' :
                    selectedEvent.processingStatus === 'Đang xử lí' ? 'Đang xử lí' :
                      selectedEvent.processingStatus === 'Đã xóa' ? 'Đã xóa' : 'Chờ xử lí'}
                </Tag>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Loại sự kiện:</Typography.Text><br />
                <Typography.Text>
                  {Array.isArray(selectedEvent.eventTypeNames) && selectedEvent.eventTypeNames.length > 0
                    ? selectedEvent.eventTypeNames.map((name, idx) => (
                      <Tag color="red" key={idx} style={{ display: 'block', marginBottom: 4 }}>
                        {name}
                      </Tag>
                    ))
                    : selectedEvent.eventType}
                </Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Người tạo sự kiện:</Typography.Text><br />
                <Typography.Text>{selectedEvent.createdByNurseName}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Người cập nhật cuối:</Typography.Text><br />
                <Typography.Text>{selectedEvent.updatedByNurseName}</Typography.Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" strong>Mức độ nghiêm trọng:</Typography.Text><br />
                <Tag color={
                  selectedEvent.isEmergency === 'Nặng' ? 'red' : 
                  selectedEvent.isEmergency === 'Bình thường' ? 'orange' : 
                  selectedEvent.isEmergency === 'Nhẹ' ? 'green' : 'default'
                }>
                  {selectedEvent.isEmergency || 'Bình thường'}
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
            // setSelectedStudent(null); // XÓA TẤT CẢ các dòng gọi setSelectedStudent
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
                    mode="multiple"
                    placeholder="Chọn lớp"
                    onChange={handleClassChange}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    disabled
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
                    mode="multiple"
                    placeholder="Chọn học sinh"
                    value={Array.isArray(editForm.getFieldValue('studentId')) ? editForm.getFieldValue('studentId') : []}
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
                      [...students].sort((a, b) => {
                        if (a.className < b.className) return -1;
                        if (a.className > b.className) return 1;
                        return 0;
                      }).map(student => (
                        <Option
                          key={student.studentID}
                          value={student.studentID}
                          label={`${student.fullName} - ${student.className} - ${student.gender === 1 ? 'Nam' : 'Nữ'}`}
                        >
                          {student.fullName} - {student.className} - {student.gender === 1 ? 'Nam' : 'Nữ'}
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
                  name="temperature"
                  label={<span>Nhiệt độ (°C)  {temperatureWarning && <span style={{ color: 'red', marginLeft: 8 }}>{temperatureWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhiệt độ' },
                    {
                      validator: (_, value) => {
                        if (value === undefined || value === '') {
                          setTemperatureWarning('');
                          return Promise.resolve();
                        }
                        const num = Number(value);
                        if (isNaN(num)) {
                          setTemperatureWarning('');
                          return Promise.reject('Nhiệt độ phải là số!');
                        }
                        if (!isPositiveNumber(num)) {
                          setTemperatureWarning('');
                          return Promise.reject('Nhiệt độ phải là số dương!');
                        }
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
                  label={<span>Nhịp tim (bpm) {heartRateWarning && <span style={{ color: 'red', marginLeft: 8 }}>{heartRateWarning}</span>}</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhịp tim' },
                    {
                      validator: (_, value) => {
                        if (value === undefined || value === '') {
                          setHeartRateWarning('');
                          return Promise.resolve();
                        }
                        const num = Number(value);
                        if (isNaN(num)) {
                          setHeartRateWarning('');
                          return Promise.reject('Nhịp tim phải là số!');
                        }
                        if (!isPositiveNumber(num)) {
                          setHeartRateWarning('');
                          return Promise.reject('Nhịp tim phải là số dương!');
                        }
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
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={disabledPastDate} />
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
                  label="Mức độ nghiêm trọng"
                  initialValue="Bình thường"
                  rules={[{ required: true, message: 'Vui lòng chọn mức độ nghiêm trọng' }]}
                >
                  <Select placeholder="Chọn mức độ nghiêm trọng">
                    <Option value="Nhẹ">Nhẹ</Option>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Nặng">Nặng</Option>
                  </Select>
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
                        if (isOnlyWhitespace(value)) return Promise.reject('Phương pháp xử lý không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Phương pháp xử lý không được nhập ký tự đặc biệt!');
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Phương pháp xử lý không quá 255 ký tự!');
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
                        if (isOnlyWhitespace(value)) return Promise.reject('Ghi chú không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Ghi chú không được nhập ký tự đặc biệt!');
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Ghi chú không quá 255 ký tự!');
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
                        if (isOnlyWhitespace(value)) return Promise.reject('Kết quả xử lý không được để khoảng trắng đầu dòng!');
                        if (!hasNoSpecialCharacters(value)) return Promise.reject('Kết quả xử lý không được nhập ký tự đặc biệt!');
                        if (!isStringLengthInRange(value, 0, 255)) return Promise.reject('Kết quả xử lý không quá 255 ký tự!');
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
                    value={Array.isArray(selectedSupplies) ? selectedSupplies.map(s => s.medicalSupplyId) : []}
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
