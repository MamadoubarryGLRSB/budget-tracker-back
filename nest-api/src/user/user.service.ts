import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return null;
      }

      // Ne pas renvoyer le mot de passe
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error finding user', error);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async delete(id: string) {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return null;
      }

      // Supprimer l'utilisateur
      await this.prisma.user.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      console.error('Error deleting user', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users;
    } catch (error) {
      console.error('Error finding users', error);
      throw new InternalServerErrorException('Failed to find users');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return null;
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const userWithEmail = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (userWithEmail) {
          throw new ConflictException('Email already exists');
        }
      }

      // Préparer les données à mettre à jour
      const updateData: any = {};

      if (updateUserDto.email) updateData.email = updateUserDto.email;
      if (updateUserDto.firstName)
        updateData.firstName = updateUserDto.firstName;
      if (updateUserDto.lastName) updateData.lastName = updateUserDto.lastName;

      // Hasher le mot de passe s'il est fourni
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Ne pas renvoyer le mot de passe
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = updatedUser;
      return result;
    } catch (error) {
      console.error('Error updating user', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }
}
