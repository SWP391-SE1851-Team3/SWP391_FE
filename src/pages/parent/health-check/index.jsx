import React, { useState } from 'react';
import './healthCheckNotification.css';

const HealthCheckNotification = () => {
  const [consent, setConsent] = useState(null); // 'yes' | 'no' | null
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (consent === 'yes') {
      alert('Cảm ơn bạn đã đồng ý kiểm tra y tế cho học sinh.');
    } else if (consent === 'no') {
      if (reason.trim() === '') {
        alert('Vui lòng nhập lý do không đồng ý.');
      } else {
        alert(`Lý do không đồng ý: ${reason}`);
      }
    } else {
      alert('Vui lòng chọn một lựa chọn.');
    }
  };

  return (
    <div className="notification-container">
      <h2>Thông báo kiểm tra y tế học sinh</h2>

      <div className="student-info">
        <p><strong>Tên học sinh:</strong> Nguyễn Văn A</p>
        <p><strong>Lớp:</strong> 10A1</p>
      </div>

      <div className="health-check-info">
        <p><strong>Loại kiểm tra:</strong> Kiểm tra sức khỏe định kỳ</p>
        <p><strong>Mục đích:</strong> Tìm hiểu tình trạng sức khỏe, phát hiện bệnh lý tiềm ẩn</p>
        <p><strong>Thời gian:</strong> 10/06/2025, 08:00 AM</p>
        <p><strong>Địa điểm:</strong> Phòng y tế trường</p>
        <p><strong>Người thực hiện:</strong> Tiến sĩ: Nguyễn Gia Phú</p>
      </div>

      <div className="agreement-section">
        <p><strong>Lựa chọn:</strong></p>
        <label>
          <input
            type="radio"
            name="consent"
            value="yes"
            checked={consent === 'yes'}
            onChange={() => setConsent('yes')}
          />
          Tôi đồng ý cho học sinh tham gia kiểm tra y tế
        </label>
        <label>
          <input
            type="radio"
            name="consent"
            value="no"
            checked={consent === 'no'}
            onChange={() => setConsent('no')}
          />
          Tôi không đồng ý
        </label>

        {consent === 'no' && (
          <div className="reason-input">
            <label>
              Nhập lý do:
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Vui lòng nhập lý do..."
              />
            </label>
          </div>
        )}
      </div>

      <div className="contact-info">
        <p><strong>Thông tin liên hệ y tế nhà trường</strong> </p>
        <p>Số điện thoại: 0987-654-321</p>
        <p>Email: yte@truongxyz.edu.vn</p>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>Xác nhận</button>
    </div>
  );
};

export default HealthCheckNotification;