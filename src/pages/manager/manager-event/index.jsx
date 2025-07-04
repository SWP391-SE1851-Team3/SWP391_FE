import React, { useEffect, useState } from "react";
import { Button, Spin, message } from "antd";
import {
  getVaccineBatches,
  getVaccineTypeById,
  updateConsentFormStatus,
} from "../../../api/manager_event";
import "./VaccineApprovalPage.css";

function VaccineApprovalPage() {
  const [batches, setBatches] = useState([]);
  const [vaccineTypeNames, setVaccineTypeNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getVaccineBatches();
        setBatches(data);

        // Lấy tên loại vaccine cho từng vaccineTypeID duy nhất
        const ids = [
          ...new Set(data.map((b) => b.vaccineTypeID).filter(Boolean)),
        ];
        const typeNames = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const t = await getVaccineTypeById(id);
              typeNames[id] = t.name;
            } catch {
              typeNames[id] = "Không xác định";
            }
          })
        );
        setVaccineTypeNames(typeNames);
      } catch {
        message.error("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApprove = async (batchId) => {
    setProcessingId(batchId);
    try {
      await updateConsentFormStatus(batchId, "Đã Xác Nhận");
      message.success("Xác nhận thành công!");
      const data = await getVaccineBatches();
      setBatches(data);
    } catch {
      message.error("Có lỗi khi xác nhận!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (batchId) => {
    setProcessingId(batchId);
    try {
      await updateConsentFormStatus(batchId, "Từ Chối");
      message.success("Từ chối thành công!");
      const data = await getVaccineBatches();
      setBatches(data);
    } catch {
      message.error("Có lỗi khi từ chối!");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="approval-loading">
        <Spin size="large" />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  // Tách chờ xác nhận và lịch sử
  const waitingBatches = batches.filter(
    (batch) =>
      batch.status &&
      batch.status.trim().toLowerCase() === "chờ xác nhận"
  );
  const historyBatches = batches.filter(
    (batch) =>
      batch.status &&
      batch.status.trim().toLowerCase() !== "chờ xác nhận"
  );

  // Hàm màu cho status
  const getStatusColor = (status) => {
    if (!status) return "#ccc";
    const s = status.trim().toLowerCase();
    if (s === "đã xác nhận") return "#4caf50";
    if (s === "từ chối") return "#e53935";
    if (s === "chờ xác nhận") return "#ffa726";
    return "#888";
  };

  return (
    <div className="approval-container">
      <h2 style={{ textAlign: "center", margin: "32px 0 24px 0" }}>
        Quản Lý Sự Kiện Trường Học
      </h2>

      {/* CHỜ XÁC NHẬN */}
      <h3>Chờ Xác Nhận</h3>
      {waitingBatches.length === 0 ? (
        <div style={{ margin: 24, textAlign: "center" }}>
          Không có lô vaccine nào đang chờ duyệt.
        </div>
      ) : (
        waitingBatches.map((batch, idx) => (
          <div className="simple-card" key={batch.batchID}>
            <div className="row">
              <b>
                Đợt {idx + 1} – {vaccineTypeNames[batch.vaccineTypeID] || "Không rõ"}
              </b>
              <span
                className="status-label"
                style={{
                  background: getStatusColor(batch.status),
                  color: "#fff",
                }}
              >
                {batch.status}
              </span>
            </div>
            <div>Ngày tạo: {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : "Không rõ"}</div>
            <div>Ngày tiêm dự kiến: {batch.scheduled_date ? new Date(batch.scheduled_date).toLocaleDateString() : "Không rõ"}</div>
            <div>Địa điểm: {batch.location || "Không rõ"}</div>
            <div>Số lượng: {(batch.quantity_received || batch.quantity || 0) + " liều vắc xin"}</div>
            <div>Ghi chú: {batch.notes || "Không có"}</div>
            <div style={{ marginTop: 12 }}>
              <Button
                onClick={() => handleApprove(batch.batchID)}
                loading={processingId === batch.batchID}
                style={{ marginRight: 10, background: "#4caf50", color: "#fff" }}
              >
                Đồng Ý
              </Button>
              <Button
                onClick={() => handleReject(batch.batchID)}
                loading={processingId === batch.batchID}
                style={{ background: "#e53935", color: "#fff" }}
              >
                Từ Chối
              </Button>
            </div>
          </div>
        ))
      )}

      {/* LỊCH SỬ SỰ KIỆN */}
      <h3 style={{ marginTop: 40 }}>Lịch Sử Sự Kiện</h3>
      {historyBatches.length === 0 ? (
        <div style={{ margin: 24, textAlign: "center" }}>Không có lịch sử sự kiện.</div>
      ) : (
        historyBatches.map((batch, idx) => (
          <div className="simple-card" key={batch.batchID}>
            <div className="row">
              <b>
                Đợt {idx + 1} – {vaccineTypeNames[batch.vaccineTypeID] || "Không rõ"}
              </b>
              <span
                className="status-label"
                style={{
                  background: getStatusColor(batch.status),
                  color: "#fff",
                }}
              >
                {batch.status}
              </span>
            </div>
            <div>Ngày tạo: {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : "Không rõ"}</div>
            <div>Ngày tiêm dự kiến: {batch.scheduled_date ? new Date(batch.scheduled_date).toLocaleDateString() : "Không rõ"}</div>
            <div>Địa điểm: {batch.location || "Không rõ"}</div>
            <div>Số lượng: {(batch.quantity_received || batch.quantity || 0) + " liều vắc xin"}</div>
            <div>Ghi chú: {batch.notes || "Không có"}</div>
          </div>
        ))
      )}
    </div>
  );
}

export default VaccineApprovalPage;