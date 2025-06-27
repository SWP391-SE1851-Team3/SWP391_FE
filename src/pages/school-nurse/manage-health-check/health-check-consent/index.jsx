import React, { useState, useEffect } from 'react';
import { SendOutlined, EyeOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Modal, Typography, Row, Col, Tag, Space, message, Statistic, Badge, Alert } from 'antd';
import './health-check-consent.css';
import {getAllHealthConsents} from '../../../../api/healthCheckAPI';
const { Title, Text } = Typography;
const { Option } = Select;

const HealthCheckConsent = () => {
  const [consents, setConsents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);

  useEffect(() => {
    const fetchConsents = async () => {
      try {
        const res = await getAllHealthConsents();
        setConsents(res);
      } catch (err) {
        setConsents([]);
        message.error('Không thể tải danh sách phiếu xác nhận');
      }
    };
    fetchConsents();
  }, []);

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.isAgreed === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isAgreed) => {
    switch (isAgreed) {
      case 'Chờ phản hồi': return 'warning';
      case 'Đã đồng ý': return 'success';
      case 'Đã từ chối': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (isAgreed) => isAgreed;

  const stats = {
    total: consents.length,
    pending: consents.filter(c => c.isAgreed === 'Chờ phản hồi').length,
    agreed: consents.filter(c => c.isAgreed === 'Đã đồng ý').length,
    rejected: consents.filter(c => c.isAgreed === 'Đã từ chối').length
  };

  return (
    <div className="health-check-consent-container">
      <div className="health-check-consent-header">
        <div>
          <Title level={2}>Quản lý Phiếu đồng ý khám sức khỏe</Title>
        </div>
      </div>
      <Row gutter={16} className="health-check-consent-stats">
        <Col span={6}><Card><Statistic title="Tổng phiếu" value={stats.total} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Chờ phản hồi" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đã đồng ý" value={stats.agreed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đã từ chối" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      <Card className="health-check-consent-filters" style={{ marginBottom: 24 }} title="Bộ lọc">
        <Row gutter={16}>
          <Col span={6}><Input placeholder="Tìm kiếm học sinh, phụ huynh..." prefix={<SearchOutlined />} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} allowClear /></Col>
          <Col span={6}><Select style={{ width: '100%' }} value={statusFilter} onChange={setStatusFilter} placeholder="Trạng thái">
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="Chờ phản hồi">Chờ phản hồi</Option>
            <Option value="Đã đồng ý">Đã đồng ý</Option>
            <Option value="Đã từ chối">Đã từ chối</Option>
          </Select></Col>
          <Col span={6}><Button icon={<FilterOutlined />} block>Áp dụng bộ lọc</Button></Col>
        </Row>
      </Card>
      <div className="health-check-consent-list">
        {filteredConsents.map((consent) => (
          <div key={consent.formID} className="health-check-consent-card">
            <div className="health-check-consent-card-header">
              <div>
                <Title level={4} style={{ marginBottom: 0 }}>{consent.studentName}</Title>
                <div style={{ marginBottom: 2 }}>
                  <Text type="secondary">Lớp: </Text><Text>{consent.className}</Text>
                </div>
                <div style={{ marginBottom: 2 }}>
                  <Text type="secondary">Đợt khám: </Text><Text>{consent.healthScheduleName}</Text>
                </div>
              </div>
              <Badge status={getStatusColor(consent.isAgreed)} text={getStatusText(consent.isAgreed)} />
            </div>
            <div className="health-check-consent-card-info">
              <Space><Text type="secondary">Ngày gửi phiếu:</Text> <Text>{consent.send_date ? consent.send_date.substring(0, 10) : ''}</Text></Space>
              <Space><Text type="secondary">Ngày hết hạn phản hồi:</Text> <Text>{consent.expire_date ? consent.expire_date.substring(0, 10) : ''}</Text></Space>
            </div>
            {consent.notes && (
              <div style={{ marginTop: 4 }}>
                <Alert message="Ghi chú" description={consent.notes} type="info" className="health-check-consent-card-alert" />
              </div>
            )}
            <div className="health-check-consent-card-actions">
              <Button icon={<EyeOutlined />} onClick={() => { setSelectedConsent(consent); setIsDetailModalOpen(true); }}>Xem chi tiết</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết phiếu xác nhận</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedConsent && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Học sinh:</Text><br />
                <Text strong style={{ fontSize: 16 }}>{selectedConsent.studentName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Lớp:</Text><br />
                <Text strong>{selectedConsent.className}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Đợt khám:</Text><br />
                <Text strong>{selectedConsent.healthScheduleName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Trạng thái:</Text><br />
                <Text strong>{getStatusText(selectedConsent.isAgreed)}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ngày gửi phiếu:</Text><br />
                <Text>{selectedConsent.send_date ? selectedConsent.send_date.replace('T', ' ').substring(0, 16) : ''}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ngày hết hạn phản hồi:</Text><br />
                <Text>{selectedConsent.expire_date ? selectedConsent.expire_date.replace('T', ' ').substring(0, 16) : ''}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ghi chú:</Text><br />
                <Text>{selectedConsent.notes}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckConsent;
