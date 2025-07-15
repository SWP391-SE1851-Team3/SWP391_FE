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
import {getStudentVaccinationRecordsFollowedByNurse, getVaccinationRecordDetail, updateStudentFollowedByNurse} from '../../../../api/vaccinationAPI';
import { formatDateTime } from '../../../../utils/formatDate';  
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
          studentId: item.studentId,
          studentName: item.fullName || '',
          className: item.className || '',
          observationNotes: item.observationNotes || '',
          vaccineTypeName: item.vaccineTypeName || '',
          observationTime: item.observationTime,
          status: item.status || '',
          recordId: item.recordId
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'success';
      case 'Cần theo dõi': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'Hoàn thành';
      case 'Cần theo dõi': return 'Cần theo dõi';
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
      // Map dữ liệu về đúng format mới
      const data = res.data || {};
      setSelectedObservationDetail({
        notes: data.notes,
        observation_time: data.observation_time,
        symptoms: data.symptoms,
        severity: data.severity,
        observation_notes: data.observation_notes,
        status: data.status,
        className: data.className,
        consentId: data.consentId,
        batchID: data.batchID,
        vaccinationRecordID: data.vaccinationRecordID,
        vaccineName: data.vaccineName,
        studentID: data.studentID,
        createNurseID: data.createNurseID,
        createNurseName: data.createNurseName,
        editNurseName: data.editNurseName,
        editNurseID: data.editNurseID,
        studentName: data.studentName
      });
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
        <Col span={8}>
          <Card>
            <Statistic 
              title="Tổng số quan sát" 
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Không phản ứng" 
              value={stats.noReaction}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col span={8}>
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

        <div className="post-vaccination-filters">    
            <Input
              placeholder="Tìm kiếm học sinh, triệu chứng..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style ={{width: 300}}
              allowClear
            />
            <Select
           
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="Mức độ nghiêm trọng"
              style = {{width:220}}
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="none">Không có</Option>
              <Option value="mild">Nhẹ</Option>
              <Option value="moderate">Vừa</Option>
              <Option value="severe">Nặng</Option>
            </Select>      
            <Select
              style={{ width: 180 }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Cần theo dõi">Cần theo dõi</Option>
            </Select>       
        </div>

      {/* Observations List */}
      <div className="post-vaccination-list">
        {filteredObservations.map((obs) => (
          <div key={obs.recordId || obs.vaccinationRecordID || obs.id} className="post-card">
            <div className="post-card-header">
              <div>
                <Title level={4}>{obs.studentName}</Title>
                <Text type="secondary">
                  Lớp: {obs.className} | Vaccine: {obs.vaccineTypeName}
                </Text>
              </div>
              <Badge 
                status={getStatusColor(obs.status)} 
                text={getStatusText(obs.status)}
              />
            </div>
            <div className="post-card-info">
              <Space><Text type="secondary">Thời gian theo dõi:</Text> <Text>{formatDateTime(obs.observationTime)}</Text></Space>
            
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
        styles={{ background: '#f7f8fc', borderRadius: 12, padding: 24 }}
      >
        {selectedObservationDetail && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(24,144,255,0.08)', border: '1px solid #e6f7ff' }}>
            <Row gutter={[24, 16]}>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Học sinh:</Text><br />
                <Text strong style={{ fontSize: 16 }}>{selectedObservationDetail.studentName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Lớp:</Text><br />
                <Text strong>{selectedObservationDetail.className}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Tên vaccine:</Text><br />
                <Text strong>{selectedObservationDetail.vaccineName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Trạng thái:</Text><br />
                <Text strong>{selectedObservationDetail.status}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Y tá tạo:</Text><br />
                <Text>{selectedObservationDetail.createNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Y tá chỉnh sửa:</Text><br />
                <Text>{selectedObservationDetail.editNurseName}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ngày giờ theo dõi:</Text><br />
                <Text>{formatDateTime(selectedObservationDetail.observationTime || selectedObservationDetail.observation_time)}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Triệu chứng:</Text><br />
                <Text>{selectedObservationDetail.symptoms}</Text>
              </Col>
              <Col span={12} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Mức độ:</Text><br />
                <Text>{selectedObservationDetail.severity}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ghi chú:</Text><br />
                <Text>{selectedObservationDetail.notes}</Text>
              </Col>
              <Col span={24} style={{ marginBottom: 6 }}>
                <Text type="secondary" strong>Ghi chú theo dõi:</Text><br />
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