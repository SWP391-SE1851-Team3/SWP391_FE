

// Kiểm tra độ dài chuỗi nằm trong khoảng [min, max]
export function isStringLengthInRange(value, min, max) {
  return typeof value === 'string' && value.length >= min && value.length <= max;
}


// Trả về true nếu KHÔNG có ký tự đặc biệt (chỉ cho phép chữ, số, khoảng trắng)
export function hasNoSpecialCharacters(value) {
  return typeof value === 'string' && /^[\p{L}0-9\s]*$/u.test(value);
}

// Kiểm tra chỉ chứa số
export function isOnlyNumbers(value) {
  return typeof value === 'string' && /^[0-9]+$/.test(value);
}

// Kiểm tra có khoảng trắng đầu dòng
export function isOnlyWhitespace(value) {
  return typeof value === 'string' && /^\s/.test(value);
}