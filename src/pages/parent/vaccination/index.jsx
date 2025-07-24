import React, { useState, useEffect } from 'react';
import './ParentVaccineConfirmation.css';
import { getStudentsByParent, viewConsentForm, submitConsentForm, getVaccinationRecordByStudent } from '../../../api/consent_form';
import { message, Form, Input, Radio, Button, Spin, Modal } from 'antd';

const ParentVaccineConfirmation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consentForm, setConsentForm] = useState(null);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [hasConsentForm, setHasConsentForm] = useState(false);
  const [hasPendingForm, setHasPendingForm] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
      const studentsData = Array.isArray(res) ? res : [];
      setStudents(studentsData);
    } catch (error) {
      console.error(error);
      message.error('Không tải được danh sách học sinh');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewDetails = async (student) => {
    const id = Number(student.studentID || student.studentId || student.id);
    if (!id) {
      message.error("Không tìm thấy studentId!");
      return;
    }
    setSelectedStudent(student);
    setLoadingForm(true);

    try {
      // Lấy thông tin consent form
      const dataList = await viewConsentForm(id);
      let consentData;
      let hasPending = false;

      if (!Array.isArray(dataList) || dataList.length === 0) {
        setHasConsentForm(false);
        setHasPendingForm(false);
        consentData = {
          consent_form_id: null,
          fullNameOfParent: "Chưa có dữ liệu",
          fullNameOfStudent: student.fullName || "Chưa có dữ liệu",
          className: student.className || "Chưa có dữ liệu",
          vaccineName: "Chưa có dữ liệu",
          scheduledDate: "Chưa có dữ liệu",
          location: "Chưa có dữ liệu",
          vaccineHistory: [],
          isAgree: null,
          reason: "",
          hasAllergy: ""
        };
      } else {
        setHasConsentForm(true);

        const pendingForm = dataList.find(item => {
          const status = (item.isAgree || "").toLowerCase().trim();
          return status === "chờ phản hồi" || status === "chưa xác nhận" || status === "";
        });

        const data = pendingForm || dataList[0];
        hasPending = !!pendingForm;
        setHasPendingForm(hasPending);

        const formId = data.consent_form_id || data.consent_id || data.id || data.consentFormId || data.formId || data.consentId;

        consentData = {
          consent_form_id: formId,
          fullNameOfParent: data.fullNameOfParent || "Chưa có dữ liệu",
          fullNameOfStudent: data.fullNameOfStudent || student.fullName || "Chưa có dữ liệu",
          className: data.className || student.className || "Chưa có dữ liệu",
          vaccineName: data.vaccineName || "Chưa có dữ liệu",
          scheduledDate: data.scheduledDate || "Chưa có dữ liệu",
          location: data.location || "Chưa có dữ liệu",
          vaccineHistory: dataList.filter(item => {
            const isAgreeVal = (item.isAgree || "").toLowerCase();
            const currentId = data.consent_id || data.consent_form_id;
            return (
              (isAgreeVal === "đồng ý" || isAgreeVal === "không đồng ý") &&
              (item.consent_id !== currentId)
            );
          }),
          isAgree: data.isAgree || "Chờ phản hồi",
          reason: data.reason || "",
          hasAllergy: data.hasAllergy || ""
        };

        if (hasPending) {
          form.setFieldsValue({
            isAgree: undefined,
            reason: consentData.reason || "",
            hasAllergy: consentData.hasAllergy || ""
          });
        }
      }

      setConsentForm(consentData);

      // Lấy kết quả tiêm chủng
      let vaccinationResults = [];
      try {
        const vaccinationRes = await getVaccinationRecordByStudent(id);
        vaccinationResults = vaccinationRes || [];  
      } catch (error) {
        console.log('Không có kết quả tiêm chủng:', error.message);
        vaccinationResults = [];
      }

      setVaccinationRecords(Array.isArray(vaccinationResults) ? vaccinationResults : []);

    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết");
      setHasConsentForm(false);
      setHasPendingForm(false);
      setVaccinationRecords([]);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSubmit = async (values) => {
    if (values.isAgree === "Không đồng ý" && !values.reason?.trim()) {
      message.warning('Vui lòng nhập lý do khi từ chối');
      return;
    }

    if (!consentForm || !consentForm.consent_form_id) {
      message.error('Không tìm thấy ID form đồng ý. Vui lòng thử lại!');
      return;
    }

    const formId = Number(consentForm.consent_form_id);
    if (isNaN(formId) || formId <= 0) {
      message.error('ID form đồng ý không hợp lệ');
      return;
    }

    let reasonValue = "";
    if (values.isAgree === "Không đồng ý") {
      reasonValue = values.reason?.trim() || "none";
    } else {
      reasonValue = "none";
    }

    const payload = {
      isAgree: values.isAgree || "",
      reason: reasonValue,
      hasAllergy: (values.hasAllergy || "").trim() || "none"
    };

    setSubmitting(true);
    try {
      await submitConsentForm(payload, formId);
      message.success('Gửi xác nhận thành công!');

      setConsentForm({
        ...consentForm,
        isAgree: values.isAgree,
        reason: values.reason || "",
        hasAllergy: values.hasAllergy || ""
      });

      setHasPendingForm(false);
      form.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gửi xác nhận thất bại!';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedStudent(null);
    setConsentForm(null);
    setVaccinationRecords([]);
    setHasConsentForm(false);
    setHasPendingForm(false);
    setShowDetailModal(false);
    setSelectedRecord(null);
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

  const handleViewRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const renderNotificationInfo = () => (
    <div className="student-info">
      <h2>Thông Báo Tiêm Chủng</h2>
      {hasConsentForm && hasPendingForm ? (
        <>
          <div className="info-row1">
            <span><strong>Họ tên học sinh:</strong> {consentForm?.fullNameOfStudent}</span>
            <span><strong>Lớp:</strong> {consentForm?.className}</span>
          </div>
          <p><strong>Vắc xin đăng ký:</strong> {consentForm?.vaccineName}</p>
          <div className="info-row">
            <span><strong>Ngày tiêm dự kiến:</strong> {consentForm?.scheduledDate}</span>
            <span><strong>Địa điểm tiêm:</strong> {consentForm?.location}</span>
          </div>
        </>
      ) : (
        <p className="no-schedule">Chưa có lịch tiêm cần duyệt</p>
      )}
    </div>
  );

  const renderHistoryInfo = () => (
    <li className="history-card">
      <span className={`status-badge ${consentForm?.isAgree === "Đồng ý" ? "status-success" : "status-error"}`}>
        {consentForm?.isAgree}
      </span>
      <div className="history-card-row">
        <span className="history-label">Học Sinh:</span> {consentForm?.fullNameOfStudent}
        <span className="history-label" style={{ marginLeft: '20px' }}>Lớp:</span> {consentForm?.className}
      </div>
      <div className="history-card-row">
        <span className="history-label">Vắc xin:</span> {consentForm?.vaccineName}
      </div>
      <div className="history-card-row">
        <span className="history-label">Địa điểm:</span> {consentForm?.location}
      </div>
    </li>
  );

  const renderVaccinationRecords = () => {
    const recordsArr = Array.isArray(vaccinationRecords) ? vaccinationRecords : [];
    if (recordsArr.length === 0) {
      return <div className="empty-history">Chưa có kết quả tiêm chủng.</div>;
    }

    return recordsArr.map((record, index) => (
      <li key={index} className="history-card">
        <span className={`status-badge ${record.status === "COMPLETED" ? "status-success" : "status-warning"}`}>
          {record.status || "Chưa rõ"}
        </span>
        <div className="history-card-row">
          <span className="history-label">Học sinh:</span> {record.studentName}
          <span className="history-label" style={{ marginLeft: '20px' }}>Lớp:</span> {record.className}
        </div>
        <div className="history-card-row">
          <span className="history-label">Vắc xin:</span> {record.vaccineName}
        </div>
        <div className="history-card-row">
          <span className="history-label">Ngày tiêm:</span> {formatDateTime(record.observation_time)}
        </div>
        <div className="history-card-row">
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewRecordDetails(record)}
            style={{ marginTop: '10px' }}
          >
            Xem Chi Tiết
          </Button>
        </div>
      </li>
    ));
  };

  const renderDetailModal = () => (
    <Modal
      title="Chi tiết kết quả tiêm chủng"
      open={showDetailModal}
      wrapClassName="custom-vaccination-modal"
      onCancel={() => setShowDetailModal(false)}
      footer={[
        <Button key="close" onClick={() => setShowDetailModal(false)}>
          Đóng
        </Button>
      ]}
      width={600}
    >
      {selectedRecord && (
        <div className="record-detail">
          <div className="detail-row">
            <strong>Vắc xin:</strong> {selectedRecord.vaccineName}
          </div>
          <div className="detail-row">
            <strong>Ghi chú:</strong> {selectedRecord.notes || "Không có"}
          </div>
          <div className="detail-row">
            <strong>Thời gian quan sát:</strong> {formatDateTime(selectedRecord.observation_time)}
          </div>
          <div className="detail-row">
            <strong>Triệu chứng:</strong> {selectedRecord.symptoms || "Không có"}
          </div>
          <div className="detail-row">
            <strong>Mức độ nghiêm trọng:</strong> {selectedRecord.severity || "Không có"}
          </div>
          <div className="detail-row">
            <strong>Ghi chú quan sát:</strong> {selectedRecord.observation_notes || "Không có"}
          </div>
          <div className="detail-row">
            <strong>Tên y tá:</strong> {selectedRecord.createNurseName || "N/A"}
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="vaccine-record-container">
      {!selectedStudent ? (
        <>
          <div className="page-header">
            <h2>Thông Tin Vắc Xin Học Sinh</h2>
          </div>
          <div className="students-list">
            {loadingStudents ? (
              <Spin tip="Đang tải danh sách học sinh..." />
            ) : students.length > 0 ? (
              students.map((student) => (
                <div key={student.studentID} className="student-card">
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
      ) : loadingForm || !consentForm ? (
        <Spin tip="Đang tải thông tin chi tiết..." />
      ) : (
        <>
          <Button type="link" onClick={resetState}>← Quay lại</Button>
          {renderNotificationInfo()}
          
          {hasConsentForm && hasPendingForm && (
            <div className="vaccine-form">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  hasAllergy: consentForm?.hasAllergy || "",
                  reason: consentForm?.reason || ""
                }}
              >
                <Form.Item name="hasAllergy" label="Dị ứng (nếu có):" className="short-textarea">
                  <Input.TextArea placeholder="Nhập dị ứng (nếu có)..." autoSize={{ minRows: 1, maxRows: 2 }} />
                </Form.Item>

                <Form.Item
                  name="isAgree"
                  label="Bạn có đồng ý cho con tiêm vắc xin này không?"
                  rules={[{ required: true, message: 'Vui lòng chọn đồng ý hay không đồng ý' }]}
                >
                  <Radio.Group>
                    <Radio value="Đồng ý">Đồng ý</Radio>
                    <Radio value="Không đồng ý">Không đồng ý</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item shouldUpdate={(prev, cur) => prev.isAgree !== cur.isAgree}>
                  {({ getFieldValue }) => getFieldValue('isAgree') === "Không đồng ý" && (
                    <Form.Item
                      name="reason"
                      label="Lý do từ chối (bắt buộc):"
                      rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                    >
                      <Input.TextArea placeholder="Nhập lý do từ chối..." autoSize={{ minRows: 1, maxRows: 2 }} />
                    </Form.Item>
                  )}
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting} size="large">
                    Gửi xác nhận
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          <div className="history-section" style={{ marginTop: '40px' }}>
            <h3>Lịch Sử Đồng Ý Tiêm Chủng</h3>
            <ul>
              {hasConsentForm && !hasPendingForm && consentForm?.isAgree &&
                (consentForm.isAgree === "Đồng ý" || consentForm.isAgree === "Không đồng ý") &&
                renderHistoryInfo()}

              {consentForm?.vaccineHistory?.length > 0 &&
                consentForm.vaccineHistory.map((item, index) => (
                  <li key={index} className="history-card">
                    <span className={`status-badge ${(item.isAgree || "").toLowerCase() === "đồng ý" ? "status-success" : "status-error"}`}>
                      {item.isAgree || "Không rõ"}
                    </span>
                    <div className="history-card-row">
                      <span className="history-label">Học Sinh:</span> {item.fullNameOfStudent || item.student}
                      <span className="history-label" style={{ marginLeft: '20px' }}>Lớp:</span> {item.className || item.class}
                    </div>
                    <div className="history-card-row">
                      <span className="history-label">Vắc xin:</span> {item.vaccineName || item.vaccine}
                    </div>
                    <div className="history-card-row">
                      <span className="history-label">Địa điểm:</span> {item.location}
                    </div>
                  </li>
                ))}
                
            </ul>
          </div>

          {/* Kết quả tiêm chủng */}
          <div className="history-section" style={{ marginTop: '30px' }}>
            <h3>Kết Quả Tiêm Chủng</h3>
            <ul>
              {renderVaccinationRecords()}
            </ul>
          </div>

          {renderDetailModal()}
        </>
      )}
    </div>
  );
};

export default ParentVaccineConfirmation;