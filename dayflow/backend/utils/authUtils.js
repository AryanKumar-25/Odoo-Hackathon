/**
 * Generates an Employee ID following the strict pattern:
 * [Company initials][First 2 letters of first name][First 2 letters of last name][Year of joining][4-digit serial number]
 * 
 * @param {string} companyName - e.g., "Odoo India" -> "OI"
 * @param {string} name - e.g., "John Doe" -> "JODO"
 * @param {number} year - e.g., 2022
 * @param {number} serial - e.g., 1 -> "0001"
 */
function generateEmployeeId(companyName, name, year, serial) {
  // 1. Company initials
  const initials = companyName
    .split(' ')
    .filter(word => word.trim().length > 0)
    .map(word => word[0].toUpperCase())
    .join('');

  // 2. Name parts
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const first2 = firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const last2 = lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');

  // 3. Serial
  const serialStr = String(serial).padStart(4, '0');

  return `${initials}${first2}${last2}${year}${serialStr}`;
}

/**
 * Generates a strong random temporary password
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  // Force at least one uppercase, lowercase, number, and symbol could be enforced here,
  // but for simplicity we generate a random 12-char string.
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  generateEmployeeId,
  generateTempPassword
};
