"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
let ProductsService = ProductsService_1 = class ProductsService {
    prisma;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(userId, createProductDto) {
        return this.prisma.product.create({
            data: {
                userId,
                ...createProductDto,
            },
        });
    }
    async getProductsByUser(userId) {
        return this.prisma.product.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProductsForAI(userId) {
        const products = await this.getProductsByUser(userId);
        if (products.length === 0) {
            return 'No products are currently available in inventory.';
        }
        const productList = products
            .map((product) => {
            const stockInfo = product.stock > 0 ? `(${product.stock} in stock)` : '(out of stock)';
            const priceInfo = product.price ? `$${product.price}` : 'Price not set';
            return `- ${product.name}: ${product.description || 'No description'} - ${priceInfo} ${stockInfo}`;
        })
            .join('\n');
        return `Available products:\n${productList}`;
    }
    async updateProduct(userId, productId, updateData) {
        return this.prisma.product.update({
            where: { id: productId, userId },
            data: updateData,
        });
    }
    async deleteProduct(userId, productId) {
        return this.prisma.product.update({
            where: { id: productId, userId },
            data: { isActive: false },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map