import { Database } from '@tscc/core';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from './user.model';

const db = new Database<UserModel>('users', {
  defaultData: [
    {
      id: uuidv4(),
      username: 'firstUser',
      password: 'password',
      email: 'first@gmail.com',
    },
  ],
});

const userRepository = new UserRepository(db);
export const userController = new UserController(userRepository);
