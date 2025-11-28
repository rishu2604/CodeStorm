import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('product')
export class ProductController {

    constructor(private readonly prisma: PrismaService) {}

    @Get()
    async findAll() {
        try {
            const products = await this.prisma.client.listing.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    images: true,
                    category: true,
                    seller: true,
                }
            })
            return products
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}
