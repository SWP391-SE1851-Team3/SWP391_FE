import React, { useState, useEffect } from 'react';
import { getHealthConsentByParent, updateHealthConsent, getHealthCheckResultsByStudent } from '../../../api/healthCheck_parent.js';
import './healthCheckNotification.css';

const ParentHealthCheck = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consent, setConsent] = useState('');
  const [reason, setReason] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentParentId = localStorage.getItem('parentId');
  const currentUserLogin = localStorage.getItem('parentName');

  useEffect(() => {
    if (!currentParentId) {
      alert('Vui lòng đăng nhập!');
      return;
    }
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const consentData = await getHealthConsentByParent(currentParentId);

      const studentsData = Array.isArray(consentData) ? consentData : [consentData];
      const transformedStudents = studentsData.map(item => ({
        id: item.studentID,
        name: item.studentName,
        class: item.className,
        formId: item.formID,
        parentId: item.parentID,
        healthScheduleId: item.healthScheduleID,
        healthScheduleName: item.healthScheduleName,
        isAgreed: item.isAgreed,
        notes: item.notes,
        sendDate: item.send_date,
        expireDate: item.expire_date,
        pendingChecks: item.isAgreed === 'pending' || !item.isAgreed ? 1 : 0,
        consentStatus: getConsentStatus(item.isAgreed),
        healthHistory: []
      }));

      setStudents(transformedStudents);
    } catch (err) {
      setError('Không thể tải danh sách học sinh: ' + err.message);
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConsentStatus = (isAgreed) => {
    if (!isAgreed || isAgreed === 'pending') return 'pending';
    if (isAgreed === 'yes' || isAgreed === 'agreed' || isAgreed === 'true') return 'approved';
    if (isAgreed === 'no' || isAgreed === 'rejected' || isAgreed === 'false') return 'rejected';
    return 'pending';
  };

  const getConsentStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Đã đồng ý';
      case 'rejected': return 'Đã từ chối';
      case 'pending':
      default: return 'Chờ xác nhận';
    }
  };

  const loadStudentHealthHistory = async (studentId) => {
    try {
      const healthResults = await getHealthCheckResultsByStudent(studentId);

      const historyData = Array.isArray(healthResults) ? healthResults : [healthResults];
      return historyData.map(item => ({
        id: item.checkID,
        date: new Date(item.create_at).toLocaleDateString('vi-VN'),
        result: item.overallResult || 'Chưa có kết quả',
        height: item.height,
        weight: item.weight,
        bmi: item.bmi,
        temperature: item.temperature,
        visionLeft: item.visionLeft,
        visionRight: item.visionRight,
        hearing: item.hearing,
        dentalCheck: item.dentalCheck,
        createdByNurseName: item.createdByNurseName,
        updatedByNurseName: item.updatedByNurseName,
        className: item.className,
        fullName: item.fullName,
        note: item.notes || 'Không có ghi chú đặc biệt'
      }));
    } catch (err) {
      console.error('Error loading health history:', err);
      return [];
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent({
      ...student,
      healthHistory: []
    });

    // Load lịch sử khám sức khỏe
    const history = await loadStudentHealthHistory(student.id);
    setSelectedStudent(prev => ({
      ...prev,
      healthHistory: history
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (consent === '') {
      alert('Vui lòng chọn Đồng ý hoặc Không đồng ý');
      return;
    }

    if (consent === 'no' && !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setLoading(true);
    try {
      const currentDateTime = new Date().toISOString();

      const updateData = {
        formID: selectedStudent.formId,
        studentID: selectedStudent.id,
        parentID: selectedStudent.parentId,
        studentName: selectedStudent.name,
        className: selectedStudent.class,
        healthScheduleID: selectedStudent.healthScheduleId,
        healthScheduleName: selectedStudent.healthScheduleName,
        isAgreed: consent === 'yes' ? 'yes' : 'no',
        notes: consent === 'no' ? reason : `Phụ huynh ${currentUserLogin} đồng ý cho con tham gia khám sức khỏe`,
        send_date: selectedStudent.sendDate,
        expire_date: selectedStudent.expireDate,
        response_date: currentDateTime,
        parent_signature: currentUserLogin
      };

      await updateHealthConsent(selectedStudent.formId, updateData);

      alert('Gửi xác nhận thành công!');

      // Reset form
      setSelectedStudent(null);
      setConsent('');
      setReason('');

      // Reload danh sách
      await loadStudents();

    } catch (err) {
      alert('Có lỗi xảy ra khi gửi xác nhận: ' + err.message);
      console.error('Error submitting consent:', err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expireDate) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Loading state
  if (loading && students.length === 0) {
    return (
      <div className="vaccine-record-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="vaccine-record-container">
        <div className="error">
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={loadStudents} className="retry-btn">
            <span>🔄</span> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccine-record-container">
      {/* Header */}
      <header className="page-header">
        {selectedStudent && (
          <button
            className="back-btn"
            onClick={() => {
              setSelectedStudent(null);
              setConsent('');
              setReason('');
            }}
            disabled={loading}
          >
            <span>←</span> Quay lại
          </button>
        )}
        <h2>
          {selectedStudent ?
            `Thông Báo Khám Sức Khỏe - ${selectedStudent.name}` :
            'Thông Tin Kham Sức Khỏe Của Học Sinh'
          }
        </h2>
        <div className="user-info">
          <span>Phụ huynh: {currentUserLogin}</span>
          <span>Ngày: {formatDate(new Date().toISOString())}</span>
        </div>
      </header>

      {!selectedStudent ? (
        // Danh sách học sinh
        <div className="students-list">
          {students.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📋</div>
              <h3>Không có thông tin</h3>
              <p>Hiện tại không có thông báo khám sức khỏe nào cho các con của bạn.</p>
              <button onClick={loadStudents} className="refresh-btn">
                Làm mới
              </button>
            </div>
          ) : (
            <>
              {/* <div className="list-summary">
                <p>Có <strong>{students.length}</strong> thông báo khám sức khỏe</p>
              </div> */}
              {students.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-avatar">
                    <span>{student.name.charAt(0)}</span>
                  </div>
                  <div className="student-content">
                    <div className="student-header">
                      <h3>
                        {student.name}
                        {student.pendingChecks > 0 && (
                          <span className="notification-dot" title={`${student.pendingChecks} thông báo mới`}>
                            {student.pendingChecks}
                          </span>
                        )}
                      </h3>
                      <span className={`status-badge ${student.consentStatus}`}>
                        {getConsentStatusText(student.consentStatus)}
                      </span>
                    </div>

                    <div className="student-details">
                      <div className="detail-row">
                        <span className="label">Lớp:</span>
                        <span className="value">{student.class}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Loại khám:</span>
                        <span className="value">{student.healthScheduleName || 'Khám sức khỏe tổng quát'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Ngày gửi:</span>
                        <span className="value">{formatDate(student.sendDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Hạn phản hồi:</span>
                        <span className={`value ${isExpired(student.expireDate) ? 'expired' : ''}`}>
                          {formatDate(student.expireDate)}
                          {isExpired(student.expireDate) && <span className="expired-text"> (Đã hết hạn)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="view-btn primary"
                        onClick={() => handleSelectStudent(student)}
                        disabled={loading}
                      >
                        {loading ? 'Đang tải...' : 'Xem chi tiết'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        // Chi tiết học sinh
        <div className="student-detail-view">
          {/* Thông tin cơ bản */}
          <div className="info-section">
            <h3>Thông tin khám sức khỏe</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Họ tên học sinh:</span>
                <span className="info-value">{selectedStudent.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Lớp:</span>
                <span className="info-value">{selectedStudent.class}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loại khám:</span>
                <span className="info-value">{selectedStudent.healthScheduleName || 'Khám sức khỏe tổng quát'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Địa điểm:</span>
                <span className="info-value">Tại trường</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày gửi thông báo:</span>
                <span className="info-value">{formatDate(selectedStudent.sendDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Hạn phản hồi:</span>
                <span className={`info-value ${isExpired(selectedStudent.expireDate) ? 'expired' : ''}`}>
                  {formatDate(selectedStudent.expireDate)}
                  {isExpired(selectedStudent.expireDate) && <span className="expired-text"> (Đã hết hạn)</span>}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Trạng thái hiện tại:</span>
                <span className={`status-badge ${selectedStudent.consentStatus}`}>
                  {getConsentStatusText(selectedStudent.consentStatus)}
                </span>
              </div>
            </div>

            {selectedStudent.notes && (
              <div className="notes-section">
                <h4>Ghi chú:</h4>
                <p className="notes-content">{selectedStudent.notes}</p>
              </div>
            )}
          </div>

          {/* Form xác nhận */}
          {(!selectedStudent.isAgreed || selectedStudent.isAgreed === 'pending') && !isExpired(selectedStudent.expireDate) && (
            <div className="consent-section">
              <h3>Xác nhận tham gia</h3>
              <form onSubmit={handleSubmit} className="consent-form">
                <div className="form-group">
                  <label className="form-label">
                    Bạn có đồng ý cho <strong>{selectedStudent.name}</strong> tham gia khám sức khỏe này không?
                  </label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="yes"
                        checked={consent === 'yes'}
                        onChange={() => setConsent('yes')}
                        disabled={loading}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text agree">✓ Đồng ý</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="no"
                        checked={consent === 'no'}
                        onChange={() => setConsent('no')}
                        disabled={loading}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text disagree">✗ Không đồng ý</span>
                    </label>
                  </div>
                </div>

                {consent === 'no' && (
                  <div className="form-group">
                    <label className="form-label">
                      Lý do từ chối <span className="required">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder="Vui lòng nhập lý do tại sao không đồng ý cho con tham gia khám sức khỏe..."
                      disabled={loading}
                      className="reason-textarea"
                      rows="4"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Gửi xác nhận
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Thông báo nếu đã hết hạn */}
          {isExpired(selectedStudent.expireDate) && selectedStudent.consentStatus === 'pending' && (
            <div className="expired-notice">
              <h3>⚠️ Thông báo</h3>
              <p>Thời hạn phản hồi cho thông báo này đã hết. Vui lòng liên hệ với nhà trường để được hỗ trợ.</p>
            </div>
          )}

          {/* Lịch sử khám sức khỏe */}
          <div className="history-section">
            <h3>Lịch sử khám sức khỏe</h3>
            {selectedStudent.healthHistory.length > 0 ? (
              <div className="history-list">
                {selectedStudent.healthHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-header">
                      <span className="history-date">📅 {item.date}</span>
                      <span className={`history-result ${item.result?.toLowerCase().includes('bình thường') ? 'normal' : 'attention'}`}>
                        {item.result}
                      </span>
                    </div>
                    <div className="history-details">
                      {item.height > 0 && (
                        <div className="detail-item">
                          <span>Chiều cao:</span> <span>{item.height} cm</span>
                        </div>
                      )}
                      {item.weight > 0 && (
                        <div className="detail-item">
                          <span>Cân nặng:</span> <span>{item.weight} kg</span>
                        </div>
                      )}
                      {item.bmi > 0 && (
                        <div className="detail-item">
                          <span>BMI:</span> <span>{item.bmi}</span>
                        </div>
                      )}
                      {item.temperature && (
                        <div className="detail-item">
                          <span>Nhiệt độ:</span> <span>{item.temperature}°C</span>
                        </div>
                      )}
                      {(item.visionLeft || item.visionRight) && (
                        <div className="detail-item">
                          <span>Thị lực:</span>
                          <span>
                            Mắt trái: {item.visionLeft || 'N/A'},
                            Mắt phải: {item.visionRight || 'N/A'}
                          </span>
                        </div>
                      )}
                      {item.hearing && (
                        <div className="detail-item">
                          <span>Thính lực:</span> <span>{item.hearing}</span>
                        </div>
                      )}
                      {item.dentalCheck && (
                        <div className="detail-item">
                          <span>Răng miệng:</span> <span>{item.dentalCheck}</span>
                        </div>
                      )}
                      {item.createdByNurseName && (
                        <div className="detail-item">
                          <span>Y tá khám:</span> <span>{item.createdByNurseName}</span>
                        </div>
                      )}
                    </div>
                    {item.note && (
                      <div className="history-note">
                        <strong>Ghi chú:</strong> {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <div className="no-history-icon">🏥</div>
                <p>Chưa có lịch sử khám sức khỏe</p>
                <small>Lịch sử khám sẽ được cập nhật sau khi học sinh tham gia khám sức khỏe</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentHealthCheck;