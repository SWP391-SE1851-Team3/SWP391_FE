import React, { useState, useEffect } from 'react';
import { 
  SendOutlined, 
  EyeOutlined, 
  FilterOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Space, 
  message,
  Statistic,
  Badge,
  Alert
} from 'antd';
import './consent-management.css';
import {getConsentForms, getConsentFormDetail} from '../../../../api/vaccinationAPI';
const { Title, Text } = Typography;
const { Option } = Select;

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);

  useEffect(() => {
    const fetchConsents = async () => {
      try {
        const res = await getConsentForms();
        // Mapping dữ liệu trả về cho phù hợp UI hiện tại với kiểu dữ liệu mới
        const mapped = (res.data || []).map(item => ({
          id: item.consent_id,
          studentName: item.fullNameOfStudent || '',
          parentName: item.fullNameOfParent || '',
          vaccine: item.vaccineName || '',
          scheduledDate: item.localDate || (item.scheduledDate ? item.scheduledDate.substring(0, 10) : ''),
          consentStatus: item.status || '',
          sentDate: item.send_date ? item.send_date.substring(0, 10) : '',
          responseDate: item.expire_date ? item.expire_date.substring(0, 10) : '',
          reason: item.reason || '',
          className: item.className || '',
          hasAllergy: item.hasAllergy || '',
          isAgree: item.isAgree || ''
        }));
        setConsents(mapped);
      } catch (err) {
        setConsents([]);
        message.error('Không thể tải danh sách phiếu đồng ý');
      }
    };
    fetchConsents();
  }, []);

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.consentStatus === statusFilter;
    const matchesClass = classFilter === 'all' || consent.className === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'approved': return 'Đã đồng ý';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  const handleResendConsent = (consentId) => {
    message.success('Phiếu đồng ý đã được gửi lại cho phụ huynh');
  };

  const handleViewDetails = async (consent) => {
    try {
      const res = await getConsentFormDetail(consent.id);
      setSelectedConsent(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      message.error('Không thể lấy chi tiết phiếu đồng ý');
    }
  };

  const stats = {
    total: consents.length,
    pending: consents.filter(c => c.consentStatus === 'pending').length,
    approved: consents.filter(c => c.consentStatus === 'approved').length,
    rejected: consents.filter(c => c.consentStatus === 'rejected').length
  };

  return (
    <div className="consent-management-container">
      <div className="consent-management-header">
        <div>
          <Title level={2}>Quản lý Phiếu đồng ý</Title>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="consent-management-stats">
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng phiếu" 
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Chờ phản hồi" 
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đã đồng ý" 
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Từ chối" 
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Bộ lọc" className="consent-management-filters">
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm học sinh, phụ huynh..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ phản hồi</Option>
              <Option value="approved">Đã đồng ý</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={classFilter}
              onChange={setClassFilter}
              placeholder="Lớp học"
            >
              <Option value="all">Tất cả lớp</Option>
              <Option value="6A">Lớp 6A</Option>
              <Option value="6B">Lớp 6B</Option>
              <Option value="6C">Lớp 6C</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button icon={<FilterOutlined />} block>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Consent List */}
      <div className="consent-management-list">
        {filteredConsents.map((consent) => (
          <div key={consent.id} className="consent-card">
            <div className="consent-card-header">
              <div>
                <Title level={4}>{consent.studentName}</Title>
                <Text type="secondary">
                  Lớp: {consent.className} | Phụ huynh: {consent.parentName}
                </Text>
              </div>
              <Badge 
                status={getStatusColor(consent.consentStatus)} 
                text={getStatusText(consent.consentStatus)}
              />
            </div>

            <div className="consent-card-info">
              <Space><Text type="secondary">Vaccine:</Text> <Text>{consent.vaccine}</Text></Space>
              <Space><Text type="secondary">Ngày tiêm:</Text> <Text>{consent.scheduledDate}</Text></Space>
              <Space><Text type="secondary">Gửi phiếu:</Text> <Text>{consent.sentDate}</Text></Space>
            </div>

            {consent.responseDate && (
              <div className="consent-card-info">
                <Space><Text type="secondary">Ngày phản hồi:</Text> <Text>{consent.responseDate}</Text></Space>
              </div>
            )}

            {consent.reason && (
              <Alert
                message="Lý do"
                description={consent.reason}
                type="info"
                className="consent-card-alert"
              />
            )}

            <div className="consent-card-actions">
              <Button 
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(consent)}
              >
                Xem chi tiết
              </Button>
              {consent.consentStatus === 'pending' && (
                <Button 
                  icon={<SendOutlined />}
                  onClick={() => handleResendConsent(consent.id)}
                >
                  Gửi lại
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết phiếu đồng ý"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedConsent && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Học sinh:</Text>
                <br />
                <Text strong>{selectedConsent.fullNameOfStudent || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Lớp:</Text>
                <br />
                <Text strong>{selectedConsent.className || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Phụ huynh:</Text>
                <br />
                <Text strong>{selectedConsent.fullNameOfParent || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Vaccine:</Text>
                <br />
                <Text strong>{selectedConsent.vaccineName || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày tiêm dự kiến:</Text>
                <br />
                <Text strong>{selectedConsent.localDate || (selectedConsent.scheduledDate ? selectedConsent.scheduledDate.substring(0, 10) : '')}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày gửi phiếu:</Text>
                <br />
                <Text strong>{selectedConsent.send_date ? selectedConsent.send_date.substring(0, 10) : ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày hết hạn phản hồi:</Text>
                <br />
                <Text strong>{selectedConsent.expire_date ? selectedConsent.expire_date.substring(0, 10) : ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Trạng thái:</Text>
                <br />
                <Text strong>{selectedConsent.status || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Dị ứng:</Text>
                <br />
                <Text strong>{selectedConsent.hasAllergy || 'Không'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Đồng ý tiêm:</Text>
                <br />
                <Text strong>{selectedConsent.isAgree || ''}</Text>
              </Col>
            </Row>
            {selectedConsent.reason && (
              <Alert
                message="Lý do"
                description={selectedConsent.reason}
                type="info"
                className="consent-card-alert"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsentManagement;
