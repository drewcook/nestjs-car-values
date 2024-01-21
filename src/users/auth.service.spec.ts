import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the Users Service dependency (intelligent mock)
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    // Setup testing DI container
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        // Tell testing module to use the mock for Users Service dependency
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    // Create instance of service
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('throws an error if user signs up with email that is in use', async () => {
      await service.signup('a@test.com', 'pw');
      await expect(service.signup('a@test.com', 'pw')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates a new user with a salted and hashed password', async () => {
      const user = await service.signup('a@test.com', 'pw');
      expect(user.password).not.toEqual('pw');
      const [salt, hash] = user.password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });
  });

  describe('signin', () => {
    it('throws if signin is called with an unused email', async () => {
      await expect(service.signin('b@test.com', 'pw')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws if signin is called with an invalid password', async () => {
      await service.signup('a@test.com', 'pw');
      await expect(service.signin('a@test.com', 'password')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('signs in a user with existing email and correct password', async () => {
      await service.signup('a@test.com', 'pw');
      const user = await service.signin('a@test.com', 'pw');
      expect(user).toBeDefined();
    });
  });
});
