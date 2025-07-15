// Kiểm tra giá trị là số dương
export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

// Kiểm tra giá trị là số trong khoảng [min, max]
export function isNumberInRange(value, min, max) {
  return typeof value === 'number' && value >= min && value <= max;
}

// Kiểm tra giá trị là số (cả string số)
export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
} 

// Kiểm tra sốt (nhiệt độ > 38°C)
export function isFever(temperature) {
  return typeof temperature === 'number' && temperature > 38;
}

// Kiểm tra hạ thân nhiệt (nhiệt độ < 36°C)
export function isHypothermia(temperature) {
  return typeof temperature === 'number' && temperature < 36;
}

// Kiểm tra nhịp tim nhanh (> 100 lần/phút)
export function isTachycardia(heartRate) {
  return typeof heartRate === 'number' && heartRate > 100;
}

// Kiểm tra nhịp tim chậm (< 60 lần/phút)
export function isBradycardia(heartRate, isAthlete = false) {
  // Nếu là vận động viên thì không kiểm tra nhịp chậm
  if (isAthlete) return false;
  return typeof heartRate === 'number' && heartRate < 60;
} 