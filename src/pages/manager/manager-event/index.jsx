import React, { useEffect, useState } from "react";
import { Button, Spin, message, Tabs } from "antd";
import {
  getVaccineBatches,
  getVaccineTypeById,
  updateConsentFormStatus,
  getAllHealthCheck,
  updateHealthCheckStatus,
} from "../../../api/manager_event";
import "./VaccineApprovalPage.css";

function VaccineApprovalPage() {
  const [batches, setBatches] = useState([]);
  const [vaccineTypeNames, setVaccineTypeNames] = useState({});
  const [loadingVaccine, setLoadingVaccine] = useState(true);
  const [processingVaccineId, setProcessingVaccineId] = useState(null);

  const [healthChecks, setHealthChecks] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [processingHealthId, setProcessingHealthId] = useState(null);

  // Helper function to sort by creation time (newest first)
  const sortByCreationTime = (items, dateField) => {
    return [...items].sort((a, b) => {
      const dateA = a[dateField] ? new Date(a[dateField]) : new Date(0);
      const dateB = b[dateField] ? new Date(b[dateField]) : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Newest first (descending order)
    });
  };

  // Vaccine data loading
  useEffect(() => {
    async function fetchVaccineData() {
      setLoadingVaccine(true);
      try {
        const data = await getVaccineBatches();
        console.log("Raw vaccine data:", data); // Debug log
        
        // Sort batches by created_at (newest first)
        const sortedData = sortByCreationTime(data, 'created_at');
        console.log("Sorted vaccine data:", sortedData); // Debug log
        
        setBatches(sortedData);

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
      } catch (error) {
        console.error("Error fetching vaccine data:", error);
        message.error("Lỗi khi tải dữ liệu tiêm chủng!");
      } finally {
        setLoadingVaccine(false);
      }
    }
    fetchVaccineData();
  }, []);

  // Health check data loading
  useEffect(() => {
    async function fetchHealthData() {
      setLoadingHealth(true);
      try {
        const data = await getAllHealthCheck();
        console.log("Raw health data:", data); // Debug log
        
        // Sort health checks by create_at (newest first)
        const sortedData = sortByCreationTime(data, 'create_at');
        console.log("Sorted health data:", sortedData); // Debug log
        
        setHealthChecks(sortedData);
      } catch (error) {
        console.error("Error fetching health data:", error);
        message.error("Lỗi khi tải dữ liệu khám sức khỏe!");
      } finally {
        setLoadingHealth(false);
      }
    }
    fetchHealthData();
  }, []);

  // Vaccine actions
  const handleApproveVaccine = async (batchId) => {
    setProcessingVaccineId(batchId);
    try {
      await updateConsentFormStatus(batchId, "Đã xác nhận");
      message.success("Xác nhận thành công!");
      const data = await getVaccineBatches();
      // Sort the updated data by created_at
      const sortedData = sortByCreationTime(data, 'created_at');
      setBatches(sortedData);
    } catch (error) {
      console.error("Error approving vaccine:", error);
      message.error("Có lỗi khi xác nhận!");
    } finally {
      setProcessingVaccineId(null);
    }
  };

  const handleRejectVaccine = async (batchId) => {
    setProcessingVaccineId(batchId);
    try {
      await updateConsentFormStatus(batchId, "Từ Chối");
      message.success("Từ chối thành công!");
      const data = await getVaccineBatches();
      // Sort the updated data by created_at
      const sortedData = sortByCreationTime(data, 'created_at');
      setBatches(sortedData);
    } catch (error) {
      console.error("Error rejecting vaccine:", error);
      message.error("Có lỗi khi từ chối!");
    } finally {
      setProcessingVaccineId(null);
    }
  };

  // Health check actions
  const handleApproveHealth = async (id) => {
    setProcessingHealthId(id);
    try {
      await updateHealthCheckStatus(id, "Đã xác nhận");
      message.success("Xác nhận thành công!");
      const data = await getAllHealthCheck();
      // Sort the updated data by create_at
      const sortedData = sortByCreationTime(data, 'create_at');
      setHealthChecks(sortedData);
    } catch (error) {
      console.error("Error approving health check:", error);
      message.error("Có lỗi khi xác nhận!");
    } finally {
      setProcessingHealthId(null);
    }
  };

  const handleRejectHealth = async (id) => {
    setProcessingHealthId(id);
    try {
      await updateHealthCheckStatus(id, "Đã từ chối");
      message.success("Từ chối thành công!");
      const data = await getAllHealthCheck();
      // Sort the updated data by create_at
      const sortedData = sortByCreationTime(data, 'create_at');
      setHealthChecks(sortedData);
    } catch (error) {
      console.error("Error rejecting health check:", error);
      message.error("Có lỗi khi từ chối!");
    } finally {
      setProcessingHealthId(null);
    }
  };

  // Color for status
  const getStatusColor = (status) => {
    if (!status) return "#ccc";
    const s = status.trim().toLowerCase();
    if (s === "đã xác nhận" || s === "đồng ý") return "#4caf50";
    if (s === "đã từ chối" || s === "từ chối") return "#e53935";
    if (s === "chờ phản hồi" || s === "đã lên lịch" || s === "chờ xác nhận") return "#ffa726";
    return "#888";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Không rõ";
    }
  };

  // Vaccine filter - data is already sorted by created_at
  const waitingBatches = batches.filter(
    (batch) => batch.status && batch.status.trim().toLowerCase() === "chờ xác nhận"
  );
  const historyBatches = batches.filter(
    (batch) => batch.status && batch.status.trim().toLowerCase() !== "chờ xác nhận"
  );

  // Health check filter - data is already sorted by create_at
  const waitingChecks = healthChecks.filter(
    (item) => item.status && item.status.trim().toLowerCase() === "đã lên lịch"
  );
  const historyChecks = healthChecks.filter(
    (item) => !item.status || item.status.trim().toLowerCase() !== "đã lên lịch"
  );

  // Loading spinner
  if (loadingVaccine || loadingHealth) {
    return (
      <div className="approval-loading">
        <Spin size="large" />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="approval-container">
      <h2 style={{ textAlign: "center", margin: "32px 0 24px 0" }}>
        Quản Lý Sự Kiện Trường Học
      </h2>

      {/* Tabs for event types */}
      <Tabs defaultActiveKey="vaccine" items={[
        {
          label: "Tiêm chủng",
          key: "vaccine",
          children: (
            <>
              {/* Vaccine Waiting */}
              <h3>Chờ Xác Nhận (Tiêm chủng) - {waitingBatches.length} mục</h3>
              {waitingBatches.length === 0 ? (
                <div style={{ margin: 24, textAlign: "center" }}>
                  Không có lô vaccine nào đang chờ duyệt.
                </div>
              ) : (
                waitingBatches.map((batch, idx) => (
                  <div className="simple-card" key={batch.batchID}>
                    <div className="row">
                      <b>
                        {batch.dot} – {vaccineTypeNames[batch.vaccineTypeID] || "Không rõ"}
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
                    <div>Ngày tạo: {formatDate(batch.created_at)}</div>
                    <div>Ngày tiêm dự kiến: {formatDate(batch.scheduled_date)}</div>
                    <div>Địa điểm: {batch.location || "Không rõ"}</div>
                    <div>Số lượng đồng ý: {batch.countAgreeConsentForms || 0}</div>
                    <div>Ghi chú: {batch.notes || "Không có"}</div>
                    <div>Người tạo: {batch.created_by_nurse_name || "Không rõ"}</div>
                    <div style={{ marginTop: 12 }}>
                      <Button
                        onClick={() => handleApproveVaccine(batch.batchID)}
                        loading={processingVaccineId === batch.batchID}
                        style={{ marginRight: 10, background: "#4caf50", color: "#fff" }}
                      >
                        Đồng Ý
                      </Button>
                      <Button
                        onClick={() => handleRejectVaccine(batch.batchID)}
                        loading={processingVaccineId === batch.batchID}
                        style={{ background: "#e53935", color: "#fff" }}
                      >
                        Từ Chối
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Vaccine History */}
              <h3 style={{ marginTop: 40 }}>Lịch Sử Tiêm chủng - {historyBatches.length} mục</h3>
              {historyBatches.length === 0 ? (
                <div style={{ margin: 24, textAlign: "center" }}>Không có lịch sử sự kiện.</div>
              ) : (
                historyBatches.map((batch, idx) => (
                  <div className="simple-card" key={batch.batchID}>
                    <div className="row">
                      <b>
                        {batch.dot} – {vaccineTypeNames[batch.vaccineTypeID] || "Không rõ"}
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
                    <div>Ngày tạo: {formatDate(batch.created_at)}</div>
                    <div>Ngày tiêm dự kiến: {formatDate(batch.scheduled_date)}</div>
                    <div>Địa điểm: {batch.location || "Không rõ"}</div>
                    <div>Số lượng đồng ý: {batch.countAgreeConsentForms || 0}</div>
                    <div>Ghi chú: {batch.notes || "Không có"}</div>
                    <div>Người tạo: {batch.created_by_nurse_name || "Không rõ"}</div>
                  </div>
                ))
              )}
            </>
          ),
        },
        {
          label: "Khám sức khoẻ",
          key: "health",
          children: (
            <>
              {/* Health Check Waiting */}
              <h3>Chờ Xác Nhận (Khám sức khoẻ) - {waitingChecks.length} mục</h3>
              {waitingChecks.length === 0 ? (
                <div style={{ margin: 24, textAlign: "center" }}>
                  Không có lịch khám nào đang chờ xác nhận.
                </div>
              ) : (
                waitingChecks.map((item, idx) => (
                  <div className="simple-card" key={item.health_ScheduleID}>
                    <div className="row">
                      <b>
                        {item.name || "Không rõ"}
                      </b>
                      <span
                        className="status-label"
                        style={{
                          background: getStatusColor(item.status),
                          color: "#fff",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>Ngày tạo: {formatDate(item.create_at)}</div>
                    <div>Ngày khám dự kiến: {formatDate(item.schedule_Date)}</div>
                    <div>Địa điểm: {item.location || "Không rõ"}</div>
                    <div>Ghi chú: {item.notes || "Không có"}</div>
                    <div>Người tạo: {item.createdByNurseName || "Không rõ"}</div>
                    <div style={{ marginTop: 12 }}>
                      <Button
                        onClick={() => handleApproveHealth(item.health_ScheduleID)}
                        loading={processingHealthId === item.health_ScheduleID}
                        style={{ marginRight: 10, background: "#4caf50", color: "#fff" }}
                      >
                        Xác Nhận
                      </Button>
                      <Button
                        onClick={() => handleRejectHealth(item.health_ScheduleID)}
                        loading={processingHealthId === item.health_ScheduleID}
                        style={{ background: "#e53935", color: "#fff" }}
                      >
                        Từ Chối
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Health Check History */}
              <h3 style={{ marginTop: 40 }}>Lịch Sử Khám Sức Khoẻ - {historyChecks.length} mục</h3>
              {historyChecks.length === 0 ? (
                <div style={{ margin: 24, textAlign: "center" }}>Không có lịch sử.</div>
              ) : (
                historyChecks.map((item, idx) => (
                  <div className="simple-card" key={item.health_ScheduleID}>
                    <div className="row">
                      <b>
                        {item.name || "Không rõ"}
                      </b>
                      <span
                        className="status-label"
                        style={{
                          background: getStatusColor(item.status),
                          color: "#fff",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>Ngày tạo: {formatDate(item.create_at)}</div>
                    <div>Ngày khám dự kiến: {formatDate(item.schedule_Date)}</div>
                    <div>Địa điểm: {item.location || "Không rõ"}</div>
                    <div>Ghi chú: {item.notes || "Không có"}</div>
                    <div>Người tạo: {item.createdByNurseName || "Không rõ"}</div>
                  </div>
                ))
              )}
            </>
          ),
        },
      ]}/>
    </div>
  );
}

export default VaccineApprovalPage;