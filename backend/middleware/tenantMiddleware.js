const tenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. User not authenticated.',
    });
  }

  // Attach tenant info to request
  req.tenant = {
    coaching_center_id: req.user.coaching_center_id,
    is_super_admin: req.user.role_id === 1,
  };

  next();
};

module.exports = tenantMiddleware;
