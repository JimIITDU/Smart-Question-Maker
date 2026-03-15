const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission.',
      });
    }
    next();
  };
};

module.exports = roleMiddleware;