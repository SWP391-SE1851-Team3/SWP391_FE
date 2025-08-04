import React, { useState, useEffect } from 'react';
import { Spin, Modal, message, Tag } from 'antd';
import { getMedicationSubmissionsByParentId, getEvidenceImage } from '../../../api/medicalSubmission';
import './medicineForm.css';

const statusColorMap = {
  'Chờ nhận thuốc': 'orange',
  'Đã phát thuốc': 'green',
  'Đã hoàn thành': 'green',
  'Thiếu thuốc': 'red',
  'Đã nhận thuốc': 'blue',
  'Đang xử lí': 'blue',
  'Đã Hủy': 'red',
  'Từ chối': 'red'
};

const MedicineHistory = ({ parentId, studentId, students }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [imageModal, setImageModal] = useState({ open: false, imageUrl: '', loading: false });

  useEffect(() => {
    if (!parentId) {
      setHistory([]);
      return;
    }
    setLoading(true);

    getMedicationSubmissionsByParentId(parentId)
      .then(res => {
        const raw = res || [];
        const filtered = raw.filter(item => item.studentId === studentId);

        const grouped = Object.values(
          filtered.reduce((acc, item) => {
            const key = item.medicationSubmissionId;
            if (!acc[key]) {
              acc[key] = {
                medicationSubmissionId: key,
                studentId: item.studentId,
                studentName: item.studentName,
                submissionDate: item.submissionDate,
                confirmId: item.confirmId,
                confirmStatus: item.confirmStatus,
                timeStatusMap: {
                  Sáng: null,
                  Trưa: null,
                  Chiều: null
                },
                detailsByTime: {
                  Sáng: [],
                  Trưa: [],
                  Chiều: []
                }
              };
            }
            if (item.timeToUse) {
              acc[key].timeStatusMap[item.timeToUse] = item.status;
              acc[key].detailsByTime[item.timeToUse].push(...item.medicationDetails);
            }
            return acc;
          }, {})
        );

        setHistory(grouped);
      })
      .catch(error => {
        console.error('API Error:', error);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [parentId, studentId]);

  const handleViewDetail = (groupData) => {
    setDetailModal({ open: true, data: groupData });
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
      message.error('Nhân viên y tế chưa gửi hình ảnh bằng chứng.');
      setImageModal({ open: false, imageUrl: '', loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStudentName = (id) => {
    const student = students?.find(s => s.studentID === id);
    return student?.fullName || '---';
  };

  return (
    <div className="medication-status-section">
      <h2 className="section-title">Trạng thái phiếu gửi thuốc</h2>

      {loading ? (
        <div className="section-card"><Spin /></div>
      ) : (
        <div className="status-list">
          {history.map((group, idx) => {
            const hasMissingMedicine = Object.values(group.timeStatusMap).includes("Từ chối");

            return (
              <div
                key={idx}
                className={`status-items ${hasMissingMedicine ? 'missing-medicine' : ''}`}
              >
                <div className="status-header">
                  <div className="status-info">
                    <h3>Học sinh: {group.studentName || getStudentName(group.studentId)}</h3>
                    <div className="status-date">Ngày gửi: {formatDate(group.submissionDate)}</div>
                  </div>
                  <div>
                    <Tag color={statusColorMap[group.confirmStatus]}>
                      {group.confirmStatus}
                    </Tag>
                  </div>
                </div>

                <div className="status-actions">
                  <button className="btn-text" onClick={() => handleViewDetail(group)}>
                    <span className="material-icons">Xem chi tiết</span>
                  </button>

                  {group.confirmId && (
                    <button className="btn-text" onClick={() => handleViewEvidenceImage(group.confirmId)}>
                      <span className="material-icons">Xem ảnh bằng chứng</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && history.length === 0 && (
            <div className="section-card">
              {studentId
                ? `Chưa có đơn thuốc nào cho ${getStudentName(studentId)}.`
                : 'Chưa có đơn thuốc nào.'}
            </div>
          )}
        </div>
      )}

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
            </div>
            <hr />
            {["Sáng", "Trưa", "Chiều"].map(time => (
              detailModal.data.detailsByTime[time]?.length > 0 && (
                <div key={time}>
                  <div className="medicine-detail-row">
                    <h4>Thuốc buổi {time}</h4>
                    <Tag color={statusColorMap[detailModal.data.timeStatusMap[time]] || 'default'}>
                      {detailModal.data.timeStatusMap[time] || '---'}
                    </Tag>
                  </div>
                  {detailModal.data.detailsByTime[time].map((med, idx) => (
                    <div key={idx} className="status-details">
                      <p><b>Thuốc {idx + 1}:</b></p>
                      <p>Tên thuốc: {med.medicineName}</p>
                      <p>Liều lượng: {med.dosage}</p>
                      <p>Ghi chú: {med.note}</p>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          <div>Không có dữ liệu chi tiết.</div>
        )}
      </Modal>

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
            Chưa có hình ảnh bằng chứng để hiển thị.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineHistory;
