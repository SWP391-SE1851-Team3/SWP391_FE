import React, { useState } from 'react';
import './Login.css';
import { Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from "../../assets/images/logo.jpg";
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Thêm dòng này

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (values.username === 'admin' && values.password === 'admin') {
        localStorage.setItem('isAuthenticated', 'true');
        // Thêm user info nếu cần
        localStorage.setItem('user', JSON.stringify({
          username: values.username,
          role: 'admin'
        }));
        message.success('Đăng nhập thành công!');
        // Đảm bảo navigate được gọi sau khi set localStorage
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Có lỗi xảy ra khi đăng nhập!');
    } finally {
      setLoading(false);
    }
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
            form={form} // Thêm dòng này
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
