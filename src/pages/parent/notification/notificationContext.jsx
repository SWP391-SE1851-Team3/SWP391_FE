import React, { createContext, useContext, useState } from 'react';

// Tạo context
const NotificationContext = createContext();

// Custom hook để sử dụng context dễ dàng
export const useNotification = () => useContext(NotificationContext);

// Provider bọc quanh App
export const NotificationProvider = ({ children }) => {
  // Có thể mở rộng thêm các loại thông báo khác
  const [vaccineNotification, setVaccineNotification] = useState(false);

  // Có thể thêm nhiều state cho các loại thông báo khác ở đây
  // const [healthNotification, setHealthNotification] = useState(false);

  return (
    <NotificationContext.Provider value={{ vaccineNotification, setVaccineNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
export default useNotification;
