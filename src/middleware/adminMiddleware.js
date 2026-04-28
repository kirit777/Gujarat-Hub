function adminMiddleware(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

module.exports = adminMiddleware;
