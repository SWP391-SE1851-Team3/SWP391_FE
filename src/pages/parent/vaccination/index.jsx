import React, { useState, useEffect } from 'react';
import './ParentVaccineConfirmation.css';
import { getStudentsByParent, ViewConsentForm, submitConsentForm } from '../../../api/consent_form';
import { message, Form, Input, Radio, Button, Spin } from 'antd';

const ParentVaccineConfirmation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consentForm, setConsentForm] = useState(null);
  const [hasConsentForm, setHasConsentForm] = useState(false);
  const [hasPendingForm, setHasPendingForm] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const parentId = localStorage.getItem('parentId');

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
      setStudents(res.data);
    } catch (error) {
      message.error('Không tải được danh sách học sinh');
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
      const res = await ViewConsentForm(id);
      const dataList = res?.data;

      let consentData;
      let hasPending = false;

      if (!Array.isArray(dataList) || dataList.length === 0) {
        // Không có consent form
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
        // Có consent form
        setHasConsentForm(true);

        // Tìm form "Chờ phản hồi" đầu tiên
        const pendingForm = dataList.find(item =>
          item.isAgree === "Chờ phản hồi" ||
          item.isAgree === "Chưa xác nhận" ||
          item.isAgree === null ||
          item.isAgree === ""
        );

        // Nếu có form pending, ưu tiên hiển thị form đó
        const data = pendingForm || dataList[0];

        // Kiểm tra xem có form nào đang chờ phản hồi không
        hasPending = !!pendingForm;
        setHasPendingForm(hasPending);

        // Thử nhiều tên trường ID khác nhau
        const formId = data.consent_form_id ||
          data.consent_id ||
          data.id ||
          data.consentFormId ||
          data.formId ||
          data.consentId;

        consentData = {
          consent_form_id: formId,
          fullNameOfParent: data.fullNameOfParent || "Chưa có dữ liệu",
          fullNameOfStudent: data.fullNameOfStudent || student.fullName || "Chưa có dữ liệu",
          className: data.className || student.className || "Chưa có dữ liệu",
          vaccineName: data.vaccineName || "Chưa có dữ liệu",
          scheduledDate: data.scheduledDate || "Chưa có dữ liệu",
          location: data.location || "Chưa có dữ liệu",
          vaccineHistory: dataList.filter(item =>
            item.isAgree === "Đồng ý" || item.isAgree === "Không đồng ý"
          ),
          isAgree: data.isAgree || "Chờ phản hồi",
          reason: data.reason || "",
          hasAllergy: data.hasAllergy || ""
        };

        // Set form values nếu có form đang chờ
        if (hasPending) {
          form.setFieldsValue({
            isAgree: undefined,
            reason: consentData.reason || "",
            hasAllergy: consentData.hasAllergy || ""
          });
        }
      }

      setConsentForm(consentData);
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết");
      setHasConsentForm(false);
      setHasPendingForm(false);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSubmit = async (values) => {
    // Kiểm tra lý do từ chối
    if (values.isAgree === "Không đồng ý" && !values.reason?.trim()) {
      message.warning('Vui lòng nhập lý do khi từ chối');
      return;
    }

    // Kiểm tra consent_form_id
    if (!consentForm || !consentForm.consent_form_id) {
      message.error('Không tìm thấy ID form đồng ý. Vui lòng thử lại!');
      return;
    }

    // Chuyển đổi và kiểm tra ID
    const formId = Number(consentForm.consent_form_id);
    if (isNaN(formId) || formId <= 0) {
      message.error('ID form đồng ý không hợp lệ');
      return;
    }

    const payload = {
      consentFormId: formId,
      isAgree: values.isAgree || "",
      reason: values.isAgree === "Không đồng ý" ? (values.reason || "").trim() : '',
      hasAllergy: (values.hasAllergy || "").trim()
    };

    setSubmitting(true);
    try {
      await submitConsentForm(payload);
      message.success('Gửi xác nhận thành công!');

      // Cập nhật state local
      setConsentForm({
        ...consentForm,
        isAgree: values.isAgree,
        reason: values.reason || "",
        hasAllergy: values.hasAllergy || ""
      });

      // Không còn form pending nữa
      setHasPendingForm(false);

      // Reset form sau khi submit thành công
      form.resetFields();

    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Gửi xác nhận thất bại!';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedStudent(null);
    setConsentForm(null);
    setHasConsentForm(false);
    setHasPendingForm(false);
    form.resetFields();
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
      <span className={`status-badge ${consentForm?.isAgree === "Đồng ý" ? "status-success" : "status-error"
        }`}>
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

          {/* Hiển thị form khi có form đang chờ phản hồi */}
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
                  <Input.TextArea
                    placeholder="Nhập dị ứng (nếu có)..."
                    autoSize={{ minRows: 1, maxRows: 2 }}
                  />
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
                      <Input.TextArea
                        placeholder="Nhập lý do từ chối..."
                        autoSize={{ minRows: 1, maxRows: 2 }}
                      />
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
            <h3>Lịch sử tiêm chủng</h3>
            <ul>
              {/* Hiển thị form hiện tại nếu đã xử lý */}
              {hasConsentForm &&
                !hasPendingForm &&
                consentForm?.isAgree &&
                (consentForm.isAgree === "Đồng ý" || consentForm.isAgree === "Không đồng ý") &&
                renderHistoryInfo()}

              {/* Hiển thị lịch sử từ vaccineHistory */}
              {consentForm?.vaccineHistory?.length > 0 &&
                consentForm.vaccineHistory.map((item, index) => (
                  <li key={index} className="history-card">
                    <span className={`status-badge ${item.isAgree === "Đồng ý" ? "status-success" : "status-error"
                      }`}>
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

              {/* Hiển thị thông báo trống */}
              {(!hasConsentForm || (!hasPendingForm && (!consentForm?.vaccineHistory || consentForm.vaccineHistory.length === 0))) && (
                <div className="empty-history">Không còn lịch sử tiêm chủng nào khác.</div>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentVaccineConfirmation;