import CryptoJS from "crypto-js";

const SECRET_KEY = "e2a5b252346dcaf0119eea7d7131e7d1e18797882ac0a29b83e0b567ffa3b5fb";

// Encrypt function
export const encryptText = (plainText: string) => {
  return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};

// Decrypt function
export const decryptText = (cipherText: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};