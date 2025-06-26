import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Spin, Empty, notification, Statistic, Progress } from 'antd';
import {
    ReloadOutlined, DownloadOutlined, RiseOutlined,
    TeamOutlined, FileTextOutlined, AlertOutlined, CalendarOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
    HeartOutlined, SafetyOutlined
} from '@ant-design/icons';
import { Pie, Column, Area } from '@ant-design/charts';
import './ManagerPage.css';

// Import API functions
import {
    getVaccinationStats,
    getSystemStats,
    getMedicationStats,
    getMedicalEvents,
    getHealthStatus,
    getHealthCheckStats,
    getFullReport
} from  '../../api/manager_dashboard';

const { Title, Paragraph, Text } = Typography;

function ManagerPage() {
    const [loading, setLoading] = useState(true);
    const [systemStats, setSystemStats] = useState({});
    const [medicationStats, setMedicationStats] = useState({});
    const [medicalEventStats, setMedicalEventStats] = useState({});
    const [vaccinationStats, setVaccinationStats] = useState({});
    const [healthCheckStats, setHealthCheckStats] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                sysStatsResponse,
                medStatsResponse,
                medEvtStatsResponse,
                vacStatsResponse,
                healthChkStatsResponse
            ] = await Promise.all([
                getSystemStats(),
                getMedicationStats(),
                getMedicalEvents(),
                getVaccinationStats(),
                getHealthCheckStats()
            ]);

            setSystemStats(sysStatsResponse.data);
            setMedicationStats(medStatsResponse.data);
            setMedicalEventStats(medEvtStatsResponse.data);
            setVaccinationStats(vacStatsResponse.data);
            setHealthCheckStats(healthChkStatsResponse.data);

            notification.success({
                message: 'Thành công',
                description: 'Dữ liệu đã được cập nhật mới nhất.',
                placement: 'topRight',
                duration: 3,
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Cấu hình biểu đồ tiêm chủng theo API thực tế
    const vaccinationColumnData = [];
    if (vaccinationStats.totalBatches !== undefined) {
        vaccinationColumnData.push(
            { type: 'Tổng đợt tiêm', category: 'Đã hoàn thành', value: vaccinationStats.completedBatches || 0 },
            { type: 'Tổng đợt tiêm', category: 'Chưa hoàn thành', value: (vaccinationStats.totalBatches || 0) - (vaccinationStats.completedBatches || 0) },
            { type: 'Học sinh', category: 'Đã tiêm', value: vaccinationStats.totalVaccinated || 0 },
            { type: 'Học sinh', category: 'Phản ứng', value: vaccinationStats.totalReactions || 0 }
        );
    }

    const vaccinationColumnConfig = {
        data: vaccinationColumnData,
        isGroup: true,
        xField: 'type',
        yField: 'value',
        seriesField: 'category',
        color: ['#52C41A', '#F5F5F5', '#1890FF', '#FF4D4F'],
        columnStyle: {
            radius: [2, 2, 0, 0],
        },
        // Loại bỏ label để tránh lỗi
        label: false,
        legend: {
            position: 'bottom',
            offsetY: 8,
            itemName: {
                style: {
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#333333',
                },
            },
            marker: {
                symbol: 'circle',
                style: {
                    r: 6,
                },
            },
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#666666',
                    fontWeight: 500,
                },
                autoRotate: false,
                autoHide: false,
            },
            line: {
                style: {
                    stroke: '#E8E8E8',
                    lineWidth: 1,
                },
            },
            tickLine: {
                style: {
                    stroke: '#E8E8E8',
                    lineWidth: 1,
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 11,
                    fill: '#666666',
                },
            },
            grid: {
                line: {
                    style: {
                        stroke: '#F0F0F0',
                        lineDash: [2, 2],
                        lineWidth: 1,
                    },
                },
            },
        },
        meta: {
            type: { alias: 'Loại thống kê' },
            value: { alias: 'Số lượng' },
            category: { alias: 'Trạng thái' },
        },
        // Tooltip đơn giản
        tooltip: {
            shared: false,
            showMarkers: true,
            showTitle: true,
            title: (title, datum) => {
                return datum?.type || 'Thống kê';
            },
            formatter: (datum) => {
                return {
                    name: datum.category,
                    value: datum.value,
                };
            },
        },
        interactions: [
            { type: 'element-active' },
            { type: 'element-highlight' },
        ],
    };

    // Cấu hình biểu đồ đơn thuốc (Pie Chart)
    const medicationPieData = [
        { type: 'Đã duyệt', value: medicationStats.completed || 0 },
        { type: 'Chờ duyệt', value: medicationStats.pending || 0 },
        { type: 'Từ chối', value: medicationStats.rejected || 0 }
    ].filter(item => item.value > 0);

    const medicationPieConfig = {
        data: medicationPieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        innerRadius: 0.3,
        color: ['#52C41A', '#FAAD14', '#FF4D4F'],
        label: {
            type: 'outer',
            content: '{name}\n{percentage}',
            style: {
                fontSize: 12,
                fontWeight: 500,
            },
        },
        legend: {
            position: 'bottom',
            offsetY: 8,
            itemName: {
                style: {
                    fontSize: 12,
                    fontWeight: 500,
                },
            },
            marker: {
                symbol: 'circle',
                style: {
                    r: 4,
                },
            },
        },
        interactions: [
            { type: 'element-active' },
            { type: 'pie-statistic-active' },
        ],
        tooltip: {
            formatter: (datum) => {
                const total = medicationStats.totalSent || 0;
                const percentage = total > 0 ? ((datum.value / total) * 100).toFixed(1) : 0;
                
                return {
                    name: datum.type,
                    value: `${datum.value} (${percentage}%)`,
                };
            },
        },
    };

    // Biểu đồ xu hướng thuốc
    const medicationTrendConfig = {
        data: medicationStats.monthlyTrend || [],
        xField: 'month',
        yField: 'value',
        smooth: true,
        color: '#1890FF',
        areaStyle: {
            fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890FF',
        },
        line: {
            size: 3,
        },
        point: {
            size: 4,
            shape: 'circle',
            style: {
                fill: '#1890FF',
                stroke: '#ffffff',
                lineWidth: 2,
            },
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#8C8C8C',
                },
            },
            line: null,
            tickLine: null,
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 12, 
                    fill: '#8C8C8C',
                },
            },
            grid: {
                line: {
                    style: {
                        stroke: '#F0F0F0',
                        lineDash: [4, 4],
                    },
                },
            },
        },
        tooltip: {
            formatter: (datum) => {
                return {
                    name: `Tháng ${datum.month}`,
                    value: datum.value,
                };
            },
        },
        interactions: [
            { type: 'element-active' },
        ],
    };

    const handleDownloadFullReport = async () => {
        try {
            const response = await getFullReport();
            notification.success({
                message: 'Đang tạo báo cáo',
                description: 'Báo cáo đầy đủ đang được tạo...',
                placement: 'topRight',
            });
            
            if (response.data.fileUrl) {
                const link = document.createElement('a');
                link.href = response.data.fileUrl;
                link.download = 'dashboard-report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tạo báo cáo. Vui lòng thử lại.',
                placement: 'topRight',
            });
        }
    };

    // Debug log
    console.log('Vaccination stats:', vaccinationStats);
    console.log('Column data:', vaccinationColumnData);

    return (
        <div className="manager-page">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-text">
                        <Title level={1} className="header-title">
                            Dashboard Y tế Trường học
                        </Title>
                        <Paragraph className="header-subtitle">
                            Hệ thống quản lý y tế thông minh • Người dùng: <Text strong>NguyenGia-Phu</Text>
                        </Paragraph>
                    </div>
                    <div className="header-actions">
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
                </div>
            </div>

            <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
                <div className="dashboard-content">

                    {/* Quick Stats Cards */}
                    <div className="quick-stats-section">
                        <Title level={3} className="section-title">
                            <RiseOutlined /> Tổng quan hệ thống
                        </Title>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card students-card" bordered={false}>
                                    <div className="stat-icon">
                                        <TeamOutlined />
                                    </div>
                                    <div className="stat-content">
                                        <Statistic
                                            title="Tổng học sinh"
                                            value={systemStats.totalStudents || 0}
                                            valueStyle={{ color: '#1890FF' }}
                                        />
                                        <div className="stat-extra">
                                            <Text type="success">+{systemStats.monthlyGrowth || 0}%</Text>
                                            <Text type="secondary"> tháng này</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card medication-card" bordered={false}>
                                    <div className="stat-icon">
                                        <FileTextOutlined />
                                    </div>
                                    <div className="stat-content">
                                        <Statistic
                                            title="Đơn thuốc"
                                            value={medicationStats.totalSent || 0}
                                            valueStyle={{ color: '#52C41A' }}
                                        />
                                        <div className="stat-extra">
                                            <Text type="secondary">Chờ duyệt: </Text>
                                            <Text strong>{medicationStats.pending || 0}</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card events-card" bordered={false}>
                                    <div className="stat-icon">
                                        <AlertOutlined />
                                    </div>
                                    <div className="stat-content">
                                        <Statistic
                                            title="Sự kiện y tế"
                                            value={medicalEventStats.totalEvents || 0}
                                            valueStyle={{ color: '#FAAD14' }}
                                        />
                                        <div className="stat-extra">
                                            <Text type="danger">Khẩn cấp: {medicalEventStats.urgentEvents || 0}</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card vaccination-card" bordered={false}>
                                    <div className="stat-icon">
                                        <SafetyOutlined />
                                    </div>
                                    <div className="stat-content">
                                        <Statistic
                                            title="Học sinh đã tiêm"
                                            value={vaccinationStats.totalVaccinated || 0}
                                            valueStyle={{ color: '#722ED1' }}
                                        />
                                        <div className="stat-extra">
                                            <Text type="secondary">Phản ứng: </Text>
                                            <Text type="danger">{vaccinationStats.totalReactions || 0}</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-section">
                        <Title level={3} className="section-title">
                            <HeartOutlined /> Phân tích chi tiết
                        </Title>
                        <Row gutter={[24, 24]}>

                            {/* Vaccination Progress Chart */}
                            <Col xs={24} lg={12}>
                                <Card
                                    className="chart-card vaccination-chart-card"
                                    bordered={false}
                                >
                                    <div className="chart-header">
                                        <div className="chart-title">
                                            <SafetyOutlined className="chart-icon" />
                                            <Text strong>Thống kê tiêm chủng</Text>
                                        </div>
                                        <div className="chart-completion">
                                            <Text type="secondary">Tổng đợt: </Text>
                                            <Text strong className="completion-rate">{vaccinationStats.totalBatches || 0}</Text>
                                            <Text type="secondary"> | Hoàn thành: </Text>
                                            <Text strong className="completion-rate">{vaccinationStats.completedBatches || 0}</Text>
                                        </div>
                                    </div>
                                    <div className="chart-container">
                                        {vaccinationColumnData.length > 0 ? (
                                            <Column {...vaccinationColumnConfig} />
                                        ) : (
                                            <Empty description="Không có dữ liệu tiêm chủng" />
                                        )}
                                    </div>
                                </Card>
                            </Col>

                            {/* Consent Rate Progress Display thay thế Gauge */}
                            <Col xs={24} lg={12}>
                                <Card
                                    className="chart-card consent-chart-card"
                                    bordered={false}
                                >
                                    <div className="chart-header">
                                        <div className="chart-title">
                                            <CheckCircleOutlined className="chart-icon" />
                                            <Text strong>Tỷ lệ đồng ý tiêm chủng</Text>
                                        </div>
                                        <div className="chart-completion">
                                            <Text type="secondary">Học sinh đã tiêm: </Text>
                                            <Text strong className="completion-rate">{vaccinationStats.totalVaccinated || 0}</Text>
                                        </div>
                                    </div>
                                    <div className="chart-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        {/* Hiển thị tỷ lệ đồng ý dưới dạng Progress Circle */}
                                        <div style={{ marginBottom: 24 }}>
                                            <Progress
                                                type="circle"
                                                percent={(vaccinationStats.consentRate || 0) * 100}
                                                format={(percent) => `${percent}%`}
                                                width={120}
                                                strokeColor={{
                                                    '0%': '#108ee9',
                                                    '100%': '#87d068',
                                                }}
                                                trailColor="#f0f0f0"
                                            />
                                            <div style={{ marginTop: 12 }}>
                                                <Text strong style={{ fontSize: 16, color: '#1890FF' }}>
                                                    Tỷ lệ đồng ý tiêm chủng
                                                </Text>
                                            </div>
                                        </div>
                                        
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Đã tiêm"
                                                    value={vaccinationStats.totalVaccinated || 0}
                                                    valueStyle={{ color: '#52C41A', fontSize: '20px' }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Phản ứng"
                                                    value={vaccinationStats.totalReactions || 0}
                                                    valueStyle={{ color: '#FF4D4F', fontSize: '20px' }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>

                            {/* Medication Status Pie Chart */}
                            <Col xs={24} lg={12}>
                                <Card
                                    className="chart-card medication-chart-card"
                                    bordered={false}
                                >
                                    <div className="chart-header">
                                        <div className="chart-title">
                                            <FileTextOutlined className="chart-icon" />
                                            <Text strong>Trạng thái đơn thuốc phụ huynh</Text>
                                        </div>
                                        <div className="chart-completion">
                                            <Text type="secondary">Tỷ lệ duyệt: </Text>
                                            <Text strong className="completion-rate">{medicationStats.approvalRate || 0}%</Text>
                                        </div>
                                    </div>
                                    <div className="chart-container">
                                        {medicationPieData.length > 0 ? (
                                            <Pie {...medicationPieConfig} />
                                        ) : (
                                            <Empty description="Không có dữ liệu đơn thuốc" />
                                        )}
                                    </div>
                                </Card>
                            </Col>

                            {/* Medication Trend */}
                            <Col xs={24} lg={12}>
                                <Card title="Xu hướng đơn thuốc 6 tháng gần đây" className="chart-card trend-chart-card" bordered={false}>
                                    <div className="chart-container">
                                        {medicationStats.monthlyTrend?.length > 0 ? (
                                            <Area {...medicationTrendConfig} />
                                        ) : (
                                            <Empty description="Không có dữ liệu xu hướng" />
                                        )}
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
                                        <div className="performance-metric">
                                            <Text className="metric-label">Đơn thuốc</Text>
                                            <Progress
                                                percent={medicationStats.approvalRate || 0}
                                                strokeColor="#52C41A"
                                                format={(percent) => `${percent}%`}
                                            />
                                        </div>
                                        <div className="performance-metric">
                                            <Text className="metric-label">Đợt tiêm chủng</Text>
                                            <Progress
                                                percent={vaccinationStats.totalBatches > 0 ? ((vaccinationStats.completedBatches || 0) / vaccinationStats.totalBatches * 100) : 0}
                                                strokeColor="#722ED1"
                                                format={(percent) => `${percent.toFixed(0)}%`}
                                            />
                                        </div>
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
                                                    value={medicationStats.pending || 0}
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
                                                    value={medicationStats.rejected || 0}
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

                </div>
            </Spin>
        </div>
    );
}

export default ManagerPage;