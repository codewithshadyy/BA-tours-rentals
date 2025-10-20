
export default function forceClientRole(req, res, next) {
  if (req.body && req.body.role && req.path.includes('/signup')) {
    delete req.body.role;   // completely remove any client-supplied role
  }
  next();
}
