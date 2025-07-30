import React, { useState, useEffect, useCallback } from 'react';
import { getFullReport } from '../../../api/manager_dashboard';
import './managerSchool.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminSchoolNurse = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sử dụng useCallback để không tạo lại hàm fetchReport mỗi lần render
    const fetchReport = useCallback(async () => {
        setLoading(true); // Hiển thị trạng thái tải mỗi khi làm mới
        setError(null);   // Xóa lỗi cũ
        try {
            const response = await getFullReport();
            setReport(response.data);
        } catch (err) {
            setError('Không thể tải báo cáo. Vui lòng thử lại sau.');
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect sẽ chạy lần đầu tiên để tải dữ liệu
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Hàm xử lý việc xuất file Excel
    const handleExportExcel = () => {
        if (!report) {
            alert("Không có dữ liệu để xuất.");
            return;
        }

        const wb = XLSX.utils.book_new();

        const systemData = [
            { 'Tiêu chí': 'Tổng số học sinh', 'Giá trị': report.systemStats.totalStudents },
            { 'Tiêu chí': 'Học sinh đang hoạt động', 'Giá trị': report.systemStats.activeStudents },
            { 'Tiêu chí': 'Tổng số phụ huynh', 'Giá trị': report.systemStats.totalParents },
            { 'Tiêu chí': 'Tổng số y tá', 'Giá trị': report.systemStats.totalNurses },
            { 'Tiêu chí': 'Tổng số quản lý', 'Giá trị': report.systemStats.totalManagers },
        ];
        const medicalData = [
            { 'Tiêu chí': 'Tổng số sự kiện', 'Giá trị': report.medicalEventStats.totalEvents },
            { 'Tiêu chí': 'Sự kiện khẩn cấp', 'Giá trị': report.medicalEventStats.emergencyEvents },
            { 'Tiêu chí': 'Sự kiện đã hoàn thành', 'Giá trị': report.medicalEventStats.completedEvents },
            { 'Tiêu chí': 'Sự kiện đang chờ', 'Giá trị': report.medicalEventStats.pendingEvents },
            { 'Tiêu chí': 'Tỷ lệ thông báo (%)', 'Giá trị': report.medicalEventStats.notificationRate },
        ];
        const vaccinationData = [
            { 'Tiêu chí': 'Tổng số đợt tiêm', 'Giá trị': report.vaccinationStats.totalBatches },
            { 'Tiêu chí': 'Đợt tiêm hoàn thành', 'Giá trị': report.vaccinationStats.completedBatches },
            { 'Tiêu chí': 'Tổng số đã tiêm', 'Giá trị': report.vaccinationStats.totalVaccinated },
            { 'Tiêu chí': 'Tỷ lệ đồng ý (%)', 'Giá trị': report.vaccinationStats.consentRate },
            { 'Tiêu chí': 'Tổng số phản ứng sau tiêm', 'Giá trị': report.vaccinationStats.totalReactions },
        ];
        const healthCheckData = [
            { 'Tiêu chí': 'Tổng số lịch khám', 'Giá trị': report.healthCheckStats.totalSchedules },
            { 'Tiêu chí': 'Lịch khám hoàn thành', 'Giá trị': report.healthCheckStats.completedSchedules },
            { 'Tiêu chí': 'Tổng số đã khám', 'Giá trị': report.healthCheckStats.totalChecked },
            { 'Tiêu chí': 'Tỷ lệ đồng ý (%)', 'Giá trị': report.healthCheckStats.consentRate },
            { 'Tiêu chí': 'Chỉ số BMI trung bình', 'Giá trị': report.healthCheckStats.averageBMI },
        ];
        const medicationData = [
            { 'Tiêu chí': 'Tổng số đơn gửi', 'Giá trị': report.medicationStats.totalSubmissions },
            { 'Tiêu chí': 'Đơn được duyệt', 'Giá trị': report.medicationStats.approvedSubmissions },
            { 'Tiêu chí': 'Đơn bị từ chối', 'Giá trị': report.medicationStats.rejectedSubmissions },
            { 'Tiêu chí': 'Tỷ lệ duyệt (%)', 'Giá trị': report.medicationStats.approvalRate },
        ];

        const wsSystem = XLSX.utils.json_to_sheet(systemData);
        const wsMedical = XLSX.utils.json_to_sheet(medicalData);
        const wsVaccination = XLSX.utils.json_to_sheet(vaccinationData);
        const wsHealthCheck = XLSX.utils.json_to_sheet(healthCheckData);
        const wsMedication = XLSX.utils.json_to_sheet(medicationData);
        
        const setColumnWidth = (ws) => {
            ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        };
        setColumnWidth(wsSystem);
        setColumnWidth(wsMedical);
        setColumnWidth(wsVaccination);
        setColumnWidth(wsHealthCheck);
        setColumnWidth(wsMedication);

        XLSX.utils.book_append_sheet(wb, wsSystem, "Thống kê hệ thống");
        XLSX.utils.book_append_sheet(wb, wsMedical, "Sự kiện y tế");
        XLSX.utils.book_append_sheet(wb, wsVaccination, "Tiêm chủng");
        XLSX.utils.book_append_sheet(wb, wsHealthCheck, "Khám sức khỏe");
        XLSX.utils.book_append_sheet(wb, wsMedication, "Gửi thuốc");

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        saveAs(dataBlob, `BaoCaoTongHop_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
    };

    // Hàm trợ giúp định dạng số
    const formatNumber = (num) => {
        if (typeof num !== 'number') return num;
        return new Intl.NumberFormat('vi-VN').format(num);
    }
    
    // SỬA LỖI: Bỏ * 100 trong hàm formatRate
    const formatRate = (rate) => {
        if (typeof rate !== 'number') return rate;
        return `${rate.toFixed(1)}%`;
    }

    if (loading) return <div className="loading-message">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!report || !report.systemStats) return <div className="no-data-message">Không có dữ liệu để hiển thị.</div>;

    const {
        systemStats,
        medicalEventStats,
        vaccinationStats,
        healthCheckStats,
        medicationStats,
        createdAt
    } = report;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Báo cáo tổng hợp cho quản trị viên</h1>
                <div>
                    <button onClick={fetchReport} className="refresh-button" style={{marginRight: '10px'}}>
                        Làm Mới
                    </button>
                    <button onClick={handleExportExcel} className="export-button">
                        Xuất Excel
                    </button>
                </div>
            </div>
            <p className="timestamp">Dữ liệu được tạo lúc: {new Date(createdAt).toLocaleString('vi-VN')}</p>

            {/* Các thẻ hiển thị dữ liệu không thay đổi, vì chúng sử dụng hàm formatRate đã được sửa */}
            <div className="stat-card">
                <h2>Thống kê tổng quan hệ thống</h2>
                <div className="stat-grid">
                    <div className="stat-item"><strong>Tổng số học sinh:</strong> {formatNumber(systemStats.totalStudents)}</div>
                    <div className="stat-item"><strong>Học sinh đang hoạt động:</strong> {formatNumber(systemStats.activeStudents)}</div>
                    <div className="stat-item"><strong>Tổng số phụ huynh:</strong> {formatNumber(systemStats.totalParents)}</div>
                    <div className="stat-item"><strong>Tổng số y tá:</strong> {formatNumber(systemStats.totalNurses)}</div>
                    <div className="stat-item"><strong>Tổng số quản lý:</strong> {formatNumber(systemStats.totalManagers)}</div>
                </div>
            </div>

            <div className="stat-card">
                <h2>Thống kê sự kiện y tế</h2>
                <div className="stat-grid">
                    <div className="stat-item"><strong>Tổng số sự kiện:</strong> {formatNumber(medicalEventStats.totalEvents)}</div>
                    <div className="stat-item"><strong>Sự kiện khẩn cấp:</strong> {formatNumber(medicalEventStats.emergencyEvents)}</div>
                    <div className="stat-item"><strong>Sự kiện đã hoàn thành:</strong> {formatNumber(medicalEventStats.completedEvents)}</div>
                    <div className="stat-item"><strong>Sự kiện đang chờ:</strong> {formatNumber(medicalEventStats.pendingEvents)}</div>
                    <div className="stat-item"><strong>Tỷ lệ thông báo:</strong> {formatRate(medicalEventStats.notificationRate)}</div>
                </div>
            </div>

            <div className="stat-card">
                <h2>Thống kê tiêm chủng</h2>
                <div className="stat-grid">
                    <div className="stat-item"><strong>Tổng số đợt tiêm:</strong> {formatNumber(vaccinationStats.totalBatches)}</div>
                    <div className="stat-item"><strong>Đợt tiêm hoàn thành:</strong> {formatNumber(vaccinationStats.completedBatches)}</div>
                    <div className="stat-item"><strong>Tổng số đã tiêm:</strong> {formatNumber(vaccinationStats.totalVaccinated)}</div>
                    <div className="stat-item"><strong>Tỷ lệ đồng ý:</strong> {formatRate(vaccinationStats.consentRate)}</div>
                    <div className="stat-item"><strong>Tổng số phản ứng sau tiêm:</strong> {formatNumber(vaccinationStats.totalReactions)}</div>
                </div>
            </div>

            <div className="stat-card">
                <h2>Thống kê khám sức khỏe</h2>
                <div className="stat-grid">
                    <div className="stat-item"><strong>Tổng số lịch khám:</strong> {formatNumber(healthCheckStats.totalSchedules)}</div>
                    <div className="stat-item"><strong>Lịch khám hoàn thành:</strong> {formatNumber(healthCheckStats.completedSchedules)}</div>
                    <div className="stat-item"><strong>Tổng số đã khám:</strong> {formatNumber(healthCheckStats.totalChecked)}</div>
                    <div className="stat-item"><strong>Tỷ lệ đồng ý:</strong> {formatRate(healthCheckStats.consentRate)}</div>
                    <div className="stat-item"><strong>Chỉ số BMI trung bình:</strong> {healthCheckStats.averageBMI ? healthCheckStats.averageBMI.toFixed(2) : 'N/A'}</div>
                </div>
            </div>

            <div className="stat-card">
                <h2>Thống kê gửi thuốc</h2>
                <div className="stat-grid">
                    <div className="stat-item"><strong>Tổng số đơn gửi:</strong> {formatNumber(medicationStats.totalSubmissions)}</div>
                    <div className="stat-item"><strong>Đơn được duyệt:</strong> {formatNumber(medicationStats.approvedSubmissions)}</div>
                    <div className="stat-item"><strong>Đơn bị từ chối:</strong> {formatNumber(medicationStats.rejectedSubmissions)}</div>
                    <div className="stat-item"><strong>Tỷ lệ duyệt:</strong> {formatRate(medicationStats.approvalRate)}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminSchoolNurse;