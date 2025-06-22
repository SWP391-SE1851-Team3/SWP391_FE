import React, { useState } from 'react';
import './login.css';
import { Form, Input, Button, Checkbox, Typography, message, Select } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from "../../assets/images/logo.jpg";
import { useNavigate, useLocation } from 'react-router-dom';
import { loginByRole } from '../../api/auth';

const { Title, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await loginByRole(values.role, values.email, values.password);
      const data = response?.data;

      if (!data || typeof data.role !== 'number') {
        message.error('Dữ liệu đăng nhập không hợp lệ!');
        return;
      }

      const {
        email,
        role: userRole,
        parentId,
        nurseId,
        token
      } = data;
      const fullname = data.fullname || data.fullName;

      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('email', email);
      localStorage.setItem('role', String(userRole));
      localStorage.setItem('token', token || 'your-auth-token');
      if (parentId) localStorage.setItem('parentId', parentId);
      if (fullname) localStorage.setItem('fullname', fullname);
      if (nurseId) localStorage.setItem('nurseId', nurseId);

      message.success('Đăng nhập thành công!');

      // Điều hướng theo vai trò
      switch (userRole) {
        case 1:
          navigate('/parent');
          window.location.reload();
          break;
        case 2:
          navigate('/school-nurse');
          window.location.reload();
          break;
        case 3:
          navigate('/manager');
          window.location.reload();
          break;
        default:
          message.warning('Vai trò không hợp lệ!');
          break;
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      message.error('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <img src={logo} alt="Logo " />
        <h1 className="slide-up">Hệ Thống Y Tế Học Đường</h1>
        <p className="slide-up delay-1">
          Hệ thống quản lý sức khỏe toàn diện cho trường học, kết nối phụ huynh và đội ngũ y tế.
        </p>
        <ul className="features-list">
          <li className="slide-up delay-2">📋 Quản lý hồ sơ sức khỏe học sinh</li>
          <li className="slide-up delay-3">💊 Gửi và theo dõi phiếu gửi thuốc</li>
          <li className="slide-up delay-4">💉 Quản lý tiêm chủng và kiểm tra sức khỏe</li>
          <li className="slide-up delay-5">🏥 Theo dõi sự kiện y tế tại trường</li>
          <li className="slide-up delay-6">🔔 Nhận thông báo quan trọng về sức khỏe học sinh</li>
        </ul>
      </div>

      <div className="login-form-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
          <span>Hệ thống Y tế Học đường</span>
        </div>

        <div className="login-form">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            form={form}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Select.Option value={1}>Phụ huynh</Select.Option>
                <Select.Option value={2}>Nhân viên y tế</Select.Option>
                <Select.Option value={3}>Quản lý</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <a href="#" className="forgot-password" style={{ float: 'right' }}>
                Quên mật khẩu?
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-btn"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
