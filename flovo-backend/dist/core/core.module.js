"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const health_controller_1 = require("./health/health.controller");
const encryption_service_1 = require("./encryption/encryption.service");
const gemini_service_1 = require("./gemini/gemini.service");
const retry_service_1 = require("./retry/retry.service");
const security_module_1 = require("./security/security.module");
const logging_module_1 = require("./logging/logging.module");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, security_module_1.SecurityModule, logging_module_1.LoggingModule],
        controllers: [health_controller_1.HealthController],
        providers: [encryption_service_1.EncryptionService, gemini_service_1.GeminiService, retry_service_1.RetryService],
        exports: [prisma_module_1.PrismaModule, encryption_service_1.EncryptionService, gemini_service_1.GeminiService, retry_service_1.RetryService],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map