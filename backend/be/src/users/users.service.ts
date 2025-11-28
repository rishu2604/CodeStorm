import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, 12);
    
    return this.prisma.client.user.create({
      data: {
        ...createUserDto,
        passwordHash: hashedPassword,
      },
      select: this.getUserSelectFields(),
    });
  }

  async findAll(skip = 0, take = 10) {
    const [users, total] = await Promise.all([
      this.prisma.client.user.findMany({
        skip,
        take,
        select: this.getUserSelectFields(),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.user.count(),
    ]);

    return { users, total, skip, take };
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: this.getUserSelectFields(),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: any) {
    await this.findOne(id); // Check if user exists

    if (updateUserDto.passwordHash) {
      updateUserDto.passwordHash = await bcrypt.hash(updateUserDto.passwordHash, 12);
    }

    return this.prisma.client.user.update({
      where: { id },
      data: updateUserDto,
      select: this.getUserSelectFields(),
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if user exists

    return this.prisma.client.user.delete({
      where: { id },
      select: this.getUserSelectFields(),
    });
  }

  private getUserSelectFields() {
    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      country: true,
      pincode: true,
      ratingAverage: true,
      ratingCount: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}