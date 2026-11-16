import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';
import User from '../models/userModel.js';

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
        decoded = jwt.verify(token, authConfig.jwt.secret);
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token or token expired.' });
    }

    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
        return res.status(401).send({ error: 'User not found or disabled.' });
    }

    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
    };
    return next();
}
