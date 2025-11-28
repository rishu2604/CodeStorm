import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.category.findMany({
      include: {
        children: true,
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        listings: {
          include: {
            images: { where: { isPrimary: true } },
            seller: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                ratingAverage: true,
              },
            },
          },
          take: 20,
        },
      },
    });
  }
}