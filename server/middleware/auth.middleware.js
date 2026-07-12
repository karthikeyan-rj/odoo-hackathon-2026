const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let role = "Employee"; // Default fallback

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token.startsWith("dummy-")) {
        role = token.split("-")[1];
      }
    }

    // Find or create a dummy user in the database for this role
    let user = await User.findOne({ role });
    if (!user) {
      user = new User({
        name: `${role} User`,
        email: `${role.toLowerCase()}@assetflow.local`,
        passwordHash: "dummy-hash",
        role: role,
        status: "Active",
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
}

module.exports = authMiddleware;
