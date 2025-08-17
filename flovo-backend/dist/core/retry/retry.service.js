"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
let RetryService = RetryService_1 = class RetryService {
    logger = new common_1.Logger(RetryService_1.name);
    async executeWithRetry(operation, options = {}) {
        const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000, backoffMultiplier = 2, } = options;
        let lastError;
        let delay = baseDelay;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxAttempts) {
                    this.logger.error(`Operation failed after ${maxAttempts} attempts`, {
                        error: lastError.message,
                        stack: lastError.stack,
                    });
                    throw lastError;
                }
                this.logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms`, {
                    error: lastError.message,
                    attempt,
                    delay,
                });
                await this.sleep(delay);
                delay = Math.min(delay * backoffMultiplier, maxDelay);
            }
        }
        throw lastError;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.RetryService = RetryService;
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)()
], RetryService);
//# sourceMappingURL=retry.service.js.map