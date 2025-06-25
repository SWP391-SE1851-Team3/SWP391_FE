import React, { useState, useEffect } from 'react';
import { 
  SearchOutlined, 
  FilterOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Modal, 
  Form, 
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
import './post-vaccination.css';
import {getStudentVaccinationRecordsFollowedByNurse, getVaccinationRecordDetail} from '../../../../api/vaccinationAPI';  
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PostVaccinationObservation = () => {
  const [observations, setObservations] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedObservationDetail, setSelectedObservationDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const res = await getStudentVaccinationRecordsFollowedByNurse();
        // Map dữ liệu trả về cho phù hợp với cấu trúc mới
        const mapped = (res.data || []).map(item => ({
          id: item.studentId,
          vaccinationRecordID: item.vaccinationRecordID,
          studentID: item.studentID,
          studentName: item.fullName || '',
          className: item.className || '',
          batchID: item.batchID,
          vaccineName: item.vaccineTypeName || '',
          symptoms: item.symptoms,
          severity: item.severity,
          notes: item.notes,
          observation_notes: item.observation_notes,
          observation_time: item.observation_time,
          status: item.status || 'Đang theo dõi',
          createNurseID: item.createNurseID,
          createNurseName: item.createNurseName,
          editNurseID: item.editNurseID,
          editNurseName: item.editNurseName,
          parentID: item.parentID,
          vaccine: item.vaccineTypeName || '',
          observationTime: item.observationTime ? new Date(item.observationTime).toLocaleString('vi-VN') : '',
          observationNotes: item.observationNotes || '',
          nurseId: '',
          nurseName: '',
          followUpRequired: false,
          followUpDate: '',
          vaccinationDate: ''
        }));
        setObservations(mapped);
      } catch (err) {
        setObservations([]);
        message.error('Không thể tải danh sách theo dõi sau tiêm');
      }
    };
    fetchObservations();
  }, []);

  const filteredObservations = observations.filter(observation => {
    const matchesSearch = observation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (observation.observationNotes || observation.symptoms || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || observation.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || observation.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none': return 'success';
      case 'mild': return 'warning';
      case 'moderate': return 'processing';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'none': return 'Không có';
      case 'mild': return 'Nhẹ';
      case 'moderate': return 'Vừa';
      case 'severe': return 'Nặng';
      default: return severity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'success';
      case 'Đang theo dõi': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'Hoàn thành';
      case 'Đang theo dõi': return 'Đang theo dõi';
      default: return status;
    }
  };

  const stats = {
    total: observations.length,
    noReaction: observations.filter(o => o.severity === 'none').length,
    mildReaction: observations.filter(o => o.severity === 'mild').length,
    monitoring: observations.filter(o => o.status === 'Đang theo dõi').length
  };

  // Xem chi tiết
  const handleViewDetail = async (observation) => {
    try {
      const recordId = observation.vaccinationRecordID || observation.id;
      const res = await getVaccinationRecordDetail(recordId);
      setSelectedObservationDetail(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      message.error('Không thể lấy chi tiết theo dõi sau tiêm');
    }
  };

  return (
    <div className="post-vaccination-container">
      <div className="post-vaccination-header">
        <div>
          <Title level={2}>Theo dõi sau tiêm chủng</Title>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số quan sát" 
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Không phản ứng" 
              value={stats.noReaction}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đang theo dõi" 
              value={stats.monitoring}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Bộ lọc" className="post-vaccination-filters">
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm học sinh, triệu chứng..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="Mức độ nghiêm trọng"
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="none">Không có</Option>
              <Option value="mild">Nhẹ</Option>
              <Option value="moderate">Vừa</Option>
              <Option value="severe">Nặng</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Đang theo dõi">Đang theo dõi</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button icon={<FilterOutlined />} block>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Observations List */}
      <div className="post-vaccination-list">
        {filteredObservations.map((obs) => (
          <div key={obs.id} className="post-card">
            <div className="post-card-header">
              <div>
                <Title level={4}>{obs.studentName}</Title>
                <Text type="secondary">
                  Lớp: {obs.className} | Vaccine: {obs.vaccine}
                </Text>
              </div>
              <Badge 
                status={getStatusColor(obs.status)} 
                text={getStatusText(obs.status)}
              />
            </div>
            <div className="post-card-info">
              <Space><Text type="secondary">Thời gian theo dõi:</Text> <Text>{obs.observationTime}</Text></Space>
              <Space><Text type="secondary">Mã học sinh:</Text> <Text>{obs.id}</Text></Space>
            </div>
            <div className="post-card-info">
              <Space><Text type="secondary">Ghi chú quan sát:</Text> <Text>{obs.observationNotes || obs.symptoms}</Text></Space>
             
            </div>
            <div className="post-card-actions">
              <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(obs)}>Xem chi tiết</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 20, color: '#69CD32' }}>Chi tiết theo dõi sau tiêm</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        bodyStyle={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedObservationDetail && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="user"></span> Học sinh:</Text><br />
                <Text strong style={{ fontSize: 16 }}>{selectedObservationDetail.studentName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="class"></span> Lớp:</Text><br />
                <Text strong>{selectedObservationDetail.className}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="vaccine"></span> Tên vaccine:</Text><br />
                <Text strong>{selectedObservationDetail.vaccineName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="status"></span> Trạng thái:</Text><br />
                <Text strong>{selectedObservationDetail.status}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="nurse"></span> Y tá tạo:</Text><br />
                <Text>{selectedObservationDetail.createNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="nurse-edit"></span> Y tá chỉnh sửa:</Text><br />
                <Text>{selectedObservationDetail.editNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="calendar"></span> Ngày giờ theo dõi:</Text><br />
                <Text>{selectedObservationDetail.observation_time ? selectedObservationDetail.observation_time.replace('T', ' ').substring(0, 16) : ''}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="symptom"></span> Triệu chứng:</Text><br />
                <Text>{selectedObservationDetail.symptoms}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="severity"></span> Mức độ:</Text><br />
                <Text>{selectedObservationDetail.severity}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="note"></span> Ghi chú:</Text><br />
                <Text>{selectedObservationDetail.notes}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong><span role="img" aria-label="observation"></span> Ghi chú theo dõi:</Text><br />
                <Text>{selectedObservationDetail.observation_notes}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PostVaccinationObservation; 