import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
const { Option } = Select;
import { getStudentsByParent, getMedicalEventsDetail } from '../../../api/medical_accident';
import './medical_accident.css';

const MedicalAccidentParent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  const parentId = localStorage.getItem('userId');

  // Lấy danh sách học sinh khi component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await getStudentsByParent(parentId);
        setStudents(studentsData);
      } catch (err) {
        setError('Không thể tải danh sách học sinh');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [parentId]); 

  // Sắp xếp sự kiện theo thời gian (mới nhất trước)
  const sortEventsByDateTime = (events) => {
    return events.sort((a, b) => {
      const dateA = new Date(a.eventDateTime);
      const dateB = new Date(b.eventDateTime);
      return dateB - dateA;
    });
  };

  // Xử lý khi chọn học sinh
  const handleStudentSelect = async (studentId) => {
    if (!studentId) {
      setMedicalEvents([]);
      return;
    }

    try {
      setLoading(true);
      setSelectedStudent(studentId);
      const eventsData = await getMedicalEventsDetail(parentId, studentId);
      const eventsArray = Array.isArray(eventsData) ? eventsData : [eventsData];
      const sortedEvents = sortEventsByDateTime(eventsArray);
      setMedicalEvents(sortedEvents);
      setError('');
      setExpandedEvents(new Set());
    } catch (err) {
      setError('Không thể tải thông tin sự kiện y tế');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý toggle chi tiết sự kiện
  const toggleEventDetails = (eventIndex) => {
    const newExpandedEvents = new Set(expandedEvents);
    if (newExpandedEvents.has(eventIndex)) {
      newExpandedEvents.delete(eventIndex);
    } else {
      newExpandedEvents.add(eventIndex);
    }
    setExpandedEvents(newExpandedEvents);
  };

  // Format ngày tháng
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Không có thông tin';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format trạng thái xử lý
  const formatProcessingStatus = (status) => {
    if (!status) return 'Không có thông tin';

    const statusLower = status.toLowerCase();
    if (statusLower === 'hoàn thành') {
      return 'Hoàn thành';
    } else if (statusLower === 'đang xử lý') {
      return 'Đang xử lý';
    } else if (statusLower === 'chờ xử lý') {
      return 'Chờ xử lý';
  }
    return status;
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'processing';

    const statusLower = status.toLowerCase();
    if (statusLower === 'hoàn thành') {
      return 'completed';
    } else if (statusLower === 'đang xử lý') {
      return 'processing';
    } else if (statusLower === 'chờ xử lý') {
      return 'pending';
  }
    return 'processing';
  };

  // Lấy tên loại sự kiện
  const getEventTypeName = (event) => {
    if (event.eventTypeNames && event.eventTypeNames.length > 0) {
      return event.eventTypeNames;
    }
    return 'Không xác định';
  };

  return (
    <div className="medical-events-container">
      <h2 className="title">Thông Tin Sự Kiện Y Tế</h2>

      <div className="student-selector">
        <label htmlFor="student-select" className="select-label">
          Chọn học sinh:
        </label>
        <Select
          showSearch
          placeholder="Chọn học sinh"
          optionFilterProp="children"
          onChange={handleStudentSelect}
          value={selectedStudent || undefined}
          disabled={loading}
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {students.map((student) => (
            <Option key={student.studentID} value={student.studentID}>
              {student.fullName}  
            </Option>
          ))}
        </Select>
      </div>

      {loading && <div className="loading">Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Hiển thị thông tin sự kiện y tế */}
      {medicalEvents.length > 0 && (
        <div className="medical-events-list">
          <h3 className="events-title">Chi Tiết Sự Kiện Y Tế</h3>
          {medicalEvents.map((event, index) => (
            <div key={index} className={`medical-event-card ${event.isEmergency ? 'emergency-card' : ''}`}>
              <div className="event-main-info">
                <div className="event-left">
                  <h4 className="event-title">
                    {event.isEmergency && <span className="emergency-icon">🚨</span>}
                    Loại Sự kiện: {getEventTypeName(event)}
                  </h4>
                  <div className="event-datetime">
                    {formatDateTime(event.eventDateTime)}
                    {console.log(event.eventDateTime) }
                  </div>
                  <div className="event-result">
                    <span className="result-label">Kết quả:</span>
                    <span className="result-value">{event.result || 'Chưa có kết quả'}</span>
                  </div>
                </div>

                <div className="event-right">
                  <span className={`status-badge ${getStatusBadgeClass(event.processingStatus)}`}>
                    {formatProcessingStatus(event.processingStatus)}
                  </span>
                  <button
                    className="detail-toggle-btn"
                    onClick={() => toggleEventDetails(index)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Chi tiết sự kiện - chỉ hiển thị khi được mở rộng */}
              {expandedEvents.has(index) && (
                <div className="event-details">
                  <div className="detail-row">
                    <span className="label">Họ và tên:</span>
                    <span className="value">{event.fullName || 'Không có thông tin'}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Phương pháp sử dụng:</span>
                    <span className="value">{event.usageMethod || 'Không có thông tin'}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Nhiệt độ:</span>
                    <span className="value">{event.temperature}°C</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Nhịp tim:</span>
                    <span className="value">{event.heartRate} bpm</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{event.note || 'Không có ghi chú'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!selectedStudent && !loading && (
        <div className="no-selection">
          Vui lòng chọn học sinh để xem thông tin sự kiện y tế
        </div>
      )}

      {selectedStudent && medicalEvents.length === 0 && !loading && !error && (
        <div className="no-data">
          Không có sự kiện y tế nào cho học sinh này
        </div>
      )}
    </div>
  );
};

export default MedicalAccidentParent;