"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModule = void 0;
const common_1 = require("@nestjs/common");
const conversation_context_service_1 = require("./conversation-context.service");
const prisma_module_1 = require("../prisma/prisma.module");
const language_module_1 = require("../language/language.module");
const memory_module_1 = require("../memory/memory.module");
let ConversationModule = class ConversationModule {
};
exports.ConversationModule = ConversationModule;
exports.ConversationModule = ConversationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, language_module_1.LanguageModule, memory_module_1.MemoryModule],
        providers: [conversation_context_service_1.ConversationContextService],
        exports: [conversation_context_service_1.ConversationContextService],
    })
], ConversationModule);
//# sourceMappingURL=conversation.module.js.map