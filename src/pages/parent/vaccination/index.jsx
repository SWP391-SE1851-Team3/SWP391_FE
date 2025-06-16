import React, { useState } from 'react';
import './ParentVaccineConfirmation.css';

const ParentVaccineConfirmation = () => {
  const [consent, setConsent] = useState('');
  const [reason, setReason] = useState('');

  // Lịch sử tiêm chủng mẫu
  const [vaccineHistory] = useState([
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
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consent === '') {
      alert('Vui lòng chọn Đồng ý hoặc Không đồng ý');
      return;
    }

    const confirmationData = {
      studentName: 'Nguyễn Văn A',
      vaccine: 'Vắc xin Sởi - Quai bị - Rubella (MMR)',
      injectionDate: '2025-06-15',
      consent,
      reason: consent === 'no' ? reason : '',
    };

    console.log('📤 Dữ liệu gửi:', confirmationData);
    alert('Gửi xác nhận thành công!');
  };

  return (
    <div className="vaccine-record-container">
      <h2>Xác nhận tiêm vắc xin cho học sinh</h2>
      <div className="student-info">
        <p><strong>Họ tên:</strong> Nguyễn Văn A</p>
        <p><strong>Lớp:</strong> 5A</p>
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

      {/* Lịch sử tiêm chủng */}
      <div className="history-section">
        <h3>Lịch sử tiêm chủng</h3>
        {vaccineHistory.length > 0 ? (
          <ul>
            {vaccineHistory.map((item) => (
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
    </div>
  );
};

export default ParentVaccineConfirmation;
