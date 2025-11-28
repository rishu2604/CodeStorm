import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(@Body() createBidDto: any) {
    // In real app, get bidderId from authenticated user
    const bidderId = 'temp-bidder-id'; // Replace with actual user ID from auth
    return this.bidsService.create(bidderId, createBidDto);
  }

  @Get('listing/:listingId')
  findByListing(@Param('listingId') listingId: string) {
    return this.bidsService.findByListing(listingId);
  }

  @Get('my-bids')
  findByBidder() {
    // In real app, get bidderId from authenticated user
    const bidderId = 'temp-bidder-id'; // Replace with actual user ID from auth
    return this.bidsService.findByBidder(bidderId);
  }

  @Get('winning/:listingId')
  getWinningBid(@Param('listingId') listingId: string) {
    return this.bidsService.getWinningBid(listingId);
  }
}