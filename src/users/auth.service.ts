import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // Hash the user's password
    // Generate the salt
    const salt = randomBytes(8).toString('hex');
    // Hash the password and salt together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex');
    // Create a new user and save it, store the result as password
    const user = await this.usersService.create(email, result);
    // Return the user
    return user;
  }

  // Checks if email and password are correct
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    // Split the stored password into two parts
    const [salt, storedHash] = user.password.split('.');
    // Hash the provided password and salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Return if the two hashes match
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    } else {
      return user;
    }
  }
}
