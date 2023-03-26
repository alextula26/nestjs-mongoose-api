import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { validateOrRejectModel } from '../../validate';
import { RegistrationEmailDto } from '../dto';
import { UserRepository } from '../../user/user.repository';
import { EmailManager } from '../../managers';

export class PasswordRecoveryCommand {
  constructor(public registrationEmailDto: RegistrationEmailDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailManager: EmailManager,
  ) {}
  // Отправка кода для востановления пароля
  async execute(command: PasswordRecoveryCommand): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    const { registrationEmailDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(registrationEmailDto, RegistrationEmailDto);
    // Получаем код из DTO
    const { email } = registrationEmailDto;
    // Ищем пользователя по email
    const user = await this.userRepository.findByLoginOrEmail(email);
    // Если пользователь по email не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'email',
          },
        ],
      };
    }
    // Обновляем код востановления пароля
    user.updateRecoveryCodeByEmail();
    // Обновляем пользователя в базе
    const updatedUser = await this.userRepository.save(user);
    // Отправляем письмо с новым кодом востановления пароля
    try {
      // Если обновление кода востановления пароля прошло успешно, отправляем письмо
      await this.emailManager.sendEmailWithRecoveryCode(
        email,
        updatedUser.passwordRecovery.recoveryCode,
      );
      // Возвращаем результат обнорвления кода востановления пароля
      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [
          { message: 'The update recovery code has been executed' },
        ],
      };
    } catch (error) {
      // Если письмо по какой-либо причине не было отправлено
      // Возвращаем ошибку 400
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          { message: 'The update recovery code has not been executed' },
        ],
      };
    }
  }
}
