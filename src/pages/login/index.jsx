import React, { useState } from 'react';
import './login.css';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from "../../assets/images/logo.jpg";

const { Title, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    console.log('Login info:', values);

    // Giả lập xử lý đăng nhập
    setTimeout(() => {
      setLoading(false);
      alert('Đăng nhập thành công!');
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <img src={logo} alt="Logo " />
        <h1 level={2} className="slide-up" >Hệ Thống Y Tế Học Đường</h1>
        <p   className="slide-up delay-1" >
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
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
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
