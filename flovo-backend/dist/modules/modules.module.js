"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const orders_module_1 = require("./orders/orders.module");
const products_module_1 = require("./products/products.module");
const telegram_module_1 = require("./telegram/telegram.module");
const analytics_module_1 = require("./analytics/analytics.module");
const crm_module_1 = require("./crm/crm.module");
let ModulesModule = class ModulesModule {
};
exports.ModulesModule = ModulesModule;
exports.ModulesModule = ModulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            products_module_1.ProductsModule,
            telegram_module_1.TelegramModule,
            analytics_module_1.AnalyticsModule,
            crm_module_1.CRMModule,
        ],
    })
], ModulesModule);
//# sourceMappingURL=modules.module.js.map