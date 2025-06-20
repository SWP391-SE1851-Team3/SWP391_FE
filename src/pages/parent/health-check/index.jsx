import React, { useState } from 'react';
import './healthCheckNotification.css';

const HealthCheckNotification = () => {
  const [consent, setConsent] = useState(null);
  const [reason, setReason] = useState('');

  // Lịch sử kiểm tra y tế
  const [healthCheckHistory] = useState([
    {
      id: 1,
      date: '10/03/2024',
      time: '08:00 AM',
      doctor: 'Tiến sĩ: Nguyễn Văn B',
      location: 'Phòng y tế trường',
      result: 'Không phát hiện vấn đề',
    },
    {
      id: 2,
      date: '15/09/2023',
      time: '09:00 AM',
      doctor: 'Bác sĩ: Trần Thị C',
      location: 'Phòng khám đa khoa ABC',
      result: 'Thiếu máu nhẹ',
    },
  ]);

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
    <div className="health-record-container">
      <h2>Thông báo kiểm tra y tế học sinh</h2>

      <div>
        <p><strong>Tên học sinh:</strong> Nguyễn Văn A</p>
        <p><strong>Lớp:</strong> 10A1</p>
      </div>

      <div style={{marginTop: 16}}>
        <p><strong>Loại kiểm tra:</strong> Kiểm tra sức khỏe định kỳ</p>
        <p><strong>Mục đích:</strong> Tìm hiểu tình trạng sức khỏe, phát hiện bệnh lý tiềm ẩn</p>
        <p><strong>Thời gian:</strong> 10/06/2025, 08:00 AM</p>
        <p><strong>Địa điểm:</strong> Phòng y tế trường</p>
        <p><strong>Người thực hiện:</strong> Tiến sĩ: Nguyễn Gia Phú</p>
      </div>

      <div style={{marginTop: 24}}>
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
        <br />
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
          <div style={{marginTop: 12}}>
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

      <div style={{marginTop: 24}}>
        <p><strong>Thông tin liên hệ y tế nhà trường</strong></p>
        <p>Số điện thoại: 0987-654-321</p>
        <p>Email: yte@truongxyz.edu.vn</p>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>Xác nhận</button>

      {/* Lịch sử kiểm tra - Đặt sau cùng */}
      <div className="history-section">
        <h3>Lịch sử kiểm tra y tế</h3>
        {healthCheckHistory.length > 0 ? (
          <ul>
            {healthCheckHistory.map((record) => (
              <li key={record.id} className="history-item">
                <p><strong>Ngày kiểm tra:</strong> {record.date} - {record.time}</p>
                <p><strong>Bác sĩ:</strong> {record.doctor}</p>
                <p><strong>Địa điểm:</strong> {record.location}</p>
                <p><strong>Kết quả:</strong> {record.result}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có lịch sử kiểm tra y tế.</p>
        )}
      </div>
    </div>
  );
};

export default HealthCheckNotification;
