import React, { useState, useEffect } from 'react';
import './healthCheckNotification.css';
import { getStudentsByParent } from '../../../api/consent_form';
import {
  getHealthConsentByParent,
  updateHealthConsent,
  getHealthCheckResultsByStudent
} from '../../../api/healthCheck_parent';
import { message, Form, Input, Radio, Button, Spin, Modal } from 'antd';

const ParentHealthCheck = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthConsentForms, setHealthConsentForms] = useState([]);
  const [healthCheckResults, setHealthCheckResults] = useState([]);
  const [currentConsentForm, setCurrentConsentForm] = useState(null);
  const [hasHealthConsentForm, setHasHealthConsentForm] = useState(false);
  const [hasPendingForm, setHasPendingForm] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [form] = Form.useForm();
  const parentId = localStorage.getItem('userId');

  useEffect(() => {
    if (!parentId) {
      message.error('Vui lòng đăng nhập!');
      return;
    }
    fetchStudents();
  }, [parentId]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await getStudentsByParent(parentId);
      console.log('API raw response:', res);

      const studentsData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      console.log('studentsData:', studentsData);

      setStudents(studentsData);
    } catch (error) {
      console.error(error);
      message.error('Không tải được danh sách học sinh');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const isFormExpired = (expireDate) => {
    if (!expireDate) return false;
    const currentDate = new Date();
    const expDate = new Date(expireDate);
    return currentDate > expDate;
  };

  const processExpiredForms = (forms) => {
    return Array.isArray(forms)
      ? forms.map(form => {
        const isPending = !form.isAgreed ||
          form.isAgreed === "" ||
          form.isAgreed.toLowerCase() === "chờ phản hồi";

        if (isPending && isFormExpired(form.expire_date)) {
          return {
            ...form,
            isAgreed: "Từ chối",
            notes: form.notes || "Từ chối do quá hạn phản hồi",
            isExpiredRejection: true
          };
        }
        return form;
      })
      : [];
  };

  const handleViewDetails = async (student) => {
    const studentId = Number(student.studentID || student.studentId || student.id);
    if (!studentId) {
      message.error("Không tìm thấy studentId!");
      return;
    }

    setSelectedStudent(student);
    setLoadingForm(true);

    try {
      // Lấy thông tin health consent theo parentId
      const consentRes = await getHealthConsentByParent(parentId);
      const allConsentForms =
        Array.isArray(consentRes)
          ? consentRes
          : Array.isArray(consentRes?.data)? consentRes.data: [];

      let studentConsentForms = allConsentForms.filter(form =>
        Number(form.studentID) === studentId
      );

      // Xử lý các form hết hạn
      studentConsentForms = processExpiredForms(studentConsentForms);

      let healthResults = [];
      try {
        const resultsRes = await getHealthCheckResultsByStudent(studentId);
        healthResults = Array.isArray(resultsRes)
          ? resultsRes
          : Array.isArray(resultsRes?.data) ? resultsRes.data: [];
      } catch (error) {
        console.log('Không có kết quả health check:', error.message);
        healthResults = [];
      }

      setHealthConsentForms(Array.isArray(studentConsentForms) ? studentConsentForms : []);
      setHealthCheckResults(Array.isArray(healthResults) ? healthResults : []);

      let currentForm = null;
      let hasPending = false;

      if (!Array.isArray(studentConsentForms) || studentConsentForms.length === 0) {
        setHasHealthConsentForm(false);
        setHasPendingForm(false);
      } else {
        setHasHealthConsentForm(true);

        const pendingForm = studentConsentForms.find(form => {
          const isPending = !form.isAgreed ||
            form.isAgreed === "" ||
            form.isAgreed.toLowerCase() === "chờ phản hồi";
          const notExpired = !isFormExpired(form.expire_date);
          return isPending && notExpired;
        });

        if (pendingForm) {
          currentForm = pendingForm;
          hasPending = true;
        } else {
          currentForm = studentConsentForms[0];
          hasPending = false;
        }

        setHasPendingForm(hasPending);

        if (hasPending && currentForm) {
          form.setFieldsValue({
            isAgreed: undefined,
          });
        }
      }

      setCurrentConsentForm(currentForm || null);
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết: " + error.message);
      setHasHealthConsentForm(false);
      setHasPendingForm(false);
      setHealthConsentForms([]);
      setHealthCheckResults([]);
      setCurrentConsentForm(null);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!currentConsentForm || !currentConsentForm.formID) {
      message.error('Không tìm thấy ID form đồng ý. Vui lòng thử lại!');
      return;
    }

    const formId = Number(currentConsentForm.formID);
    if (isNaN(formId) || formId <= 0) {
      message.error('ID form đồng ý không hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Calling updateHealthConsent with:', {
        formId,
        isAgreed: values.isAgreed || "",
        notes: (values.notes || "").trim()
      });

      const result = await updateHealthConsent(
        formId,
        values.isAgreed || "",
        (values.notes || "").trim()
      );

      console.log('API response:', result);
      message.success('Gửi xác nhận thành công!');

      const updatedForm = {
        ...currentConsentForm,
        isAgreed: result.isAgreed || values.isAgreed,
        notes: result.notes || values.notes || ""
      };
      setCurrentConsentForm(updatedForm);

      const updatedForms = (Array.isArray(healthConsentForms) ? healthConsentForms : []).map(form =>
        form.formID === formId ? updatedForm : form
      );
      setHealthConsentForms(updatedForms);

      setHasPendingForm(false);
      form.resetFields();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Gửi xác nhận thất bại!';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedStudent(null);
    setHealthConsentForms([]);
    setHealthCheckResults([]);
    setCurrentConsentForm(null);
    setHasHealthConsentForm(false);
    setHasPendingForm(false);
    setShowDetailModal(false);
    setSelectedResult(null);
    form.resetFields();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có dữ liệu";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
      });
    } catch (error) {
      return "Không hợp lệ";
    }
  };

  const handleViewResultDetails = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const renderNotificationInfo = () => (
    <div className="student-info">
      <h2>Thông Báo Kiểm Tra Sức Khỏe</h2>
      {hasHealthConsentForm && hasPendingForm && currentConsentForm && !isFormExpired(currentConsentForm.expire_date) ? (
        <>
          <div className="info-row1">
            <span><strong>Họ tên học sinh:</strong> {currentConsentForm.studentName}</span>
            <span><strong>Lớp:</strong> {currentConsentForm.className}</span>
          </div>
          <p><strong>Chương trình kiểm tra:</strong> {currentConsentForm.healthScheduleName}</p>
          <div className="info-row">
            <span><strong>Ngày gửi:</strong> {formatDateTime(currentConsentForm.send_date)}</span>
            <span><strong>Hạn phản hồi:</strong> {formatDateTime(currentConsentForm.expire_date)}</span>
          </div>
        </>
      ) : (
        <p className="no-schedule">Chưa có lịch kiểm tra sức khỏe cần duyệt</p>
      )}
    </div>
  );

  const renderHealthCheckResults = () => {
    const resultsArr = Array.isArray(healthCheckResults) ? healthCheckResults : [];
    if (resultsArr.length === 0) {
      return <div className="empty-history">Chưa có kết quả kiểm tra sức khỏe.</div>;
    }

    return resultsArr.map((result, index) => (
      <li key={index} className="history-card">
        <span className={`status-badge ${result.status === "Đã hoàn thành" ? "status-success" : "status-warning"}`}>
          {result.status || "Chưa rõ"}
        </span>
        <div className="history-card-row">
          <span className="history-label">Học sinh:</span> {result.fullName}
          <span className="history-label" style={{ marginLeft: '20px' }}>Lớp:</span> {result.className}
        </div>
        <div className="history-card-row">
          <span className="history-label">Ngày tạo:</span> {formatDateTime(result.create_at)}
        </div>
        <div className="history-card-row">
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewResultDetails(result)}
            style={{ marginTop: '10px' }}
          >
            Xem Chi Tiết
          </Button>
        </div>
      </li>
    ));
  };

  const renderConsentHistory = () => {
  const formsArr = Array.isArray(healthConsentForms) ? healthConsentForms : [];
  const processedForms = formsArr.filter(form => {
    const hasResponse = form.isAgreed && form.isAgreed !== "" && form.isAgreed.toLowerCase() !== "chờ phản hồi";
    const isPendingButExpired = (!form.isAgreed || form.isAgreed === "" || form.isAgreed.toLowerCase() === "chờ phản hồi") && isFormExpired(form.expire_date);
    return hasResponse || isPendingButExpired;
  });

  if (processedForms.length === 0) {
    return null;
  }

  return processedForms.map((form, index) => {
    let displayStatus = form.isAgreed;
    let statusClass = "status-warning";
    let displayNotes = form.notes;

    const isPendingButExpired = (!form.isAgreed || form.isAgreed === "" || form.isAgreed.toLowerCase() === "chờ phản hồi") && isFormExpired(form.expire_date);

    if (isPendingButExpired) {
      displayStatus = "Từ chối";
      statusClass = "status-error";
      displayNotes = displayNotes || "Từ chối do quá hạn phản hồi";
    } else if (form.isAgreed === "Từ chối") {
      displayStatus = "Từ chối";
      statusClass = "status-error"; 
    } else if (form.isAgreed === "Đồng ý") {
      displayStatus = "Đồng ý";
      statusClass = "status-success"; 
    } else {
      displayStatus = form.isAgreed || "Chưa rõ";
      statusClass = "status-warning";
    }

    console.log('Form isAgreed:', form.isAgreed);
    console.log('Final displayStatus:', displayStatus);
    console.log('Final statusClass:', statusClass);

    return (
      <li key={index} className="history-card">
        <span className={`status-badge ${statusClass}`}>
          {displayStatus}
        </span>
        {isPendingButExpired && (
          <span className="expired-badge" style={{ marginLeft: '10px', backgroundColor: '#ff4d4f', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
            Quá hạn
          </span>
        )}
        <div className="history-card-row">
          <span className="history-label">Học sinh:</span> {form.studentName}
          <span className="history-label" style={{ marginLeft: '20px' }}>Lớp:</span> {form.className}
        </div>
        <div className="history-card-row">
          <span className="history-label">Chương trình:</span> {form.healthScheduleName}
        </div>
        <div className="history-card-row">
          <span className="history-label">Ngày gửi:</span> {formatDateTime(form.send_date)}
        </div>
        <div className="history-card-row">
          <span className="history-label">Hạn phản hồi:</span> {formatDateTime(form.expire_date)}
        </div>
        {displayNotes && (
          <div className="history-card-row">
            <span className="history-label">Ghi chú:</span> {displayNotes}
          </div>
        )}
      </li>
    );
  });
};

  const renderDetailModal = () => (
    <Modal
      title="Chi tiết kết quả kiểm tra sức khỏe"
      open={showDetailModal}
      wrapClassName="custom-health-modal"
      onCancel={() => setShowDetailModal(false)}
      footer={[
        <Button key="close" onClick={() => setShowDetailModal(false)}>
          Đóng
        </Button>
      ]}
      width={600}
    >
      {selectedResult && (
        <div className="result-detail">
          <div className="detail-row">
            <strong>Học sinh:</strong> {selectedResult.fullName}
          </div>
          <div className="detail-row">
            <strong>Lớp:</strong> {selectedResult.className}
          </div>
          <div className="detail-row">
            <strong>Chiều cao:</strong> {selectedResult.height || "N/A"} cm
          </div>
          <div className="detail-row">
            <strong>Cân nặng:</strong> {selectedResult.weight || "N/A"} kg
          </div>
          <div className="detail-row">
            <strong>BMI:</strong> {selectedResult.bmi ? selectedResult.bmi.toFixed(2) : "N/A"}
          </div>
          <div className="detail-row">
            <strong>Nhiệt độ:</strong> {selectedResult.temperature || "N/A"}°C
          </div>
          <div className="detail-row">
            <strong>Thị lực trái:</strong> {selectedResult.visionLeft || "N/A"}
          </div>
          <div className="detail-row">
            <strong>Thị lực phải:</strong> {selectedResult.visionRight || "N/A"}
          </div>
          <div className="detail-row">
            <strong>Thính giác:</strong> {selectedResult.hearing || "N/A"}
          </div>
          <div className="detail-row">
            <strong>Răng miệng:</strong> {selectedResult.dentalCheck || "N/A"}
          </div>
          <div className="detail-row">
            <strong>Kết quả tổng thể:</strong> {selectedResult.overallResult || "N/A"}
          </div>
          <div className="detail-row">
            <strong>Ngày tạo:</strong> {formatDateTime(selectedResult.create_at)}
          </div>
          <div className="detail-row">
            <strong>Y tá:</strong> {selectedResult.createdByNurseName || "N/A"}
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="health-check-container">
      {!selectedStudent ? (
        <>
          <div className="page-header">
            <h2>Thông Tin Kiểm Tra Sức Khỏe Học Sinh</h2>
            <span className="custom-underline"></span>
          </div>

          <div className="students-list">
            {loadingStudents ? (
              <Spin tip="Đang tải danh sách học sinh..." />
            ) : Array.isArray(students) && students.length > 0 ? (
              students.map((student) => (
                <div key={student.studentID || student.studentId || student.id} className="student-card">
                  <div className="student-avatar">{student.fullName?.charAt(0)}</div>
                  <div className="student-content">
                    <h3>{student.fullName}</h3>
                    <h4>{student.className}</h4>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewDetails(student)}>
                        Xem Thông Tin
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có học sinh nào.</p>
            )}
          </div>
        </>
      ) : loadingForm ? (
        <Spin tip="Đang tải thông tin chi tiết..." />
      ) : (
        <>
          <Button type="link" onClick={resetState}>← Quay lại</Button>

          {renderNotificationInfo()}

          {/* Hiển thị form khi có form đang chờ phản hồi và chưa hết hạn */}
          {hasHealthConsentForm && hasPendingForm && currentConsentForm && !isFormExpired(currentConsentForm.expire_date) && (
            <div className="health-check-form">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                // initialValues={{
                //   notes: currentConsentForm.notes || ""
                // }}
              >
                <Form.Item name="notes" label="Ghi chú (nếu có):" className="short-textarea">
                  <Input.TextArea
                    placeholder="Nhập ghi chú về tình trạng sức khỏe của con hoặc lý do từ chối..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>

                <Form.Item
                  name="isAgreed"
                  label="Bạn có đồng ý cho con tham gia kiểm tra sức khỏe này không?"
                  rules={[{ required: true, message: 'Vui lòng chọn đồng ý hay từ chối' }]}
                >
                  <Radio.Group>
                    <Radio value="Đồng ý">Đồng ý</Radio>
                    <Radio value="Từ chối">Từ chối</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting} size="large">
                    Gửi xác nhận
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          {/* Lịch sử đồng ý kiểm tra */}
          {Array.isArray(healthConsentForms) && healthConsentForms.length > 0 && (
            <div className="history-section" style={{ marginTop: '30px' }}>
              <h3>Lịch sử đồng ý kiểm tra sức khỏe</h3>
              <ul>
                {renderConsentHistory()}
                {(Array.isArray(healthConsentForms)
                  ? healthConsentForms.filter(form => {
                    const hasResponse = form.isAgreed && form.isAgreed !== "" && form.isAgreed.toLowerCase() !== "chờ phản hồi";
                    const isPendingButExpired = (!form.isAgreed || form.isAgreed === "" || form.isAgreed.toLowerCase() === "chờ phản hồi") && isFormExpired(form.expire_date);
                    return hasResponse || isPendingButExpired;
                  })
                  : []
                ).length === 0 && (
                    <div className="empty-history">Chưa có lịch sử đồng ý kiểm tra sức khỏe.</div>
                  )}
              </ul>
            </div>
          )}

          {/* Kết quả kiểm tra sức khỏe */}
          <div className="history-section" style={{ marginTop: '30px' }}>
            <h3>Kết quả kiểm tra sức khỏe</h3>
            <ul>
              {renderHealthCheckResults()}
            </ul>
          </div>

          {/* Modal hiển thị chi tiết kết quả */}
          {renderDetailModal()}
        </>
      )}
    </div>
  );
};

export default ParentHealthCheck;