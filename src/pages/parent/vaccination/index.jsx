import React, { useState, useEffect } from 'react';
import './ParentVaccineConfirmation.css';
import { getStudentsByParent, ViewConsentForm, submitConsentForm } from '../../../api/consent_form';
import { message, Form, Input, Radio, Button, Spin } from 'antd';

const ParentVaccineConfirmation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [consentForm, setConsentForm] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
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
    } catch {
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
      const data = res?.data;

      if (!data) {
        message.error("Không có dữ liệu consent form!");
        return;
      }

      const consentData = {
        consent_form_id: data.consent_form_id || data.id,
        fullnameOfParent: data.fullnameOfParent || "Chưa có dữ liệu",
        fullNameOfStudent: data.fullNameOfStudent || "Chưa có dữ liệu",
        className: data.className || "Chưa có dữ liệu",
        vaccineName: data.name || "Chưa có dữ liệu",
        vaccineHistory: data.vaccineHistory || [],
        isAgree: data.isAgree ?? null,
        reason: data.reason || "",
        hasAllergy: data.hasAllergy || ""
      };

      setConsentForm(consentData);
      setFormDisabled(consentData.isAgree !== null);  // Nếu đã xác nhận thì disable form
      form.setFieldsValue({
        isAgree: consentData.isAgree,
        reason: consentData.reason,
        hasAllergy: consentData.hasAllergy
      });

    } catch (error) {
      console.error("Lỗi khi lấy consent form:", error);
      message.error("Không thể lấy thông tin chi tiết");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSubmit = async (values) => {
    if (values.isAgree === 0 && !values.reason.trim()) {
      message.warning('Vui lòng nhập lý do khi từ chối');
      return;
    }

    const payload = {
      consentFormId: consentForm.consent_form_id,  // camelCase theo BE
      isAgree: values.isAgree,
      reason: values.isAgree === 0 ? values.reason : '',
      hasAllergy: values.hasAllergy || ""
    };

    setSubmitting(true);
    try {
      await submitConsentForm(payload);
      message.success('Gửi xác nhận thành công!');
      // Sau khi submit xong sẽ khóa form
      setFormDisabled(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      message.error('Gửi xác nhận thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedStudent(null);
    setConsentForm(null);
    setFormDisabled(false);
    form.resetFields();
  };

  return (
    <div className="vaccine-record-container">
      {!selectedStudent ? (
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
      ) : loadingForm ? (
        <Spin tip="Đang tải thông tin chi tiết..." />
      ) : (
        <>
          <Button type="link" onClick={resetState}>← Quay lại</Button>

          {/* Thông tin chi tiết học sinh */}
          <div className="student-info">
            <h2>Thông tin học sinh</h2>
            <p><strong>Họ tên phụ huynh:</strong> {consentForm.fullnameOfParent}</p>
            <p><strong>Họ tên học sinh:</strong> {consentForm.fullNameOfStudent}</p>
            <p><strong>Lớp:</strong> {consentForm.className}</p>
            <p><strong>Vắc xin đăng ký:</strong> {consentForm.vaccineName}</p>
          </div>

          {/* Form xác nhận */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 24 }}
            disabled={formDisabled}
          >
            <Form.Item name="hasAllergy" label="Dị ứng (nếu có):">
              <Input.TextArea placeholder="Nhập dị ứng (nếu có)..." autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>

            <Form.Item
              name="isAgree"
              label="Bạn có đồng ý cho con tiêm vắc xin này không?"
              rules={[{ required: true, message: 'Vui lòng chọn đồng ý hay không đồng ý' }]}
            >
              <Radio.Group>
                <Radio value={1}>Đồng ý</Radio>
                <Radio value={0}>Không đồng ý</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item shouldUpdate={(prev, cur) => prev.isAgree !== cur.isAgree}>
              {({ getFieldValue }) => getFieldValue('isAgree') === 0 && (
                <Form.Item
                  name="reason"
                  label="Lý do từ chối (bắt buộc):"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                >
                  <Input.TextArea placeholder="Nhập lý do từ chối..." autoSize={{ minRows: 3 }} />
                </Form.Item>
              )}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={formDisabled}>
                Gửi xác nhận
              </Button>
            </Form.Item>
          </Form>

          {/* Lịch sử tiêm chủng */}
          <div className="history-section" style={{ marginTop: '40px' }}>
            <h3>Lịch sử tiêm chủng</h3>

            {/* Thông tin tổng quan lặp lại cho dễ xem */}
            <div className="student-summary" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p><strong>Học sinh:</strong> {consentForm.fullNameOfStudent} - Lớp {consentForm.className}</p>
              <p><strong>Phụ huynh:</strong> {consentForm.fullnameOfParent}</p>
              <p><strong>Vắc xin đăng ký:</strong> {consentForm.vaccineName}</p>
              <p>
                <strong>Trạng thái:</strong> {
                  consentForm.isAgree === null ? "Chưa xác nhận" :
                    consentForm.isAgree === 1 ? "Đã xác nhận đồng ý" :
                      "Từ chối tiêm"
                }
              </p>
            </div>

            {consentForm.vaccineHistory.length > 0 ? (
              <ul>
                {consentForm.vaccineHistory.map((item, index) => (
                  <li key={index} className="history-item" style={{ marginBottom: '15px' }}>
                    <p><strong>Ngày tiêm:</strong> {item.date}</p>
                    <p><strong>Vắc xin:</strong> {item.vaccine}</p>
                    <p><strong>Địa điểm:</strong> {item.location}</p>
                    <p><strong>Kết quả:</strong> {item.result}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có lịch sử tiêm chủng.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentVaccineConfirmation;
