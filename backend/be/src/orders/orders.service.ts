// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { OrderStatus, SaleType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: any) {
    const { listingId, buyerId, sellerId } = createOrderDto;

    // Check if listing exists and is available
    const listing = await this.prisma.client.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is not available for purchase');
    }

    // Check if users exist
    const [buyer, seller] = await Promise.all([
      this.prisma.client.user.findUnique({ where: { id: buyerId } }),
      this.prisma.client.user.findUnique({ where: { id: sellerId } }),
    ]);

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    // Check if buyer and seller are different
    if (buyerId === sellerId) {
      throw new BadRequestException('Buyer and seller cannot be the same');
    }

    // For bidding sales, check if buyer has the winning bid
    if (createOrderDto.saleType === SaleType.BIDDING) {
      const winningBid = await this.prisma.client.bid.findFirst({
        where: {
          listingId,
          bidderId: buyerId,
          status: 'WON',
        },
        orderBy: {
          amount: 'desc',
        },
      });

      if (!winningBid) {
        throw new BadRequestException('No winning bid found for this user');
      }
    }

    // Create the order
    const order = await this.prisma.client.order.create({
      data: {
        ...createOrderDto,
        finalPrice: createOrderDto.finalPrice,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            condition: true,
          },
        },
      },
    });

    // Update listing status to SOLD
    await this.prisma.client.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });

    return order;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [orders, total] = await Promise.all([
      this.prisma.client.order.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
              condition: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              gateway: true,
            },
          },
        },
      }),
      this.prisma.client.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        skip: skip || 0,
        take: take || orders.length,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        listing: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        payments: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: any) {
    await this.findOne(id); // Check if order exists

    // If updating status to COMPLETED, validate prerequisites
    if (updateOrderDto.orderStatus === OrderStatus.COMPLETED) {
      const order = await this.prisma.client.order.findUnique({
        where: { id },
        include: {
          payments: {
            where: {
              status: 'PAID',
            },
          },
        },
      });

      if (!order.payments.length) {
        throw new BadRequestException('Cannot complete order without successful payment');
      }
    }

    const updatedOrder = await this.prisma.client.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            condition: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if order exists

    // Check if order can be cancelled (only CREATED or PROCESSING orders can be cancelled)
    const order = await this.prisma.client.order.findUnique({
      where: { id },
    });

    if (![OrderStatus.CREATED, OrderStatus.PROCESSING].includes(order.orderStatus)) {
      throw new BadRequestException('Cannot delete order that has been shipped or completed');
    }

    await this.prisma.client.order.delete({
      where: { id },
    });

    return { message: 'Order deleted successfully' };
  }

  async getUserOrders(userId: string, role: 'buyer' | 'seller') {
    const where = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };

    const orders = await this.prisma.client.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            condition: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        payments: {
          where: {
            status: 'PAID',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  async getOrderStats(userId: string) {
    const [buyerStats, sellerStats] = await Promise.all([
      this.prisma.client.order.groupBy({
        by: ['orderStatus'],
        where: { buyerId: userId },
        _count: true,
      }),
      this.prisma.client.order.groupBy({
        by: ['orderStatus'],
        where: { sellerId: userId },
        _count: true,
      }),
    ]);

    return {
      asBuyer: buyerStats,
      asSeller: sellerStats,
    };
  }
}