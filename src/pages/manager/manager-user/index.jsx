import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getAllRoles, createUser, updateUser, deleteUser, validateUserData, testConnection } from '../../../api/manager_user.js';
import './managerUser.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [apiConnected, setApiConnected] = useState(false);
    const [userFormData, setUserFormData] = useState({
        userType: '',
        userName: '',
        password: '',
        fullName: '',
        phone: '',
        email: '',
        isActive: 1073741824,
        roleId: 1073741824,
        occupation: '',
        relationship: '',
        certification: '',
        specialisation: ''
    });

    // Test API connection on component mount
    useEffect(() => {
        const checkConnection = async () => {
            setLoading(true);
            const connected = await testConnection();
            setApiConnected(connected);
            if (!connected) {
                setError('Không thể kết nối đến server API. Vui lòng kiểm tra server có đang chạy tại http://localhost:8080');
            }
            setLoading(false);
        };
        checkConnection();
    }, []);

    // Fetch users data - NOTE: API này không tồn tại trên server
    const fetchUsers = useCallback(async () => {
        if (!apiConnected) return;
        
        try {
            setError(null);
            const response = await getAllUsers();
            setUsers(Array.isArray(response.data) ? response.data : []);
            console.log('Users fetched:', response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(`API getAllUsers không tồn tại trên server. Chỉ có thể tạo/sửa/xóa user.`);
            setUsers([]);
        }
    }, [apiConnected]);

    // Fetch roles data
    const fetchRoles = useCallback(async () => {
        if (!apiConnected) return;
        
        try {
            setError(null);
            const response = await getAllRoles();
            setRoles(Array.isArray(response.data) ? response.data : []);
            console.log('Roles fetched:', response.data);
        } catch (err) {
            console.error("Error fetching roles:", err);
            setError(`Không thể tải danh sách vai trò: ${err.response?.data?.message || err.message}`);
            setRoles([]);
        }
    }, [apiConnected]);

    // Initialize data
    useEffect(() => {
        if (apiConnected) {
            fetchRoles();
        }
    }, [fetchRoles, apiConnected]);

    // Load users when user management is shown
    useEffect(() => {
        if (showUserManagement && apiConnected) {
            fetchUsers();
        }
    }, [showUserManagement, fetchUsers, apiConnected]);

    // Handle user form submission
    const handleUserFormSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setError(null);
        
        // Validate form data
        const validation = validateUserData(userFormData, !!editingUser);
        if (!validation.isValid) {
            setError(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
            return;
        }

        try {
            if (editingUser) {
                // Update existing user
                const updateData = { ...userFormData };
                // Don't send empty password for updates
                if (!updateData.password?.trim()) {
                    delete updateData.password;
                }
                
                await updateUser(editingUser.id, updateData);
                alert('Cập nhật người dùng thành công!');
            } else {
                // Create new user
                await createUser(userFormData);
                alert('Tạo người dùng thành công!');
            }
            
            // Reset form and refresh data
            resetUserForm();
            // Note: fetchUsers sẽ không hoạt động vì API không tồn tại
            // fetchUsers();
        } catch (err) {
            console.error("Error saving user:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(`Không thể lưu thông tin người dùng: ${errorMessage}`);
        }
    };

    // Handle user deletion
    const handleDeleteUser = async (userId, roleId) => {
        const confirmMessage = `Bạn có chắc chắn muốn xóa người dùng ID ${userId}?`;
        if (window.confirm(confirmMessage)) {
            try {
                setError(null);
                await deleteUser(userId, roleId);
                alert('Xóa người dùng thành công!');
                // fetchUsers(); // Không thể refresh vì API không tồn tại
            } catch (err) {
                console.error("Error deleting user:", err);
                const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
                setError(`Không thể xóa người dùng: ${errorMessage}`);
            }
        }
    };

    // Reset user form
    const resetUserForm = () => {
        setUserFormData({
            userType: '',
            userName: '',
            password: '',
            fullName: '',
            phone: '',
            email: '',
            isActive: 1073741824,
            roleId: roles.length > 0 ? roles[0].roleID : 1073741824,
            occupation: '',
            relationship: '',
            certification: '',
            specialisation: ''
        });
        setEditingUser(null);
        setShowUserForm(false);
        setError(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setUserFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    // Get role name by ID
    const getRoleName = (roleId) => {
        const role = roles.find(r => r.roleID === roleId);
        return role ? role.roleName : `Role ID: ${roleId}`;
    };

    if (loading) return <div className="loading-message">Đang tải dữ liệu...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Quản lý người dùng hệ thống</h1>
                <div>
                    <button 
                        onClick={() => setShowUserManagement(!showUserManagement)} 
                        className="user-management-button" 
                        style={{marginRight: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        disabled={!apiConnected}
                    >
                        {showUserManagement ? 'Ẩn' : 'Hiện'} Quản lý người dùng
                    </button>
                </div>
            </div>
            
            {/* API Status */}
            <div className={`api-status ${apiConnected ? 'connected' : 'disconnected'}`} style={{
                padding: '10px', 
                marginBottom: '20px', 
                borderRadius: '4px',
                backgroundColor: apiConnected ? '#d4edda' : '#f8d7da',
                color: apiConnected ? '#155724' : '#721c24',
                border: `1px solid ${apiConnected ? '#c3e6cb' : '#f5c6cb'}`
            }}>
                <strong>Trạng thái API:</strong> {apiConnected ? '🟢 Đã kết nối' : '🔴 Không kết nối'}
                {!apiConnected && <span> - Kiểm tra server tại http://localhost:8080</span>}
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message" style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px'}}>
                    {error}
                    <button onClick={() => setError(null)} style={{marginLeft: '10px', fontSize: '12px', backgroundColor: 'transparent', border: 'none', color: '#721c24', cursor: 'pointer'}}>
                        ✕
                    </button>
                </div>
            )}

            {/* User Management Section */}
            {showUserManagement && apiConnected && (
                <div className="user-management-section" style={{marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa'}}>
                    <div className="user-management-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <h2 style={{margin: 0}}>Quản lý người dùng</h2>
                        <button 
                            onClick={() => setShowUserForm(true)} 
                            className="add-user-button"
                            style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        >
                            ➕ Thêm người dùng mới
                        </button>
                    </div>

                    {/* User Form Modal */}
                    {showUserForm && (
                        <div className="user-form-modal" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <div className="user-form-content" style={{backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                                <h3 style={{marginTop: 0}}>{editingUser ? '✏️ Cập nhật người dùng' : '➕ Thêm người dùng mới'}</h3>
                                <form onSubmit={handleUserFormSubmit}>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Loại người dùng: *</label>
                                            <input
                                                type="text"
                                                name="userType"
                                                value={userFormData.userType}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="VD: Admin, Nurse, Parent, Student..."
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Tên đăng nhập: *</label>
                                            <input
                                                type="text"
                                                name="userName"
                                                value={userFormData.userName}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="Không có khoảng trắng, tối thiểu 3 ký tự"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Mật khẩu: {!editingUser && '*'}</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={userFormData.password}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                                placeholder={editingUser ? "Để trống nếu không muốn thay đổi" : "Tối thiểu 6 ký tự"}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Họ và tên: *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={userFormData.fullName}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="Họ và tên đầy đủ"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Số điện thoại:</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={userFormData.phone}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="10-15 chữ số"
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Email: *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userFormData.email}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Trạng thái:</label>
                                            <select
                                                name="isActive"
                                                value={userFormData.isActive}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                            >
                                                <option value={1073741824}>✅ Hoạt động</option>
                                                <option value={0}>❌ Không hoạt động</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Vai trò:</label>
                                            <select
                                                name="roleId"
                                                value={userFormData.roleId}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                            >
                                                {roles.length > 0 ? (
                                                    roles.map(role => (
                                                        <option key={role.roleID} value={role.roleID}>
                                                            {role.roleName}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value={1073741824}>Đang tải vai trò...</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Nghề nghiệp:</label>
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={userFormData.occupation}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="Nghề nghiệp hiện tại"
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Mối quan hệ:</label>
                                            <input
                                                type="text"
                                                name="relationship"
                                                value={userFormData.relationship}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="VD: Cha, Mẹ, Người giám hộ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Chứng chỉ:</label>
                                            <input
                                                type="text"
                                                name="certification"
                                                value={userFormData.certification}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="Chứng chỉ nghề nghiệp"
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Chuyên môn:</label>
                                            <input
                                                type="text"
                                                name="specialisation"
                                                value={userFormData.specialisation}
                                                onChange={handleInputChange}
                                                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                                placeholder="Lĩnh vực chuyên môn"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                        <button 
                                            type="submit" 
                                            className="save-button" 
                                            style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                        >
                                            {editingUser ? '💾 Cập nhật' : '➕ Tạo mới'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={resetUserForm} 
                                            className="cancel-button" 
                                            style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                        >
                                            ❌ Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* User Management Info */}
                    <div className="user-management-info" style={{padding: '20px', backgroundColor: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '4px'}}>
                        <h4 style={{marginTop: 0, color: '#495057'}}>📋 Thông tin Quản lý Người dùng</h4>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                            <div>
                                <strong>✅ Chức năng có sẵn:</strong>
                                <ul style={{marginTop: '5px', paddingLeft: '20px'}}>
                                    <li>📝 Tạo người dùng mới</li>
                                    <li>✏️ Cập nhật thông tin người dùng</li>
                                    <li>🗑️ Xóa người dùng</li>
                                    <li>🎭 Quản lý vai trò (Roles)</li>
                                </ul>
                            </div>
                            <div>
                                <strong>❌ Chức năng chưa có:</strong>
                                <ul style={{marginTop: '5px', paddingLeft: '20px'}}>
                                    <li>📋 Hiển thị danh sách người dùng</li>
                                    <li>🔍 Tìm kiếm người dùng</li>
                                    <li>📄 Phân trang danh sách</li>
                                </ul>
                            </div>
                        </div>
                        <div style={{padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px'}}>
                            <strong>⚠️ Lưu ý:</strong> Server backend chưa có API <code>GET /api/admin/users/getAllUsers</code> để lấy danh sách người dùng.
                            <br />
                            <strong>📌 API có sẵn:</strong> getAllRole ✅, createUser ✅, updateUser ✅, deleteUser ✅
                        </div>
                        
                        {/* Manual User Action Form */}
                        <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px'}}>
                            <strong>🔧 Thao tác thủ công:</strong>
                            <div style={{display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
                                <input 
                                    type="number" 
                                    placeholder="User ID" 
                                    id="manualUserId"
                                    style={{padding: '8px', border: '1px solid #ccc', borderRadius: '3px', width: '100px'}}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Role ID" 
                                    id="manualRoleId"
                                    style={{padding: '8px', border: '1px solid #ccc', borderRadius: '3px', width: '100px'}}
                                />
                                <button 
                                    onClick={() => {
                                        const userId = document.getElementById('manualUserId').value;
                                        const roleId = document.getElementById('manualRoleId').value;
                                        if (userId && roleId) {
                                            handleDeleteUser(parseInt(userId), parseInt(roleId));
                                        } else {
                                            alert('Vui lòng nhập User ID và Role ID');
                                        }
                                    }}
                                    style={{padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer'}}
                                >
                                    🗑️ Xóa User
                                </button>
                                <span style={{fontSize: '12px', color: '#6c757d', flex: '1', minWidth: '200px'}}>
                                    Nhập ID để xóa user khi biết trước ID
                                </span>
                            </div>
                        </div>

                        {/* Roles Information */}
                        {roles.length > 0 && (
                            <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px'}}>
                                <strong>🎭 Danh sách vai trò có sẵn:</strong>
                                <div style={{marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                    {roles.map(role => (
                                        <span 
                                            key={role.roleID} 
                                            style={{
                                                padding: '5px 10px', 
                                                backgroundColor: '#28a745', 
                                                color: 'white', 
                                                borderRadius: '15px', 
                                                fontSize: '12px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            ID: {role.roleID} - {role.roleName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Welcome Message when User Management is not shown */}
            {!showUserManagement && (
                <div style={{textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px'}}>
                    <h2 style={{color: '#007bff', marginBottom: '20px'}}>👋 Chào mừng đến với Hệ thống Quản lý Người dùng</h2>
                    <p style={{fontSize: '18px', color: '#6c757d', marginBottom: '30px'}}>
                        Nhấn nút "Hiện Quản lý người dùng" để bắt đầu quản lý người dùng trong hệ thống
                    </p>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto'}}>
                        <div style={{padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px'}}>
                            <h4 style={{color: '#28a745', marginBottom: '10px'}}>✅ Có thể thực hiện</h4>
                            <ul style={{listStyle: 'none', padding: 0, textAlign: 'left'}}>
                                <li>➕ Tạo người dùng mới</li>
                                <li>✏️ Cập nhật thông tin</li>
                                <li>🗑️ Xóa người dùng</li>
                                <li>🎭 Quản lý vai trò</li>
                            </ul>
                        </div>
                        <div style={{padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px'}}>
                            <h4 style={{color: '#dc3545', marginBottom: '10px'}}>❌ Chưa có sẵn</h4>
                            <ul style={{listStyle: 'none', padding: 0, textAlign: 'left'}}>
                                <li>📋 Xem danh sách users</li>
                                <li>🔍 Tìm kiếm users</li>
                                <li>📄 Phân trang</li>
                                <li>📊 Thống kê users</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;