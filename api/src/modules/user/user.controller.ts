import { Request, Response } from 'express';
import { UserRepository } from './user.repository';
import { BaseController } from '@tscc/core';

export class UserController extends BaseController {
  constructor(public userRepository: UserRepository) {
    /// DI
    super();
  }
  /// Read a list or users
  async getAll() {
    return {
      data: await this.userRepository.getAll(),
    };
  }

  /// Read a single user
  async get(req: Request) {
    return {
      data: await this.userRepository.get(req.params.id),
    };
  }

  /// create a new user
  async create(req: Request) {
    return {
      data: await this.userRepository.create(req.body),
    };
  }

  /// update a user
  async update(req: Request) {
    return {
      data: await this.userRepository.update({
        ...req.body,
        id: req.params.id,
      }),
    };
  }

  /// delete a user
  async delete(req: Request) {
    return {
      data: await this.userRepository.delete(req.params.id),
    };
  }
}
