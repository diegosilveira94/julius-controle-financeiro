import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/userModel.js";
import Session from "../models/sessionModel.js";
import UserController from "./userController.js";
import authConfig from "../config/auth.js";

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sameHash(a, b) {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

class AuthController {
  static async login(email, password, userAgent) {
    const user = await User.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials.");
    }

    if (!user.isActive) {
      throw new Error("Account disabled.");
    }

    const session = Session.build({
      userId: user.id,
      userAgent,
      expiresAt: new Date(Date.now() + authConfig.session.maxAge),
    });

    return AuthController.issueTokens(session, user);
  }

  static async refresh(refreshToken, userAgent) {
    const [sessionId, secret] = String(refreshToken).split(".");
    const session = await Session.findByPk(sessionId, { include: User });

    if (!session?.isValid()) return null;

    if (!sameHash(session.tokenHash, hash(secret)) || session.userAgent !== userAgent) {
      await session.update({ revokedAt: new Date() });
      return null;
    }

    return AuthController.issueTokens(session, session.User);
  }

  static async logout(refreshToken) {
    const [sessionId] = String(refreshToken).split(".");
    await Session.update(
      { revokedAt: new Date() },
      { where: { id: sessionId, revokedAt: null } },
    );
  }

  static async revokeSessions(userId, exceptSessionId) {
    const where = { userId, revokedAt: null };

    if (exceptSessionId) where.id = { [Op.ne]: exceptSessionId };

    await Session.update({ revokedAt: new Date() }, { where });
  }

  static async issueTokens(session, user) {
    const secret = crypto.randomBytes(32).toString("base64url");
    session.tokenHash = hash(secret);
    await session.save();

    const token = jwt.sign(
      { id: user.id, sid: session.id },
      authConfig.jwt.secret,
      {
        algorithm: authConfig.jwt.algorithm,
        expiresIn: authConfig.jwt.expiresIn,
      },
    );

    return {
      token,
      refreshToken: `${session.id}.${secret}`,
      user: UserController.mapPublicUser(user),
    };
  }
}

export default AuthController;
