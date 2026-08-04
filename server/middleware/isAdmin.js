
module.exports = (req, res, next) => {
  if (req.user.role !== "tpo" && req.user.role !== "coordinator") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
