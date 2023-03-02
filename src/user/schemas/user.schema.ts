import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { generateUUID } from 'src/utils';
import { UserDto } from '../dto/user.dto';
import {
  AccountDataType,
  EmailConfirmationType,
  PasswordRecoveryType,
  CreateUserDto,
  UserStaticsType,
} from '../types';
import { AccountDataSchema } from './accountData.schema';
import { EmailConfirmationSchema } from './emailConfirmation.schema';
import { PasswordRecoverySchema } from './passwordRecovery.schema';

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

  static make(
    { login, passwordHash, email }: CreateUserDto,
    UserModel: UserModelType,
  ): UserDocument {
    // Генерируем код для подтверждения email
    const confirmationCode = generateUUID();

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

    const user = new UserDto(
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