// 运维接口
import { server } from './server.js';

// 开启数据服务
server.get('/api/om/start', (req, res, next) => {
  res.send({ success: true, value: '1.0.9057' });
  next();
});

// 开启数据服务状态
server.get('/api/om/state', (req, res, next) => {
  res.send({ success: true, value: '1.0.9057' });
  next();
});