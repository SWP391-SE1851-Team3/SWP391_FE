

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

// Kiểm tra định dạng thị lực: chỉ số, dạng x hoặc x/y, không chữ, không khoảng trắng, không ký tự đặc biệt
export function isValidVisionFormat(value) {
  return typeof value === 'string' && /^([0-9]+(\.[0-9]+)?)(\/([0-9]+(\.[0-9]+)?))?$/.test(value);
}

// Kiểm tra giá trị thị lực hợp lệ: tối đa 10/10, >= 1/1
export function isValidVisionRange(value) {
  if (typeof value !== 'string' || !isValidVisionFormat(value)) return false;
  if (value.includes('/')) {
    const [tu, mau] = value.split('/').map(Number);
    if (
      isNaN(tu) || isNaN(mau) ||
      tu > 10 || mau > 10 ||
      tu < 1 || mau < 1
    ) return false;
  } else {
    const num = Number(value);
    if (isNaN(num) || num > 10 || num < 1) return false;
  }
  return true;
}