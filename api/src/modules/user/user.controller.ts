import { Request } from 'express';
import { UserRepository } from './user.repository';
import { BaseController } from '@tscc/core';
import { UserModel } from './user.model';
import { route } from './user.boostrap';
import { z } from 'zod';

export class UserController extends BaseController {
  constructor(public userRepository: UserRepository) {
    /// DI
    super();
  }
  /// Read a list or users
  getAll = route.get('/').handler(async () => {
    return {
      data: await this.userRepository.getAll(),
    };
  });

  /// Read a single user
  get = route
    .get('/:id')
    .params(
      z.object({
        id: z.string(),
      })
    )
    .handler(async ({ params }) => {
      return {
        data: await this.userRepository.get(params.id),
      };
    });

  /// create a new user
  create = route
    .post('/')
    .body(
      z.object({
        username: z.string(),
        password: z.string(),
        email: z.string().email(),
      })
    )
    .handler(async ({ body }) => {
      return {
        data: await this.userRepository.create(body as UserModel),
      };
    });

  /// update a user
  update = route
    .put('/:id')
    .params(
      z.object({
        id: z.string(),
      })
    )
    .body(
      z.object({
        username: z.string(),
        password: z.string(),
        email: z.string().email(),
      })
    )
    .handler(async ({ params, body }) => {
      return {
        data: await this.userRepository.update({
          id: params.id,
          ...body,
        }),
      };
    });

  /// delete a user
  delete = route
    .delete('/:id')
    .params(
      z.object({
        id: z.string(),
      })
    )
    .handler(async ({ params }) => {
      return {
        data: await this.userRepository.delete(params.id),
      };
    });
}
