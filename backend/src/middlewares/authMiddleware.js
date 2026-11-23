import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';
import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ error: 'No token provided.' });
    }

    const [ scheme, token ] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).send({ error: 'Token error.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, authConfig.jwt.secret, {
            algorithms: [authConfig.jwt.algorithm]
        });
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token or token expired.' });
    }

    const session = decoded.sid
        ? await Session.findByPk(decoded.sid, { include: User })
        : null;

    if (!session?.isValid() || session.userId !== decoded.id) {
        return res.status(401).send({ error: 'Session expired or revoked.' });
    }

    const user = session.User;
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        sessionId: session.id
    };
    return next();
}
