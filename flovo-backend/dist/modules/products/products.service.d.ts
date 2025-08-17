import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import type { Product } from '@prisma/client';
export declare class ProductsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createProduct(userId: number, createProductDto: CreateProductDto): Promise<Product>;
    getProductsByUser(userId: number): Promise<Product[]>;
    getProductsForAI(userId: number): Promise<string>;
    updateProduct(userId: number, productId: number, updateData: Partial<CreateProductDto>): Promise<Product>;
    deleteProduct(userId: number, productId: number): Promise<Product>;
}
