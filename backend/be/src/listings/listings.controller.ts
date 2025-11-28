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
  create(@Body() createListingDto: any) {
    // In real app, get sellerId from authenticated user
    const sellerId = 'temp-seller-id'; // Replace with actual user ID from auth
    return this.listingsService.create(sellerId, createListingDto);
  }

  @Get()
  findAll(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
  ) {
    const filters = { categoryId, status, city, state, country };
    return this.listingsService.findAll(skip, take, filters);
  }

  @Get('auctions/active')
  getActiveAuctions() {
    return this.listingsService.getActiveAuctions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListingDto: any) {
    return this.listingsService.update(id, updateListingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }

  @Post(':id/images')
  addImages(@Param('id') id: string, @Body() images: any[]) {
    return this.listingsService.addImages(id, images);
  }
}