import { getNextStrId } from 'src/utils';
import {
  AccountDataType,
  EmailConfirmationType,
  PasswordRecoveryType,
} from '../types';

export class UserDto {
  id: string;
  constructor(
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public passwordRecovery: PasswordRecoveryType,
    public refreshToken: string,
  ) {
    this.id = getNextStrId();
  }
}
