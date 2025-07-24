import React, { useState, useEffect } from 'react';
import { Spin, Modal, Button, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getMedicationSubmissionsByParentId, getEvidenceImage } from '../../../api/medicalSubmission';

const statusClassMap = {
  'Chờ xác nhận': 'pending',
  'Đã xác nhận': 'approved',
  'Đã từ chối': 'rejected'
};

const MedicineHistory = ({ parentId, studentId, students }) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [imageModal, setImageModal] = useState({ open: false, imageUrl: '', loading: false });

  useEffect(() => {
    if (!parentId) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    getMedicationSubmissionsByParentId(parentId)
      .then(res => {
        const rawHistory = res || [];
        
        // Filter theo studentId nếu có
        const filteredHistory = studentId 
          ? rawHistory.filter(item => item.studentId === studentId)
          : rawHistory;
        
        setHistory(filteredHistory);
      })
      .catch((error) => {
        console.error('API Error:', error);
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [parentId, studentId]); // Thêm studentId vào dependency

  const handleViewDetail = (idx) => {
    setDetailModal({
      open: true,
      data: history[idx]
    });
  };

  const handleViewEvidenceImage = async (confirmId) => {
    if (!confirmId) {
      message.error('Không có mã xác nhận để xem hình ảnh');
      return;
    }

    setImageModal({ open: true, imageUrl: '', loading: true });
    
    try {
      const imageUrl = await getEvidenceImage(confirmId);
      setImageModal({ open: true, imageUrl, loading: false });
    } catch (error) {
      console.error('Error fetching evidence image:', error);
      message.error('Chưa có ảnh bằng chứng để hiển thị');
      setImageModal({ open: false, imageUrl: '', loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  // Lấy tên học sinh từ students array
  const getStudentName = (studentId) => {
    const student = students?.find(s => s.studentID === studentId);
    return student?.fullName || '---';
  };

  return (
    <div className="medication-status-section">
      <h2 className="section-title">
        Trạng thái phiếu gửi thuốc
      </h2>

      {historyLoading ? (
        <div className="section-card">
          <Spin />
        </div>
      ) : (
        <div className="status-list">
          {history.map((item, idx) => (
            <div key={idx} className="status-item">
              <div className="status-header">
                <div className="status-info">
                  <h3>Học sinh: {item.studentName || getStudentName(item.studentId)}</h3>
                  <div className="status-date">
                    Gửi ngày: {formatDate(item.submissionDate)}
                  </div>
                </div>
                <span className={`status-badge ${statusClassMap[item.status] || 'pending'}`}>
                  {item.status || '---'}
                </span>
              </div>
              
              <div className="status-actions">
                <button
                  className="btn-text"
                  onClick={() => handleViewDetail(idx)}
                >
                  <span className="material-icons">Xem chi tiết</span>
                </button>
                
                {item.confirmId && (
                  <button
                    className="btn-text"
                    onClick={() => handleViewEvidenceImage(item.confirmId)}
                  >
                    <span className="material-icons">Xem ảnh</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {!historyLoading && history.length === 0 && (
            <div className="section-card">
              {studentId 
                ? `Chưa có đơn thuốc nào cho ${getStudentName(studentId)}.`
                : 'Chưa có đơn thuốc nào.'
              }
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết */}
      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null })}
        title="Chi tiết gửi thuốc"
        footer={null}
      >
        {detailModal.data ? (
          <div>
            <div className="status-details">
              <p><b>Học sinh:</b> {detailModal.data.studentName || getStudentName(detailModal.data.studentId)}</p>
              <p><b>Ngày gửi:</b> {formatDate(detailModal.data.submissionDate)}</p>
              <p><b>Trạng thái:</b> {detailModal.data.status || '---'}</p>
            </div>
            <hr />
            {(detailModal.data.medicationDetails || []).map((med, idx) => (
              <div key={med.medicationDetailId || idx} className="status-details">
                <p><b>Thuốc {idx + 1}:</b></p>
                <p>Tên thuốc: {med.medicineName}</p>
                <p>Liều lượng: {med.dosage}</p>
                <p>Thời gian sử dụng: {med.timeToUse}</p>
                {med.note && <p>Ghi chú: {med.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div>Không có dữ liệu chi tiết.</div>
        )}
      </Modal>

      {/* Modal hiển thị hình ảnh */}
      <Modal
        open={imageModal.open}
        onCancel={() => setImageModal({ open: false, imageUrl: '', loading: false })}
        title="Hình ảnh bằng chứng"
        footer={null}
        width={800}
        centered
      >
        {imageModal.loading ? (
          <div className="section-card">
            <Spin size="large" />
            <div>Đang tải hình ảnh...</div>
          </div>
        ) : imageModal.imageUrl ? (
          <div className="section-card">
            <img 
              src={imageModal.imageUrl} 
              alt="Evidence" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }} 
            />
          </div>
        ) : (
          <div className="section-card">
            Chưa có hình ảnh bằng chứng để hiên thị.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineHistory;