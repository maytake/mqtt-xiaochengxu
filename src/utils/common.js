import CryptoJS from 'crypto-js';

export function checkLogin(redirectPath) {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.navigateTo({
      url: '/pages/login/login?redirect=' + encodeURIComponent(redirectPath),
    });
    return false;
  }
  return true;
}

export function getCurrentRoute() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  let fullPath = '/' + currentPage.route;
  if (currentPage.options && Object.keys(currentPage.options).length > 0) {
    const query = Object.entries(currentPage.options)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    fullPath += '?' + query;
  }
  return fullPath;
}
// 生成16位随机数
export function generateRandomSeq(n = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// 基于时间戳生成15位唯一数
export function generateUnique15DigitNumber() {
  const timestamp = Date.now(); // 13位时间戳
  const random = Math.floor(Math.random() * 100); // 2位随机数
  return parseInt(timestamp.toString() + random.toString().padStart(2, '0'));
}

export function encryptPassword(plainText, key = '1234567812345678') {
  const keyBytes = CryptoJS.enc.Utf8.parse(key);
  const ivBytes = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decryptPassword(encryptedBase64, key = '39dc0125d2489439') {
  // 将密钥转换为CryptoJS需要的格式
  const keyBytes = CryptoJS.enc.Utf8.parse(key);
  // 使用相同的密钥作为IV（与Java代码保持一致）
  const iv = CryptoJS.enc.Utf8.parse(key);

  // Base64解码
  const encryptedData = CryptoJS.enc.Base64.parse(encryptedBase64);

  // 解密配置
  const decryptOptions = {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  };
  // 执行解密
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, keyBytes, decryptOptions);
  // 将解密结果转换为UTF-8字符串
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {string} format - 格式化模板，如 'yyyy-MM-dd'、'yyyy-MM' 或 'yyyy-MM-dd HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 * @description 
 * 支持的格式：
 * - yyyy: 年份（4位）
 * - MM: 月份（2位，01-12）
 * - dd: 日期（2位，01-31）
 * - HH: 小时（24小时制，2位，00-23）
 * - hh: 小时（12小时制，2位，01-12）
 * - mm: 分钟（2位，00-59）
 * - ss: 秒（2位，00-59）
 */
export function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours24 = String(d.getHours()).padStart(2, '0');
  const hours12 = String(d.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  // 按顺序替换，先替换长的格式，避免短格式被误替换
  return format
    .replace('yyyy', year)
    .replace('MM', month)      // 月份，必须在 mm 之前
    .replace('dd', day)
    .replace('HH', hours24)    // 24小时制，必须在 hh 之前
    .replace('hh', hours12)    // 12小时制
    .replace('mm', minutes)    // 分钟
    .replace('ss', seconds);   // 秒
}
