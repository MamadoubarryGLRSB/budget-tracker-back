import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private prisma: PrismaClient;

  constructor() {
    try {
      this.prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize PrismaClient', error);
      throw new InternalServerErrorException('Database connection error');
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Création de l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      });

      // Ne pas renvoyer le mot de passe
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    } catch (error) {
      console.error('User creation error', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
