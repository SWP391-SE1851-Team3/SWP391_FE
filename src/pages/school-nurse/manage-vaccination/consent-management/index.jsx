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
import { formatDate } from '../../../../utils/formatDate';
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
          scheduledDate: item.scheduledDate ? item.scheduledDate.substring(0, 10) : '',
          sentDate: item.send_date ? item.send_date.substring(0, 10) : '',
          expireDate: item.expire_date ? item.expire_date.substring(0, 10) : '',
          className: item.className || '',
          location: item.location || '',
          status: mapStatusToUI(item.status || ''),
          reason: item.reason || '',
          isAgree: mapIsAgree(item.isAgree),
          hasAllergy: item.hasAllergy || '',
          batchID: item.bacthID || '',
        }));
        setConsents(mapped);
        console.log('consents:', mapped);
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
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = consent.isAgree === statusFilter;
    }
    const matchesClass = classFilter === 'all' || consent.className === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ phản hồi': return 'warning';
      case 'Đồng ý': return 'success';
      case 'Không đồng ý': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 'Chờ xác nhận';
      case 'Đã phê duyệt': return 'Đã phê duyệt';
      case 'Từ chối': return 'Từ chối';
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
    pending: consents.filter(c => c.isAgree === 'Chờ phản hồi').length,
    approved: consents.filter(c => c.isAgree === 'Đồng ý').length,
    rejected: consents.filter(c => c.isAgree === 'Không đồng ý').length
  };

  // Mapping status for UI <-> API
  const mapStatusToUI = (status) => {
    if (status === 'ĐÃ PHÊ DUYỆT') return 'Đã phê duyệt';
    return status;
  };
  const mapStatusToAPI = (status) => {
    if (status === 'Đã phê duyệt') return 'ĐÃ PHÊ DUYỆT';
    return status;
  };

  // Mapping isAgree về 3 giá trị chuẩn
  const mapIsAgree = (val) => {
    if (!val || val.trim() === '' || val === 'Chờ phản hồi' || val === 'Chờ xác nhận') return 'Chờ phản hồi';
    if (val === true || val === 'Đồng ý' || val === 'Đã đồng ý' || val === 'Đã phê duyệt' || val === 'ĐÃ PHÊ DUYỆT') return 'Đồng ý';
    if (val === false || val === 'Không đồng ý' || val === 'Từ chối') return 'Không đồng ý';
    return 'Chờ phản hồi';
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
              title="Chờ xác nhận" 
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đã phê duyệt" 
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
      
    <div className="consent-management-filters">
            <Input.Search
              placeholder="Tìm kiếm học sinh, phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: 300}}
              allowClear
            />
            <Select
              style={{ width: 220 }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Chờ phản hồi">Chờ phản hồi</Option>
              <Option value="Đồng ý">Đồng ý</Option>
              <Option value="Không đồng ý">Không đồng ý</Option>
            </Select>
            <Select
              style={{ width: 180 }}
              value={classFilter}
              onChange={setClassFilter}
              placeholder="Lớp học"
            >
              <Option value="all">Tất cả lớp</Option>
              <Select.Option value="Lớp 5A">Lớp 5A</Select.Option>
              <Select.Option value="Lớp 4B">Lớp 4B</Select.Option>
              <Select.Option value="Lớp 3C">Lớp 3C</Select.Option>
              <Select.Option value="Lớp 2A">Lớp 2A</Select.Option>
              <Select.Option value="Lớp 1B">Lớp 1B</Select.Option>
            </Select>
        </div>
     

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
                status={getStatusColor(consent.isAgree)} 
                text={consent.isAgree}
              />
            </div>

            <div className="consent-card-info">
              <Space><Text type="secondary">Vaccine:</Text> <Text>{consent.vaccine}</Text></Space>            
              <Space><Text type="secondary">Địa điểm:</Text> <Text>{consent.location}</Text></Space>  
                         
            </div>
            <div className="consent-card-info">
              <Space><Text type="secondary">Ngày tiêm:</Text> <Text>{formatDate(consent.scheduledDate)}</Text></Space>
              <Space><Text type="secondary">Ngày gửi phiếu:</Text> <Text>{consent.sentDate}</Text></Space>
            </div>

            {consent.expireDate && (
              <div className="consent-card-info">
                <Space><Text type="secondary">Ngày hết hạn phản hồi:</Text> <Text>{consent.expireDate}</Text></Space>
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
              {consent.isAgree === 'Chờ phản hồi' && (
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
      title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết phiếu đồng ý</span>}
       
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedConsent && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
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
                <Text strong>{formatDate(selectedConsent.scheduledDate)}</Text>
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
                <Text strong>{mapIsAgree(selectedConsent.isAgree) || ''}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Dị ứng:</Text>
                <br />
                <Text strong>{selectedConsent.hasAllergy || 'Không'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Đồng ý tiêm:</Text>
                <br />
                <Text strong>{mapIsAgree(selectedConsent.isAgree) || ''}</Text>
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
