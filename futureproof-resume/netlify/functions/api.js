// netlify/functions/api.js
const serverless = require('serverless-http');
// Impor aplikasi Express Anda dari file index.js di root
const app = require('../../index'); 

// Bungkus aplikasi Anda agar kompatibel dengan Netlify
module.exports.handler = serverless(app);