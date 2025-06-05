import React, { useState } from 'react';
import './login.css';
import { Select, Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from "../../assets/images/logo.jpg";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(3);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

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
      
      // Chuyển đổi role number thành string để map với ROLE_MENUS
      let roleString = '';
      if (userRole === 1) roleString = 'ADMIN';
      else if (userRole === 2) roleString = 'NURSE';
      else if (userRole === 3) roleString = 'PARENT';
      
      localStorage.setItem('email', email);
      localStorage.setItem('role', userRole); // Lưu số role gốc
      localStorage.setItem('roleString', roleString); // Lưu thêm role string
      localStorage.setItem('token', 'your-auth-token');
      //Hiện message đăng nhập thành công 
      message.success('Đăng nhập thành công!!!')

      //Chuyển hướng đến các trang theo role
      if (userRole === 1) {
        navigate('/manager');
      } else if (userRole === 2) {
        navigate('/school-nurse');
      } else if (userRole === 3) {
        navigate('/parent');
      }

      // Redirect về trang user đã cố gắng truy cập trước đó
      // const from = location.state?.from || '/';
      // navigate(from, { replace: true });
      
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
