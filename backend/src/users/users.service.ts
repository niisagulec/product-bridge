import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
  findById(id: number) {
  return this.usersRepository.findOne({ where: { id } });
}

  async findAllSafe() {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });
    // password kesinlikle dönmesin
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
  }

  createUser(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  // admin seed veya ileride kullanılabilir
  createAdmin(data: Partial<User>) {
    return this.createUser({ ...data, role: UserRole.ADMIN });
  }
}
