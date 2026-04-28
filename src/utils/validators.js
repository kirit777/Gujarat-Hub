function validateRequired(fields = {}, required = []) {
  const missing = required.filter((field) => !String(fields[field] ?? '').trim());
  return {
    isValid: missing.length === 0,
    missing
  };
}

function validateEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { validateRequired, validateEmail };
