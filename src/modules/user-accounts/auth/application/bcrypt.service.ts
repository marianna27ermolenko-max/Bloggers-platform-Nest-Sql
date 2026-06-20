import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async generationHash(password: string) {
    const saltRounds = 10;
    const passwordSalt = await bcrypt.genSalt(saltRounds);

    return bcrypt.hash(password, passwordSalt);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash); //Проверка пароля по хэшу
  }
}
