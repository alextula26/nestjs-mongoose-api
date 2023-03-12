import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { AccountDataSchema } from './accountData.schema';
import { EmailConfirmationSchema } from './emailConfirmation.schema';
import { PasswordRecoverySchema } from './passwordRecovery.schema';
import { UserEntity } from '../entity';
import { bcryptService, jwtService } from '../../application';
import { generateUUID } from '../../utils';
import {
  AccountDataType,
  EmailConfirmationType,
  PasswordRecoveryType,
  MakeUserModel,
  UserStaticsType,
} from '../types';

@Schema()
export class User {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

  @Prop({
    type: AccountDataSchema,
    required: true,
  })
  accountData: AccountDataType;

  @Prop({
    type: EmailConfirmationSchema,
    required: true,
  })
  emailConfirmation: EmailConfirmationType;

  @Prop({
    type: PasswordRecoverySchema,
    required: true,
  })
  passwordRecovery: PasswordRecoveryType;

  @Prop({
    type: String,
    default: '',
  })
  refreshToken: string;

  // Обновление refresh токена пользователя
  updateRefreshToken(refreshToken: string) {
    if (!refreshToken) throw new Error('Bad refreshToken value!');
    this.refreshToken = refreshToken;
  }
  // Проверяем можно ли подтвердить аккаунт
  canBeConfirmed() {
    // Если дата истечения срока действия меньше текущей
    // Значит нельзя подтвердить аккаунт
    // Возвращаем false
    if (this.emailConfirmation.expirationDate < new Date()) {
      return false;
    }
    // Если аккаунт уже подтвержден
    // Возвращаем false
    if (this.emailConfirmation.isConfirmed) {
      return false;
    }
    // Если дата истечения срока действия больше текущей даты
    // Если аккаунт еще не подтвержден
    // Возвращаем true
    return true;
  }
  // Подтверждение аккаунта
  confirm() {
    // Если аккаунт нельзя подтвердить, возвращаем ошибку
    if (!this.canBeConfirmed()) throw new Error(`Account can't be confirm!`);
    // Если аккаунт уже подтвержден, возвращаем ошибку
    if (this.emailConfirmation.isConfirmed)
      throw new Error(`Already confirmed account can't be confirmed again!`);
    //  Если аккаунт не был подтвержден, то подтверждаем его
    this.emailConfirmation.isConfirmed = true;
  }
  // Обновление кода подтверждения аккаунта
  updateConfirmationCode() {
    // Если аккаунт нельзя подтвердить, возвращаем ошибку
    if (!this.canBeConfirmed()) throw new Error(`Account can't be confirm!`);
    // Если аккаунт уже подтвержден, возвращаем ошибку
    if (this.emailConfirmation.isConfirmed)
      throw new Error(`Already confirmed account can't be confirmed again!`);
    // Генерируем код для подтверждения пользователя
    const confirmationCode = generateUUID();
    // Записываем код для подтверждения email
    this.emailConfirmation.confirmationCode = confirmationCode;
  }
  // Обновление кода востановления пароля
  updateRecoveryCodeByEmail() {
    // Генерируем код для востановления пароля
    const recoveryCode = generateUUID();
    // Генерируем дату истечения востановления пароля
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = expirationDate;
    this.passwordRecovery.isRecovered = false;
  }
  // Аутентификация пользователя
  async isCheckCredentials(password: string) {
    // Если пароль не передан, возвращаем ошибку
    if (!password) throw new Error('Bad password value!');
    // Пролучаем соль из хэша пароля пользователя
    const passwordSalt = this.accountData.passwordHash.slice(0, 29);
    // Формируем хэш переданного пароля по соли
    const passwordHash = await bcryptService.generateHash(
      password,
      passwordSalt,
    );
    // Если сформированных хеш переданного пароля равен хэшу пароля пользователя
    // Возвращаем true
    return passwordHash === this.accountData.passwordHash;
  }
  // Генерация токенов пользователя
  async generateAuthTokens(userId: string, deviceId: string) {
    // Формируем access токен
    const accessToken = await jwtService.createAccessToken(userId);
    // Формируем refresh токен
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);
    // Получаем дату истечения срока действия refresh токена
    const expRefreshToken = await jwtService.getExpRefreshToken(refreshToken);
    // Проверяем сформировалась ли дата истечения срока действия refresh токена
    if (!expRefreshToken) {
      return null;
    }
    // Возвращаем access токен, refresh токен и дату истечения срока действия refresh токена
    return {
      accessToken,
      refreshToken,
      expRefreshToken,
    };
  }
  static async make(
    { login, password, email }: MakeUserModel,
    UserModel: UserModelType,
  ): Promise<UserDocument> {
    // Генерируем код для подтверждения email
    const confirmationCode = generateUUID();
    // Генерируем соль
    const passwordSalt = bcryptService.generateSaltSync(10);
    // Генерируем хэш пароля
    const passwordHash = await bcryptService.generateHash(
      password,
      passwordSalt,
    );

    const accountData = {
      login: trim(String(login)),
      email: trim(String(email)),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const emailConfirmation = {
      confirmationCode,
      expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
      isConfirmed: false,
    };

    const passwordRecovery = {
      recoveryCode: '',
      expirationDate: new Date(),
      isRecovered: true,
    };

    const refreshToken = '';

    const user = new UserEntity(
      accountData,
      emailConfirmation,
      passwordRecovery,
      refreshToken,
    );

    return new UserModel(user);
  }
}

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & UserStaticsType;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  updateRefreshToken: User.prototype.updateRefreshToken,
  canBeConfirmed: User.prototype.canBeConfirmed,
  updateConfirmationCode: User.prototype.updateConfirmationCode,
  updateRecoveryCodeByEmail: User.prototype.updateRecoveryCodeByEmail,
  confirm: User.prototype.confirm,
  isCheckCredentials: User.prototype.isCheckCredentials,
  generateAuthTokens: User.prototype.generateAuthTokens,
};

UserSchema.statics = {
  make: User.make,
};
