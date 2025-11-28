import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ListingsService } from '../listings/listings.service';
import { BidStatus, ListingStatus, PricingType } from 'generated/prisma/enums';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private listingsService: ListingsService,
  ) {}

  async create(bidderId: string, createBidDto: any) {
    const { listingId, amount } = createBidDto;

    // Get listing with current highest bid
    const listing = await this.prisma.client.listing.findUnique({
      where: { id: listingId },
      include: {
        bids: {
          where: { status: BidStatus.VALID },
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Listing is not active');
    }

    if (listing.pricingType !== PricingType.BIDDING) {
      throw new BadRequestException('Listing is not available for bidding');
    }

    if (listing.auctionEndAt && listing.auctionEndAt <= new Date()) {
      throw new BadRequestException('Auction has ended');
    }

    const currentHighestBid = listing.bids[0];
    const minBidAmount = currentHighestBid 
      ? currentHighestBid.amount + (listing.minBidIncrement || 1)
      : (listing.startingPrice || 0);

    if (amount < minBidAmount) {
      throw new BadRequestException(`Bid amount must be at least ${minBidAmount}`);
    }

    // Start transaction
    return this.prisma.client.$transaction(async (tx) => {
      // Create new bid
      const bid = await tx.bid.create({
        data: {
          listingId,
          bidderId,
          amount,
        },
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          listing: true,
        },
      });

      // Update listing current price
      await tx.listing.update({
        where: { id: listingId },
        data: { currentPrice: amount },
      });

      // Mark previous highest bid as OUTBID if it exists and is from different bidder
      if (currentHighestBid && currentHighestBid.bidderId !== bidderId) {
        await tx.bid.update({
          where: { id: currentHighestBid.id },
          data: { status: BidStatus.OUTBID },
        });
      }

      return bid;
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.client.bid.findMany({
      where: { listingId },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { amount: 'desc' },
    });
  }

  async findByBidder(bidderId: string) {
    return this.prisma.client.bid.findMany({
      where: { bidderId },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true } },
            seller: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWinningBid(listingId: string) {
    return this.prisma.client.bid.findFirst({
      where: { 
        listingId,
        status: BidStatus.VALID,
      },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { amount: 'desc' },
    });
  }
}