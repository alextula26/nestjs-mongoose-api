import { getNextStrId } from '../../../utils';

import {
  AccountDataType,
  EmailConfirmationType,
  PasswordRecoveryType,
  BanInfoDataType,
} from '../types';

export class UserEntity {
  id: string;
  constructor(
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public passwordRecovery: PasswordRecoveryType,
    public banInfo: BanInfoDataType,
    public refreshToken: string,
  ) {
    this.id = getNextStrId();
  }
}
