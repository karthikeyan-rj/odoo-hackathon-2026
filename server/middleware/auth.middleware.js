const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      if (token.startsWith("dummy-")) {
        // Handle dummy testing tokens
        const parts = token.split("-");
        const role = parts[1] || "Employee";
        const email = parts[2];
        if (email) {
          user = await User.findOne({ email });
        } else {
          user = await User.findOne({ role });
        }
        
        if (!user) {
          // Auto-create dummy fallback user if not found
          user = new User({
            name: `${role} User`,
            email: `${role.toLowerCase()}@assetflow.local`,
            passwordHash: "dummy-hash",
            role: role,
            status: "Active",
          });
          await user.save();
        }
      } else {
        // Verify real JWT token
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "assetflow-secret");
          user = await User.findById(decoded.sub);
        } catch (jwtErr) {
          console.error("JWT verification failed:", jwtErr.message);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Invalid or missing token." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed." });
  }
}

module.exports = authMiddleware;
