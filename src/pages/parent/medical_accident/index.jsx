import React, { useState, useEffect } from 'react';
import { getStudentsByParent, getMedicalEventsDetail } from '../../../api/medical_accident'; // Đường dẫn đến file API của bạn
import './medical_accident.css'; // Đường dẫn đến file CSS của bạn

const MedicalAccidentParent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parentId = localStorage.getItem('userId'); // Thay đổi theo cách bạn lưu parentId

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
      setMedicalEvents(Array.isArray(eventsData) ? eventsData : [eventsData]);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin sự kiện y tế');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format ngày tháng
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Không có thông tin';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN');
  };

  // Format giới tính
  const formatGender = (gender) => {
    return gender === 1 ? 'Nam' : gender === 0 ? 'Nữ' : 'Không xác định';
  };

  // Format trạng thái khẩn cấp
  const formatEmergency = (isEmergency) => {
    return isEmergency ? 'Khẩn cấp' : 'Bình thường';
  };

  return (
    <div className="medical-events-container">
      <h2 className="title">Thông Tin Sự Kiện Y Tế</h2>
      
      {/* Dropdown chọn học sinh */}
      <div className="student-selector">
        <label htmlFor="student-select" className="select-label">
          Chọn học sinh:
        </label>
<select
  id="student-select"
  value={selectedStudent}
  onChange={(e) => handleStudentSelect(e.target.value)}
  className="student-dropdown"
  disabled={loading}
>
  <option value="">-- Chọn học sinh --</option>
  {students.map((student) => (
    <option 
      key={student.studentID || student.id} 
      value={student.studentID || student.id} // Đảm bảo đây là ID số, không phải tên
    >
      {student.fullName}
    </option>
  ))}
</select>
      </div>

      {/* Hiển thị loading */}
      {loading && <div className="loading">Đang tải...</div>}

      {/* Hiển thị lỗi */}
      {error && <div className="error-message">{error}</div>}

      {/* Hiển thị thông tin sự kiện y tế */}
      {medicalEvents.length > 0 && (
        <div className="medical-events-list">
          <h3 className="events-title">Chi Tiết Sự Kiện Y Tế</h3>
          {medicalEvents.map((event, index) => (
            <div key={index} className="medical-event-card">
              <div className="event-header">
                <h4 className="event-title">Sự kiện #{index + 1}</h4>
                <span className={`emergency-badge ${event.isEmergency ? 'emergency' : 'normal'}`}>
                  {formatEmergency(event.isEmergency)}
                </span>
              </div>
              
              <div className="event-details">
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
                  <span className="label">Thời gian sự kiện:</span>
                  <span className="value">{formatDateTime(event.eventDateTime)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Ghi chú:</span>
                  <span className="value">{event.note || 'Không có ghi chú'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Kết quả:</span>
                  <span className="value">{event.result || 'Chưa có kết quả'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Trạng thái xử lý:</span>
                  <span className="value">{event.processingStatus || 'Không có thông tin'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Họ và tên:</span>
                  <span className="value">{event.fullName || 'Không có thông tin'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Giới tính:</span>
                  <span className="value">{formatGender(event.gender)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Lớp:</span>
                  <span className="value">{event.className || 'Không có thông tin'}</span>
                </div>
                
                {event.eventTypeNames && event.eventTypeNames.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Loại sự kiện:</span>
                    <div className="event-types">
                      {event.eventTypeNames.map((typeName, typeIndex) => (
                        <span key={typeIndex} className="event-type-tag">
                          {typeName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thông báo khi chưa chọn học sinh */}
      {!selectedStudent && !loading && (
        <div className="no-selection">
          Vui lòng chọn học sinh để xem thông tin sự kiện y tế
        </div>
      )}

      {/* Thông báo khi không có dữ liệu */}
      {selectedStudent && medicalEvents.length === 0 && !loading && !error && (
        <div className="no-data">
          Không có sự kiện y tế nào cho học sinh này
        </div>
      )}
    </div>
  );
};

export default MedicalAccidentParent;