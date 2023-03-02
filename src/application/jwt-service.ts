import jwt from 'jsonwebtoken';
import { settings } from '../settings';

export const jwtService = {
  async createAccessToken(userId: string) {
    const accessToken = jwt.sign({ userId }, settings.ACCESS_TOKEN_SECRET, {
      expiresIn: '10d',
    });
    return accessToken;
  },
  async createRefreshToken(userId: string, deviceId: string) {
    const refreshToken = jwt.sign(
      { userId, deviceId },
      settings.REFRESH_TOKEN_SECRET,
      { expiresIn: '20d' },
    );
    return refreshToken;
  },
  async getUserIdByAccessToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.ACCESS_TOKEN_SECRET);
      return result.userId;
    } catch (error) {
      return null;
    }
  },
  async getRefreshTokenData(token: string) {
    try {
      const refreshTokenData: any = jwt.verify(
        token,
        settings.REFRESH_TOKEN_SECRET,
      );

      return {
        userId: refreshTokenData.userId,
        deviceId: refreshTokenData.deviceId,
        expRefreshToken: refreshTokenData.exp * 1000,
      };
    } catch (error) {
      return null;
    }
  },
};
