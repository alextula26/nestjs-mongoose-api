import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { validateOrRejectModel } from '../../../validate';
import { UserRepository } from '../../user/user.repository';

import { ConfirmPasswordDto } from '../dto';

export class NewPasswordCommand {
  constructor(public confirmPasswordDto: ConfirmPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  // Востановление пароля
  async execute(command: NewPasswordCommand): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    const { confirmPasswordDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(confirmPasswordDto, ConfirmPasswordDto);
    // Получаем код востановления пароля и новый пароль из DTO
    const { recoveryCode, newPassword } = confirmPasswordDto;
    // Ищем пользователя по коду востановления пароля
    const user = await this.userRepository.findByRecoveryCode(recoveryCode);
    // Если пользователь по коду востановления пароля не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'recoveryCode',
          },
        ],
      };
    }
    // Если дата для востановления пароля по коду просрочена
    // Если пароль уже востановлен
    // Возвращаем ошибку 400
    if (!user.canBePasswordRecovery()) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The password cannot be restored`,
            field: 'recoveryCode',
          },
        ],
      };
    }
    // Обновляем пароль пользователя
    await user.updatePassword(newPassword);
    // Обновляем пользователя в базе
    await this.userRepository.save(user);
    // Возвращаем статус 204
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: [{ message: 'The password has been restored' }],
    };
  }
}
