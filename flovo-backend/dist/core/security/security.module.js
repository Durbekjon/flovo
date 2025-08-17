"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: process.env.NODE_ENV === 'production' ? 300 : 5000,
                },
                {
                    ttl: 60000,
                    limit: process.env.NODE_ENV === 'production' ? 50 : 1000,
                    name: 'sensitive',
                },
                {
                    ttl: 60000,
                    limit: process.env.NODE_ENV === 'production' ? 100 : 2000,
                    name: 'auth',
                },
            ]),
        ],
        providers: [
            ...(process.env.NODE_ENV === 'production' || process.env.ENABLE_THROTTLING === 'true' ? [{
                    provide: core_1.APP_GUARD,
                    useClass: throttler_2.ThrottlerGuard,
                }] : []),
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map