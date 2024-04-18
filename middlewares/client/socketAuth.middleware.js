const jwt = require('jsonwebtoken');
const systemConfig = require('../../config/system.config.js');

module.exports = async (socket, next) => {
  const {token} = socket.handshake.headers;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, systemConfig.secretKeyAccessToken);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
}