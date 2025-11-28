import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards 
} from '@nestjs/common';
import { ListingsService } from './listings.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  async create(@Body() createListingDto: any) {
    // In real app, get sellerId from authenticated user
    const sellerId = 'temp-seller-id'; // Replace with actual user ID from auth
    return this.listingsService.create(sellerId, createListingDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    const pageNumber = parseInt(page, 10) || 1;
  const perPage = parseInt(pageSize, 10) || 10;
    return this.listingsService.findAll(pageNumber, perPage);
  }

  @Get('auctions/active')
  async getActiveAuctions() {
    return this.listingsService.getActiveAuctions();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateListingDto: any) {
    return this.listingsService.update(id, updateListingDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }

  @Post(':id/images')
  addImages(@Param('id') id: string, @Body() images: any[]) {
    return this.listingsService.addImages(id, images);
  }
}