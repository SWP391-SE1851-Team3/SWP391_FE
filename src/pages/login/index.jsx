import React, { useState } from 'react';
import './Login.css';
import { Form, Input, Button, Checkbox, Typography, Select} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from "../../assets/images/logo.jpg";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(3);
  const [form] = Form.useForm(); // ✅ Đặt ở đây
  const navigate = useNavigate();

  const getEndpoint = (role) => {
    switch (role) {
      case 1: return "http://localhost:8080/api/managers/login";
      case 2: return "http://localhost:8080/api/SchoolNurses/login";
      case 3: return "http://localhost:8080/api/parents/login";
      default: return "";
    }
  };
  const endpoint = getEndpoint(role);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(endpoint, {
        email: values.email,
        password: values.password
      });
      const { email, role: userRole } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('role', userRole);
      alert('Đăng nhập thành công!');
      if (userRole === 1) {
        navigate('/manager');
      } else if (userRole === 2) {
        navigate('/school-nurse');
      } else if (userRole === 3) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      alert('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin đăng nhập.');
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

            <Form.Item label="Đăng nhập với tư cách">
              <Select value={role} onChange={(value) => setRole(value)}>
                <Option value={1}>Quản lý</Option>
                <Option value={2}>Nhân viên y tế</Option>
                <Option value={3}>Phụ huynh</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <a href="#" className="forgot-password" style={{ float: 'right' }}>Quên mật khẩu?</a>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className="login-btn">
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
