import React, { useState, useEffect } from 'react';
import './ParentVaccineConfirmation.css';
import { useVaccination } from '../../../context/VaccinationContext';

const ParentVaccineConfirmation = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consent, setConsent] = useState('');
  const [reason, setReason] = useState('');
  const { incrementVaccinationCount, decrementVaccinationCount } = useVaccination();

  // Dữ liệu mẫu cho danh sách học sinh
  const [students] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      class: '5A',
      pendingVaccinations: 2,
      vaccineHistory: [
        {
          id: 1,
          date: '15/06/2024',
          vaccine: 'Viêm gan B',
          location: 'Trạm y tế phường',
          result: 'Không có phản ứng phụ',
        },
        {
          id: 2,
          date: '10/01/2023',
          vaccine: 'Cúm mùa',
          location: 'Bệnh viện Nhi',
          result: 'Sốt nhẹ sau tiêm',
        },
      ]
    },
    {
      id: 2,
      name: 'Nguyễn Thị B',
      class: '3B',
      pendingVaccinations: 1,
      vaccineHistory: [
        {
          id: 1,
          date: '20/05/2024',
          vaccine: 'Viêm não Nhật Bản',
          location: 'Bệnh viện Nhi',
          result: 'Không có phản ứng phụ',
        }
      ]
    }
  ]);

  useEffect(() => {
    incrementVaccinationCount();
    return () => {
      decrementVaccinationCount();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consent === '') {
      alert('Vui lòng chọn Đồng ý hoặc Không đồng ý');
      return;
    }

    const confirmationData = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      vaccine: 'Vắc xin Sởi - Quai bị - Rubella (MMR)',
      injectionDate: '2025-06-15',
      consent,
      reason: consent === 'no' ? reason : '',
    };

    console.log('📤 Dữ liệu gửi:', confirmationData);
    alert('Gửi xác nhận thành công!');
    setSelectedStudent(null);
    setConsent('');
    setReason('');
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const handleViewHistory = (student) => {
    setSelectedStudent(student);
    // Có thể thêm logic để hiển thị lịch sử tiêm chủng ở đây
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
      <h2>Xác nhận tiêm vắc xin cho học sinh</h2>
      
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
                  {student.pendingVaccinations > 0 && (
                    <span className="notification-dot" title={`${student.pendingVaccinations} thông báo mới`}></span>
                  )}
                </h3>
                <div className="student-info">
                  <p><strong>Lớp:</strong> {student.class}</p>
                </div>
                <div className="action-buttons">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewDetails(student)}
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
            <p><strong>Vắc xin:</strong> Sởi - Quai bị - Rubella (MMR)</p>
            <p><strong>Loại Vacxin:</strong> Olala - Pháp</p>
            <p><strong>Địa điểm:</strong> Tại trường</p>
            <p><strong>Ngày tiêm dự kiến:</strong> 15/06/2025</p>
          </div>

          <form onSubmit={handleSubmit} className="consent-form">
            <label>Bạn có đồng ý cho con tiêm vắc xin này không?</label>
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
            <h3>Lịch sử tiêm chủng</h3>
            {selectedStudent.vaccineHistory.length > 0 ? (
              <ul>
                {selectedStudent.vaccineHistory.map((item) => (
                  <li key={item.id} className="history-item">
                    <p><strong>Ngày tiêm:</strong> {item.date}</p>
                    <p><strong>Vắc xin:</strong> {item.vaccine}</p>
                    <p><strong>Địa điểm:</strong> {item.location}</p>
                    <p><strong>Kết quả:</strong> {item.result}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có lịch sử tiêm chủng.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentVaccineConfirmation;
