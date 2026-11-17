import AuthController from "../controllers/authController.js";
import authConfig from "../config/auth.js";

const { cookieName, maxAge } = authConfig.session;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
};

function sendSession(res, { refreshToken, ...auth }) {
  res.cookie(cookieName, refreshToken, { ...cookieOptions, maxAge });
  return res.json(auth);
}

function userAgentOf(req) {
  return req.get("user-agent") || "";
}

class AuthView {
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const auth = await AuthController.login(email, password, userAgentOf(req));
      return sendSession(res, auth);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async refresh(req, res) {
    const refreshToken = req.cookies[cookieName];

    try {
      const auth =
        refreshToken &&
        (await AuthController.refresh(refreshToken, userAgentOf(req)));

      if (auth) return sendSession(res, auth);
    } catch (error) {
      console.error("Error in refresh:", error);
    }

    res.clearCookie(cookieName, cookieOptions);
    return res.status(401).json({ error: "Session expired or revoked." });
  }

  static async logout(req, res) {
    const refreshToken = req.cookies[cookieName];

    try {
      if (refreshToken) await AuthController.logout(refreshToken);
    } catch (error) {
      console.error("Error in logout:", error);
    }

    res.clearCookie(cookieName, cookieOptions);
    return res.status(204).send();
  }
}

export default AuthView;
