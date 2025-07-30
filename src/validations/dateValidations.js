// Kiểm tra giá trị là ngày hợp lệ
export function isValidDate(value) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Kiểm tra ngày update >= ngày tạo (chỉ so sánh ngày, không tính giờ phút giây)
export function isUpdateDateAfterOrEqualCreateDate(updateDate, createDate) {
  if (!isValidDate(updateDate) || !isValidDate(createDate)) return false;
  const update = getDateOnly(updateDate);
  const create = getDateOnly(createDate);
  return update >= create;
}


// Kiểm tra ngày tạo là hôm nay hoặc tương lai (chỉ so sánh ngày, không tính giờ phút giây)
export function isCreateDateTodayOrFuture(createDate) {
  if (!isValidDate(createDate)) return false;
  const today = getDateOnly(new Date());
  const date = getDateOnly(createDate);
  return date >= today;
}