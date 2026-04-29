const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { env } = require('../config/env');

function hashToken(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            role: user.role,
            approved: Boolean(user.isApproved),
            type: 'access',
        },
        env.jwtAccessSecret,
        { expiresIn: env.accessTokenTtl }
    );
}

function signRefreshToken(payload) {
    return jwt.sign(
        {
            sub: payload.userId,
            familyId: payload.familyId,
            sessionId: payload.sessionId,
            type: 'refresh',
        },
        env.jwtRefreshSecret,
        { expiresIn: env.refreshTokenTtl }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, env.jwtRefreshSecret);
}

function hashPassword(password) {
    return bcrypt.hash(password, env.bcryptRounds);
}

function comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

module.exports = {
    comparePassword,
    generateOtp,
    hashPassword,
    hashToken,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
