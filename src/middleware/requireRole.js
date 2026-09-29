// Use after authenticate: requireRole('tutor') blocks everyone else with 403
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Only ${role}s can do this` });
    }
    next();
  };
}

module.exports = requireRole;
