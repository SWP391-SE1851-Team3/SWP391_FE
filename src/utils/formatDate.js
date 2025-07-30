// Utility function to format dates consistently as HH:mm, DD/MM/YYYY
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  } catch (error) {
    return '-';
  }
};

// Format date only (without time) as DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '-';
  }
};

// Format time only as HH:mm
export const formatTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    return '-';
  }
};

// Get current date in YYYY-MM-DD format for comparisons
export const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Trả về chuỗi ngày giờ đã cộng thêm 7 tiếng (ví dụ chuyển từ UTC sang giờ Việt Nam)
export function formatDateTimePlus14Hours(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Cộng thêm 14 tiếng (14*60*60*1000 ms)
  const plus14 = new Date(date.getTime() + 14 * 60 * 60 * 1000);
  // Format: YYYY-MM-DD HH:mm:ss
  const yyyy = plus14.getUTCFullYear();
  const mm = String(plus14.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(plus14.getUTCDate()).padStart(2, '0');
  const hh = String(plus14.getUTCHours()).padStart(2, '0');
  const min = String(plus14.getUTCMinutes()).padStart(2, '0');
  const ss = String(plus14.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}