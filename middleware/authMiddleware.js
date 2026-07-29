const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token"
    });
  }
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    
    // Sliding session: generate a new token
    const { iat, exp, ...payload } = decoded;
    const newToken = jwt.sign(payload, "SECRET_KEY", { expiresIn: "30m" });
    
    res.setHeader('x-refresh-token', newToken);
    res.setHeader('Access-Control-Expose-Headers', 'x-refresh-token');

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};
