import validator from 'validator';

export function validateEmail(email) {
  return validator.isEmail(email);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

export function validateName(name) {
  return validator.isLength(name, { min: 2, max: 255 });
}

export function validateUrl(url) {
  return validator.isURL(url);
}

export function validateYouTubeUrl(url) {
  // Check if it's a valid YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/;
  return youtubeRegex.test(url);
}

export function sanitizeString(str) {
  return validator.trim(str);
}

export default {
  validateEmail,
  validatePassword,
  validateName,
  validateUrl,
  validateYouTubeUrl,
  sanitizeString
};
