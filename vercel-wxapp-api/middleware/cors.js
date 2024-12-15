module.exports = function cors(req, res, next) {
  // 允许所有来源访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 允许的请求方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // 允许的请求头
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 预检请求缓存时间
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}; 