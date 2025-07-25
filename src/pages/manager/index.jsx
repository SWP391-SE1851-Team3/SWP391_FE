import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Spin, Empty, notification, Statistic, Progress, DatePicker } from 'antd';
import {
    ReloadOutlined, DownloadOutlined, RiseOutlined,
    TeamOutlined, FileTextOutlined, AlertOutlined,
    CheckCircleOutlined, ClockCircleOutlined,
    HeartOutlined, SafetyOutlined, BarChartOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { Column } from '@ant-design/charts';
import './ManagerPage.css';
import { getFullReport } from '../../api/manager_dashboard';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function ManagerPage() {
    const [loading, setLoading] = useState(true);
    const [systemStats, setSystemStats] = useState({});
    const [medicationStats, setMedicationStats] = useState({});
    const [medicalEventStats, setMedicalEventStats] = useState({});
    const [vaccinationStats, setVaccinationStats] = useState({});
    const [healthCheckStats, setHealthCheckStats] = useState({});
    const [dateRange, setDateRange] = useState([null, null]);

    const getDateParams = () => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            return {
                startDate: dateRange[0].startOf('day').format('YYYY-MM-DD'),
                endDate: dateRange[1].endOf('day').format('YYYY-MM-DD')
            };
        }
        return {};
    };

const fetchData = async () => {
    setLoading(true);
    try {
        const params = getDateParams();
        console.log('Sending params:', params); // Debug
        
        const response = await getFullReport(params);
        console.log('API Response:', response); // Debug để xem cấu trúc
        
        
        const data = response.data || {};
        
        console.log('Setting systemStats:', data.systemStats); // Debug
        console.log('Setting medicationStats:', data.medicationStats); // Debug
        
        setSystemStats(data.systemStats || {});
        setMedicationStats(data.medicationStats || {});
        setMedicalEventStats(data.medicalEventStats || {});
        setVaccinationStats(data.vaccinationStats || {});
        setHealthCheckStats(data.healthCheckStats || {});
        
        notification.success({
            message: 'Thành công',
            description: 'Dữ liệu đã được cập nhật mới nhất.',
            placement: 'topRight',
            duration: 2
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        notification.error({
            message: 'Lỗi tải dữ liệu',
            description: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.',
            placement: 'topRight'
        });
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchData();
    }, []);

    const handleDateChange = (dates) => {
        setDateRange(dates);
        setTimeout(() => fetchData(), 0);
    };

    const handleDownloadFullReport = async () => {
        try {
            const params = getDateParams(); // 👉 chứa startDate, endDate
            const response = await getFullReport(params);

            console.log("Đang xuất báo cáo với:", params);
            console.log("Dữ liệu trả về:", response.data);

            const data = response.data || {};
            const wb = XLSX.utils.book_new();

            Object.entries(data).forEach(([sheetName, stats]) => {
                const sheetData = Object.entries(stats).map(([key, value]) => ({
                    Name: key,
                    Value: value
                }));
                const ws = XLSX.utils.json_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            let filename = 'dashboard-report.xlsx';
            if (params.startDate && params.endDate) {
                filename = `dashboard-report-${params.startDate}_to_${params.endDate}.xlsx`;
            }

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            notification.success({
                message: 'Thành công',
                description: 'Báo cáo đã được tải về.',
            });

        } catch (error) {
            console.error("Error generating report:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tạo báo cáo. Vui lòng thử lại.',
            });
        }
    };


    const consentRatePercent = vaccinationStats.consentRate || 0;
    const pendingMedications = (medicationStats.totalSubmissions || 0) - (medicationStats.approvedSubmissions || 0) - (medicationStats.rejectedSubmissions || 0);

    const medicalEventColumnData = [
        { type: 'Tất cả', value: medicalEventStats.totalEvents || 0 },
        { type: 'Đã xử lý', value: medicalEventStats.completedEvents || 0 },
        { type: 'Đang xử lý', value: medicalEventStats.pendingEvents || 0 },
        { type: 'Khẩn cấp', value: medicalEventStats.emergencyEvents || 0 }
    ];

    const medicalEventColumnConfig = {
        data: medicalEventColumnData,
        isGroup: true,
        xField: 'type',
        yField: 'value',
        tooltip: false,
        color: ({ type }) => ({
            'Tất cả': '#1890FF',
            'Đã xử lý': '#52C41A',
            'Đang xử lý': '#FAAD14',
            'Khẩn cấp': '#FF4D4F'
        }[type] || '#ccc'),
        legend: false,
        meta: {
            type: { alias: 'Loại' },
            value: { alias: 'Số lượng' }
        }
    };


    const healthCheckColumnData = [
        { type: 'Tổng lịch', value: healthCheckStats.totalSchedules || 0 },
        { type: 'Hoàn thành', value: healthCheckStats.completedSchedules || 0 },
        { type: 'Đã khám', value: healthCheckStats.totalChecked || 0 }
    ];
    const healthCheckColumnConfig = {
        data: healthCheckColumnData,
        isGroup: false,
        xField: 'type',
        yField: 'value',
        color: ['#1890FF', '#52C41A', '#FAAD14'],
        legend: false,
        tooltip: false,
        xAxis: { label: null },
        yAxis: { label: { fontSize: 11 } },
        meta: {
            type: { alias: 'Chỉ số' },
            value: { alias: 'Giá trị' }
        }
    };

    const healthCheckCompleteRate =
        (healthCheckStats.totalSchedules > 0 && healthCheckStats.completedSchedules >= 0)
            ? (healthCheckStats.completedSchedules / healthCheckStats.totalSchedules * 100)
            : 0;

    return (
        <div className="manager-page">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-text">
                        <Title level={1} className="header-title">
                            Dashboard Y Tế Trường Học
                        </Title>
                    </div>
                </div>
            </div>
            <div className="dashboard-content">
                <div className="dashboard-filter-bar">
                    <span className="dashboard-filter-bar-label">
                        Nhập ngày để xem báo cáo cụ thể
                    </span>
                    <RangePicker
                        inputReadOnly
                        onChange={handleDateChange}
                        format="YYYY-MM-DD"
                        allowClear
                        value={dateRange}
                        placeholder={["Start date", "End date"]}
                        className="dashboard-range-picker"
                        popupStyle={{ borderRadius: 12 }}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchData}
                        loading={loading}
                        size="large"
                        className="refresh-btn"
                    >
                        Làm mới
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadFullReport}
                        size="large"
                        className="download-btn"
                    >
                        Xuất báo cáo
                    </Button>
                </div>

                <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
                    <div className="quick-stats-section">
                        <Title level={3} className="section-title">
                            <RiseOutlined /> Tổng quan hệ thống
                        </Title>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card students-card" bordered={false}>
                                    <div className="stat-icon"><TeamOutlined /></div>
                                    <Statistic
                                        title="Tổng học sinh"
                                        value={systemStats.totalStudents || 0}
                                        valueStyle={{ color: '#1890FF' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card medication-card" bordered={false}>
                                    <div className="stat-icon"><FileTextOutlined /></div>
                                    <Statistic
                                        title="Đơn thuốc"
                                        value={medicationStats.totalSubmissions || 0}
                                        valueStyle={{ color: '#52C41A' }}
                                    />
                                    <div>
                                        <Text type="secondary">Chờ duyệt: </Text>
                                        <Text strong>{pendingMedications}</Text>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card events-card" bordered={false}>
                                    <div className="stat-icon"><AlertOutlined /></div>
                                    <Statistic
                                        title="Sự kiện y tế"
                                        value={medicalEventStats.totalEvents || 0}
                                        valueStyle={{ color: '#FAAD14' }}
                                    />
                                    <div>
                                        <Text type="danger">Khẩn cấp: {medicalEventStats.emergencyEvents || 0}</Text>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card vaccination-card" bordered={false}>
                                    <div className="stat-icon"><SafetyOutlined /></div>
                                    <Statistic
                                        title="Học sinh đã tiêm"
                                        value={vaccinationStats.totalVaccinated || 0}
                                        valueStyle={{ color: '#722ED1' }}
                                    />
                                    <div>
                                        <Text type="secondary">Phản ứng: </Text>
                                        <Text type="danger">{vaccinationStats.totalReactions || 0}</Text>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Charts */}
                    <div className="charts-section">
                        <Title level={3} className="section-title">
                            <HeartOutlined /> Phân tích chi tiết
                        </Title>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={12}>
                                <Card className="chart-card medicalevent-chart-card" bordered={false}>
                                    <div className="chart-header">
                                        <AlertOutlined className="chart-icon" />
                                        <Text strong>Thống Kê Sự Kiện Y Tế</Text>
                                        <span style={{ marginLeft: 16 }}>
                                            <Text type="secondary">Tổng: </Text>
                                            <Text strong>{medicalEventStats.totalEvents || 0}</Text>
                                            <Text type="secondary"> | Khẩn cấp: </Text>
                                            <Text strong>{medicalEventStats.emergencyEvents || 0}</Text>
                                        </span>
                                    </div>
                                    <div className="chart-container">
                                        {medicalEventColumnData.length > 0 ? (
                                            <Column {...medicalEventColumnConfig} />
                                        ) : (
                                            <Empty description="Không có dữ liệu sự kiện" />
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="chart-card healthcheck-chart-card" bordered={false}>
                                    <div className="chart-header">
                                        <BarChartOutlined className="chart-icon" />
                                        <Text strong>Báo Cáo Khám Sức Khỏe</Text>
                                    </div>
                                    <div className="chart-container">
                                        <Column {...healthCheckColumnConfig} />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="chart-card medication-chart-card" bordered={false}>
                                    <div className="chart-header">
                                        <FileTextOutlined className="chart-icon" />
                                        <Text strong>Tỷ lệ duyệt đơn thuốc</Text>
                                    </div>
                                    <div className="chart-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <Progress
                                            type="circle"
                                            percent={Math.round(medicationStats.approvalRate || 0)}
                                            format={(percent) => `${percent}%`}
                                            strokeColor={{
                                                '0%': '#52C41A',
                                                '100%': '#87d068'
                                            }}
                                            trailColor="#f0f0f0"
                                        />
                                        <div className="medication-info" style={{ marginTop: 16 }}>
                                            <div className="info-line">
                                                <span className="label">Đã duyệt:</span>
                                                <span className="value approved">{medicationStats.approvedSubmissions || 0}</span>
                                            </div>
                                            <div className="info-line">
                                                <span className="label">Chờ duyệt:</span>
                                                <span className="value pending">{pendingMedications}</span>
                                            </div>
                                            <div className="info-line">
                                                <span className="label">Từ chối:</span>
                                                <span className="value rejected">{medicationStats.rejectedSubmissions || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="chart-card" bordered={false}>
                                    <div className="chart-header">
                                        <CheckCircleOutlined className="chart-icon" />
                                        <Text strong color='#1890FF'>Tỷ lệ đồng ý tiêm chủng</Text>
                                    </div>
                                    <div className="chart-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <Progress
                                            type="circle"
                                            percent={Math.round(consentRatePercent)}
                                            format={(percent) => `${percent}%`}
                                            width={120}
                                            strokeColor={{
                                                '0%': '#108ee9',
                                                '100%': '#87d068'
                                            }}
                                            trailColor="#f0f0f0"
                                        />
                                        <div className="vaccination-info">
                                            <div className="info-line">
                                                <span className="label">Đã tiêm:</span>
                                                <span className="value vaccinated">{vaccinationStats.totalVaccinated || 0}</span>
                                            </div>
                                            <div className="info-line">
                                                <span className="label">Phản ứng:</span>
                                                <span className="value reactions">{vaccinationStats.totalReactions || 0}</span>
                                            </div>
                                        </div>

                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Performance Cards */}
                    <div className="performance-section">
                        <Title level={3} className="section-title">
                            <CheckCircleOutlined /> Hiệu suất hoạt động
                        </Title>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8}>
                                <Card className="performance-card" bordered={false}>
                                    <div className="performance-header">
                                        <CheckCircleOutlined className="performance-icon success" />
                                        <Text strong>Tỷ lệ hoàn thành</Text>
                                    </div>
                                    <div className="performance-content">
                                        <Text className="metric-label">Đơn thuốc</Text>
                                        <Progress
                                            percent={medicationStats.approvalRate || 0}
                                            strokeColor="#52C41A"
                                            format={(percent) => `${percent}%`}
                                        />
                                        <Text className="metric-label">Đợt tiêm chủng</Text>
                                        <Progress
                                            percent={vaccinationStats.totalBatches > 0 ? ((vaccinationStats.completedBatches || 0) / vaccinationStats.totalBatches * 100) : 0}
                                            strokeColor="#722ED1"
                                            format={(percent) => `${percent.toFixed(0)}%`}
                                        />
                                        <Text className="metric-label">Khám sức khỏe</Text>
                                        <Progress
                                            percent={healthCheckCompleteRate}
                                            strokeColor="#1890FF"
                                            format={(percent) => `${percent.toFixed(0)}%`}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="performance-card" bordered={false}>
                                    <div className="performance-header">
                                        <ClockCircleOutlined className="performance-icon warning" />
                                        <Text strong>Đang xử lý</Text>
                                    </div>
                                    <div className="performance-content">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Đơn thuốc"
                                                    value={pendingMedications}
                                                    valueStyle={{ color: '#FAAD14' }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Đợt tiêm"
                                                    value={(vaccinationStats.totalBatches || 0) - (vaccinationStats.completedBatches || 0)}
                                                    valueStyle={{ color: '#FAAD14' }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="performance-card" bordered={false}>
                                    <div className="performance-header">
                                        <AlertOutlined className="performance-icon danger" />
                                        <Text strong>Cần chú ý</Text>
                                    </div>
                                    <div className="performance-content">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Từ chối thuốc"
                                                    value={medicationStats.rejectedSubmissions || 0}
                                                    valueStyle={{ color: '#FF4D4F' }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Phản ứng tiêm"
                                                    value={vaccinationStats.totalReactions || 0}
                                                    valueStyle={{ color: '#FF4D4F' }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Spin>
            </div>
        </div>
    );
}

export default ManagerPage;