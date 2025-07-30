export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data?.data === 'string') return error.response.data.data;
  if (typeof error?.response?.data === 'string') return error.response.data;
  if (error?.response?.statusText) return error.response.statusText;
  if (error?.response?.status) return `HTTP Error ${error.response.status}`;
  if (error?.message) return error.message;
  return "Có lỗi xảy ra khi thực hiện yêu cầu.";
}; 