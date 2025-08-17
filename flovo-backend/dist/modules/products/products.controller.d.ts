import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { Product } from '@prisma/client';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(user: JwtPayload): Promise<Product[]>;
    createProduct(user: JwtPayload, createProductDto: CreateProductDto): Promise<Product>;
    updateProduct(user: JwtPayload, id: string, updateProductDto: Partial<CreateProductDto>): Promise<Product>;
    deleteProduct(user: JwtPayload, id: string): Promise<Product>;
}
