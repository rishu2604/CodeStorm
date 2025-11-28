import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ListingStatus, PricingType } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(sellerId: string, createListingDto: any) {
    // Validate auction dates for bidding listings
    if (createListingDto.pricingType === PricingType.BIDDING) {
      if (!createListingDto.auctionStartAt || !createListingDto.auctionEndAt) {
        throw new BadRequestException('Auction start and end dates are required for bidding listings');
      }
      if (createListingDto.auctionEndAt <= createListingDto.auctionStartAt) {
        throw new BadRequestException('Auction end date must be after start date');
      }
    }

    return this.prisma.client.listing.create({
      data: {
        ...createListingDto,
        sellerId,
        currentPrice: createListingDto.pricingType === PricingType.BIDDING 
          ? createListingDto.startingPrice 
          : createListingDto.price,
      },
      include: this.getListingIncludeFields(),
    });
  }

  async findAll(skip = 0, take = 10, filters?: any) {
    const where = this.buildWhereClause(filters);

    const [listings, total] = await Promise.all([
      this.prisma.client.listing.findMany({
        skip,
        take,
        where,
        include: this.getListingIncludeFields(),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.listing.count({ where }),
    ]);

    return { listings, total, skip, take };
  }

  async findOne(id: string) {
    const listing = await this.prisma.client.listing.findUnique({
      where: { id },
      include: this.getListingIncludeFields(),
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    // Increment views count
    await this.prisma.client.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return listing;
  }

  async update(id: string, updateListingDto: any) {
    await this.findOne(id); // Check if listing exists

    return this.prisma.client.listing.update({
      where: { id },
      data: updateListingDto,
      include: this.getListingIncludeFields(),
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if listing exists

    return this.prisma.client.listing.delete({
      where: { id },
      include: this.getListingIncludeFields(),
    });
  }

  async addImages(listingId: string, images: any[]) {
    await this.findOne(listingId); // Check if listing exists

    return this.prisma.client.listingImage.createMany({
      data: images.map(image => ({
        ...image,
        listingId,
      })),
    });
  }

  async getActiveAuctions() {
    return this.prisma.client.listing.findMany({
      where: {
        pricingType: PricingType.BIDDING,
        status: ListingStatus.ACTIVE,
        auctionEndAt: { gt: new Date() },
      },
      include: this.getListingIncludeFields(),
      orderBy: { auctionEndAt: 'asc' },
    });
  }

  private buildWhereClause(filters: any) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.sellerId) {
      where.sellerId = filters.sellerId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.pricingType) {
      where.pricingType = filters.pricingType;
    }
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }
    if (filters?.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }
    if (filters?.minPrice) {
      where.OR = [
        { price: { gte: filters.minPrice } },
        { currentPrice: { gte: filters.minPrice } },
      ];
    }
    if (filters?.maxPrice) {
      where.OR = [
        { price: { lte: filters.maxPrice } },
        { currentPrice: { lte: filters.maxPrice } },
      ];
    }

    return where;
  }

  private getListingIncludeFields() {
    return {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          ratingAverage: true,
          ratingCount: true,
        },
      },
      category: true,
      images: true,
      bids: {
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { amount: Prisma.SortOrder.desc },
        take: 10,
      },
      _count: {
        select: {
          bids: true,
          favourites: true,
        },
      },
    };
  }
}