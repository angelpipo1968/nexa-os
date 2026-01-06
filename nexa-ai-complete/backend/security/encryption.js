// encryption.js
const { webcrypto } = require('crypto');
const subtle = webcrypto.subtle;

// Wrapper to mimic the requested ES6 module import style 'import { subtle } from "crypto"' logic
// in a CommonJS environment for Node.js compatibility.

async function encryptData(data, key) {
  // Generate a random 12-byte IV for AES-GCM
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  
  // Encode data to Uint8Array
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  
  // Encrypt
  const encrypted = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  // Return format: IV and Data as comma-separated strings (mock binary transport)
  return {
    iv: Array.from(iv).join(','),
    data: Array.from(new Uint8Array(encrypted)).join(',')
  };
}

async function decryptData(encryptedObj, key) {
    const iv = new Uint8Array(encryptedObj.iv.split(',').map(Number));
    const data = new Uint8Array(encryptedObj.data.split(',').map(Number));
    
    const decrypted = await subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
}

// Helper to generate a key for testing or initial setup
async function generateKey() {
    return await subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

module.exports = { encryptData, decryptData, generateKey };
