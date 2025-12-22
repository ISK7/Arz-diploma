import jwt from 'jsonwebtoken'
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from './variables.ts'
import { prisma } from './db_connection.ts'
import crypto from 'crypto'


function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

const ACCESS_SECRET = JWT_ACCESS_KEY
const REFRESH_SECRET = JWT_REFRESH_KEY

export function generateAccessToken(deviceId: string) {
  return jwt.sign({ deviceId }, ACCESS_SECRET, {
    expiresIn: '1h'
  })
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: '12h'
  })
}

export function verifyAccessToken(token: string) {
    try {
        return jwt.verify(token, ACCESS_SECRET);
    } catch (e) {
        throw new Error('Invalid access token');
    }
}

export async function addRefreshToken(token: string, userId: number, deviceId: string) {
    await prisma.refreshToken.create({
        data: {
            token: hashToken(token),
            userId,
            deviceId,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
        }
    })
}
export async function verifyRefreshToken(token: string) {
    const hashedToken = hashToken(token);
    const storedToken = await prisma.refreshToken.findUnique({
        where: {
            token: hashedToken
        }
    });
    if (!storedToken) {
        throw new Error('Refresh token not found');
    }
    try {
        jwt.verify(token, REFRESH_SECRET);
    } catch (e) {
        throw new Error('Invalid refresh token');
    }
}

export async function deleteRefreshToken(token: string, userId: number) {
    token = hashToken(token);
    await prisma.refreshToken.deleteMany({
        where: {
            token,
            userId
        }
    });
}
