import React, { useState } from 'react';
import './healthCheckNotification.css';

const ParentHealthCheck = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consent, setConsent] = useState('');
  const [reason, setReason] = useState('');

  // Dữ liệu mẫu cho danh sách học sinh
  const [students] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      class: '5A',
      pendingChecks: 1,
      healthHistory: [
        {
          id: 1,
          date: '10/06/2024',
          result: 'Bình thường',
          note: 'Không có vấn đề sức khỏe',
        },
      ]
    },
    {
      id: 2,
      name: 'Nguyễn Thị B',
      class: '3B',
      pendingChecks: 0,
      healthHistory: []
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consent === '') {
      alert('Vui lòng chọn Đồng ý hoặc Không đồng ý');
      return;
    }
    // Xử lý gửi xác nhận
    alert('Gửi xác nhận thành công!');
    setSelectedStudent(null);
    setConsent('');
    setReason('');
  };

  return (
    <div className="vaccine-record-container">
      {selectedStudent && (
        <button 
          className="back-btn"
          onClick={() => setSelectedStudent(null)}
        >
          Quay lại
        </button>
      )}
      <h2>Xác nhận khám sức khỏe cho học sinh</h2>
      {!selectedStudent ? (
        <div className="students-list">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-avatar">
                {student.name.charAt(0)}
              </div>
              <div className="student-content">
                <h3>
                  {student.name}
                  {student.pendingChecks > 0 && (
                    <span className="notification-dot" title={`${student.pendingChecks} thông báo mới`}></span>
                  )}
                </h3>
                <div className="student-info">
                  <p><strong>Lớp:</strong> {student.class}</p>
                </div>
                <div className="action-buttons">
                  <button 
                    className="view-btn"
                    onClick={() => setSelectedStudent(student)}
                  >
                    Xem Thông Tin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="student-info">
            <p><strong>Họ tên:</strong> {selectedStudent.name}</p>
            <p><strong>Lớp:</strong> {selectedStudent.class}</p>
            <p><strong>Loại khám:</strong> Khám sức khỏe tổng quát</p>
            <p><strong>Địa điểm:</strong> Tại trường</p>
            <p><strong>Ngày khám dự kiến:</strong> 20/06/2025</p>
          </div>

          <form onSubmit={handleSubmit} className="consent-form">
            <label>Bạn có đồng ý cho con tham gia khám sức khỏe này không?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  checked={consent === 'yes'}
                  onChange={() => setConsent('yes')}
                />
                Đồng ý
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  checked={consent === 'no'}
                  onChange={() => setConsent('no')}
                />
                Không đồng ý
              </label>
            </div>

            {consent === 'no' && (
              <div className="reason-field">
                <label>Lý do từ chối (bắt buộc):</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Nhập lý do tại đây..."
                />
              </div>
            )}

            <button type="submit" className="submit-btn">Gửi xác nhận</button>
          </form>

          <div className="history-section">
            <h3>Lịch sử khám sức khỏe</h3>
            {selectedStudent.healthHistory.length > 0 ? (
              <ul>
                {selectedStudent.healthHistory.map((item) => (
                  <li key={item.id} className="history-item">
                    <p><strong>Ngày khám:</strong> {item.date}</p>
                    <p><strong>Kết quả:</strong> {item.result}</p>
                    <p><strong>Ghi chú:</strong> {item.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có lịch sử khám sức khỏe.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentHealthCheck;
