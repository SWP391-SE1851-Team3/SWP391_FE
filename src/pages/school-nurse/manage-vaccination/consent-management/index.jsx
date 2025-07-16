import React, { useState, useEffect } from 'react';
import { 
  SendOutlined, 
  EyeOutlined
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
  Space, 
  message,
  Statistic,
  Badge,
  Alert,
  Spin
} from 'antd';
import './consent-management.css';
import { getConsentForms, getConsentFormDetail } from '../../../../api/vaccinationAPI';
import { formatDate } from '../../../../utils/formatDate';

const { Title, Text } = Typography;
const { Option } = Select;

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Mapping status for UI <-> API
  const mapStatusToUI = (status) => {
    if (status === 'ĐÃ PHÊ DUYỆT') return 'Đã phê duyệt';
    return status;
  };

  // Mapping isAgree về 3 giá trị chuẩn
  const mapIsAgree = (val) => {
    if (!val || val.trim() === '' || val === 'Chờ phản hồi' || val === 'Chờ xác nhận') return 'Chờ phản hồi';
    if (val === true || val === 'Đồng ý' || val === 'Đã đồng ý' || val === 'Đã phê duyệt' || val === 'ĐÃ PHÊ DUYỆT') return 'Đồng ý';
    if (val === false || val === 'Không đồng ý' || val === 'Từ chối') return 'Không đồng ý';
    return 'Chờ phản hồi';
  };

  // Fetch consents data
  useEffect(() => {
    const fetchConsents = async () => {
      setLoading(true);
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
        console.error('Error fetching consents:', err);
        setConsents([]);
        message.error('Không thể tải danh sách phiếu đồng ý');
      } finally {
        setLoading(false);
      }
    };
    fetchConsents();
  }, []);

  // Filter consents
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

  // Get unique class names for filter
  const uniqueClasses = [...new Set(consents.map(consent => consent.className).filter(Boolean))];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ phản hồi': return 'warning';
      case 'Đồng ý': return 'success';
      case 'Không đồng ý': return 'error';
      default: return 'default';
    }
  };

  const handleResendConsent = async (consentId) => {
    try {
      // TODO: Implement resend API call
      console.log('Resending consent:', consentId);
      message.success('Phiếu đồng ý đã được gửi lại cho phụ huynh');
    } catch (err) {
      message.error('Không thể gửi lại phiếu đồng ý');
    }
  };

  const handleViewDetails = async (consent) => {
    setDetailLoading(true);
    try {
      const res = await getConsentFormDetail(consent.id);
      setSelectedConsent(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching consent detail:', err);
      message.error('Không thể lấy chi tiết phiếu đồng ý');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedConsent(null);
  };

  // Calculate statistics
  const stats = {
    total: consents.length,
    pending: consents.filter(c => c.isAgree === 'Chờ phản hồi').length,
    approved: consents.filter(c => c.isAgree === 'Đồng ý').length,
    rejected: consents.filter(c => c.isAgree === 'Không đồng ý').length
  };

  return (
    <div className="consent-management-container">
      <div className="consent-management-header">
        <Title level={2}>Quản lý Phiếu đồng ý</Title>
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
          style={{ width: 300 }}
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
          {uniqueClasses.map(className => (
            <Option key={className} value={className}>{className}</Option>
          ))}
        </Select>
      </div>

      {/* Consent List */}
      <Spin spinning={loading}>
        <div className="consent-management-list">
          {filteredConsents.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">Không có dữ liệu phiếu đồng ý</Text>
              </div>
            </Card>
          ) : (
            filteredConsents.map((consent) => (
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
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">Vaccine:</Text>
                        <br />
                        <Text>{consent.vaccine}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">Địa điểm:</Text>
                        <br />
                        <Text>{consent.location}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">Ngày tiêm:</Text>
                        <br />
                        <Text>{formatDate(consent.scheduledDate)}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">Ngày gửi phiếu:</Text>
                        <br />
                        <Text>{consent.sentDate}</Text>
                      </div>
                    </Col>
                    {consent.expireDate && (
                      <Col span={24}>
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary">Ngày hết hạn phản hồi:</Text>
                          <br />
                          <Text>{consent.expireDate}</Text>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>

                {consent.reason && (
                  <Alert
                    message="Lý do"
                    description={consent.reason}
                    type="info"
                    className="consent-card-alert"
                    style={{ marginTop: 16 }}
                  />
                )}

                <div className="consent-card-actions">
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(consent)}
                    loading={detailLoading}
                  >
                    Xem chi tiết
                  </Button>
                  {consent.isAgree === 'Chờ phản hồi' && (
                    <Button 
                      icon={<SendOutlined />}
                      onClick={() => handleResendConsent(consent.id)}
                      type="primary"
                    >
                      Gửi lại
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Spin>

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>
            Chi tiết phiếu đồng ý
          </span>
        }
        open={isDetailModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedConsent && (
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: '0 2px 8px rgba(24,144,255,0.08)', 
            border: '1px solid #e6f7ff' 
          }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Học sinh:</Text>
                  <br />
                  <Text strong>{selectedConsent.fullNameOfStudent || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Lớp:</Text>
                  <br />
                  <Text strong>{selectedConsent.className || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Phụ huynh:</Text>
                  <br />
                  <Text strong>{selectedConsent.fullNameOfParent || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Vaccine:</Text>
                  <br />
                  <Text strong>{selectedConsent.vaccineName || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Ngày tiêm dự kiến:</Text>
                  <br />
                  <Text strong>{formatDate(selectedConsent.scheduledDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Ngày gửi phiếu:</Text>
                  <br />
                  <Text strong>
                    {selectedConsent.send_date ? selectedConsent.send_date.substring(0, 10) : 'N/A'}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Ngày hết hạn phản hồi:</Text>
                  <br />
                  <Text strong>
                    {selectedConsent.expire_date ? selectedConsent.expire_date.substring(0, 10) : 'N/A'}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Trạng thái:</Text>
                  <br />
                  <Badge 
                    status={getStatusColor(mapIsAgree(selectedConsent.isAgree))} 
                    text={mapIsAgree(selectedConsent.isAgree) || 'N/A'}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Dị ứng:</Text>
                  <br />
                  <Text strong>{selectedConsent.hasAllergy || 'Không'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Batch ID:</Text>
                  <br />
                  <Text strong>{selectedConsent.bacthID || 'N/A'}</Text>
                </div>
              </Col>
            </Row>
            {selectedConsent.reason && (
              <Alert
                message="Lý do"
                description={selectedConsent.reason}
                type="info"
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsentManagement;