import React, { useState, useEffect } from 'react';
import { Spin, Modal } from 'antd';
import { getMedicationSubmissionsByParentId } from '../../../api/medicalSubmission';

const statusClassMap = {
  'Chờ xác nhận': 'pending',
  'Đã xác nhận': 'approved',
  'Đã từ chối': 'rejected'
};

const MedicineHistory = ({ parentId }) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  useEffect(() => {
    if (!parentId) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    getMedicationSubmissionsByParentId(parentId)
      .then(res => {
        const rawHistory = res || [];
        setHistory(rawHistory);
      })
      .catch((error) => {
        console.error('API Error:', error);
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [parentId]);

  const handleViewDetail = (idx) => {
    setDetailModal({
      open: true,
      data: history[idx]
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 32, marginBottom: 24 }}>
        Trạng thái phiếu gửi thuốc
      </h2>

      {historyLoading ? (
        <div style={{ textAlign: 'center', padding: 36 }}>
          <Spin />
        </div>
      ) : (
        <>
          {history.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: 24,
                margin: '0 auto 24px auto',
                maxWidth: 900,
                minWidth: 340,
                position: 'relative'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 24 }}>
                Học sinh: {item.studentName || '---'}
              </div>
              <div style={{ margin: '12px 0', color: '#555' }}>
                Gửi ngày: {formatDate(item.submissionDate)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); handleViewDetail(idx); }}
                  style={{ color: '#1677ff', fontWeight: 500 }}
                >
                  Xem chi tiết
                </a>
              </div>

              <span
                className={`status-badge ${statusClassMap[item.status] || 'pending'}`}
                style={{
                  position: 'absolute',
                  right: 32,
                  top: 32,
                  borderRadius: 18,
                  padding: '6px 20px',
                  fontWeight: 600,
                  fontSize: 16
                }}
              >
                {item.status || '---'}
              </span>
            </div>
          ))}

          {!historyLoading && history.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>
              Chưa có đơn thuốc nào.
            </div>
          )}
        </>
      )}

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null })}
        title="Chi tiết gửi thuốc"
        footer={null}
      >
        {detailModal.data ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              <b>Học sinh:</b> {detailModal.data.studentName || '---'}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Ngày gửi:</b> {formatDate(detailModal.data.submissionDate)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Trạng thái:</b> {detailModal.data.status || '---'}
            </div>
            <hr />
            {(detailModal.data.medicationDetails || []).map((med, idx) => (
              <div key={med.medicationDetailId || idx} style={{ marginBottom: 16 }}>
                <b>Thuốc {idx + 1}:</b>
                <div>Tên thuốc: {med.medicineName}</div>
                <div>Liều lượng: {med.dosage}</div>
                <div>Thời gian sử dụng: {med.timeToUse}</div>
                {med.note && <div>Ghi chú: {med.note}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div>Không có dữ liệu chi tiết.</div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineHistory;
