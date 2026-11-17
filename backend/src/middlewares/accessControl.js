function deny(res) {
  return res.status(403).json({ error: "Access denied." });
}

export function requireOwner(req, res, next) {
  if (req.user.role !== "OWNER") return deny(res);
  return next();
}

export function requireSelf(req, res, next) {
  if (req.params.id !== req.user.id) return deny(res);
  return next();
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (req.user.role === "OWNER" || req.user.permissions.includes(permission)) {
      return next();
    }
    return deny(res);
  };
}
