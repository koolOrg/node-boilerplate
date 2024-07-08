import jwt from 'jsonwebtoken';
import moment from 'moment';
import { NOT_FOUND } from 'http-status';
import { jwt as _jwt } from '../config/config';
import userService from './user.service';
import Token from '../models/schema/Token';
import ApiError from '../utils/ApiError';
import tokenTypes from '../config/tokens';

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
export const generateToken = (userId, expires, type, secret = _jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
export const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};
/**
 * Revoke previous token login
 * @param {*} userId
 * @returns
 */
export const revokeToken = async (userId) => {
  return Token.update(
    {
      is_blacklisted: true,
    },
    { where: { user_id: userId } },
  );
};
/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
export const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, _jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
export const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(_jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.user_id, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(_jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.user_id, refreshTokenExpires, tokenTypes.REFRESH);
  await revokeToken(user.user_id);
  await saveToken(refreshToken, user.user_id, refreshTokenExpires, tokenTypes.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
export const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(_jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.user_id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.user_id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
export const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(_jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.user_id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.user_id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
/**
 *
 * @param {import('sequelize').Filterable<Token>.where} where
 * @returns
 */
export const findToken = async (where) => Token.findOne({ where });
