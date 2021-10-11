import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { toJSON } from './plugins/toJSON.plugin';
import { paginate } from './plugins/paginate.plugin';
import { Roles, roles } from '../config/roles';
import { prop, getModelForClass, pre, plugin, DocumentType } from '@typegoose/typegoose';
@pre<UserClass>('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
})
@plugin(toJSON)
@plugin(paginate)
class UserClass {
  paginate: ReturnType<typeof paginate>;
  toJSON: () => any;

  @prop({ trim: true })
  public name: string;

  @prop({
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  })
  public email: string;

  @prop({
    trim: true,
    minlength: 8,
    validate(value) {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error('Password must contain at least one letter and one number');
      }
    },
    private: true, // used by the toJSON plugin
  })
  public password: string;

  @prop({
    enum: roles,
    default: 'user',
  })
  role: Roles;

  @prop({ default: false })
  isEmailVerified: boolean;

  /**
   * Check if email is taken
   * @param {string} email - The user's email
   * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
   * @returns {Promise<boolean>}
   */
  static async isEmailTaken(email: string, excludeUserId?: boolean) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
  }

  /**
   * Check if password matches the user's password
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  async isPasswordMatch(password: string) {
    return bcrypt.compare(password, this.password);
  }
}

export const User = getModelForClass(UserClass);
export type UserModel = typeof UserClass;
