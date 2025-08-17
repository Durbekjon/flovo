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
const security_module_1 = require("./security/security.module");
const logging_module_1 = require("./logging/logging.module");
const cache_module_1 = require("./cache/cache.module");
const conversation_module_1 = require("./conversation/conversation.module");
const language_module_1 = require("./language/language.module");
const memory_module_1 = require("./memory/memory.module");
const analytics_module_1 = require("./analytics/analytics.module");
const crm_module_1 = require("./crm/crm.module");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            security_module_1.SecurityModule,
            logging_module_1.LoggingModule,
            cache_module_1.CacheModule,
            conversation_module_1.ConversationModule,
            language_module_1.LanguageModule,
            memory_module_1.MemoryModule,
            analytics_module_1.AnalyticsModule,
            crm_module_1.CRMModule,
        ],
        exports: [
            prisma_module_1.PrismaModule,
            security_module_1.SecurityModule,
            logging_module_1.LoggingModule,
            cache_module_1.CacheModule,
            conversation_module_1.ConversationModule,
            language_module_1.LanguageModule,
            memory_module_1.MemoryModule,
            analytics_module_1.AnalyticsModule,
            crm_module_1.CRMModule,
        ],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map