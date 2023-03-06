import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { AccountDataSchema } from './accountData.schema';
import { EmailConfirmationSchema } from './emailConfirmation.schema';
import { PasswordRecoverySchema } from './passwordRecovery.schema';
import { UserEntity } from '../entity';
import { bcryptService } from '../../application';
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

  setRefreshToken(refreshToken: string) {
    if (!refreshToken) throw new Error('Bad refreshToken value!');
    this.refreshToken = refreshToken;
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
  setRefreshToken: User.prototype.setRefreshToken,
};

UserSchema.statics = {
  make: User.make,
};
