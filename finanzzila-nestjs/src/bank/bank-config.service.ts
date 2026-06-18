import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface BankColumnConfig {
    date: number;
    name: number;
    amount?: number;
    expense?: number;
    income?: number;
}

export interface BankFileFormatConfig {
    startRow: number;
    columns: BankColumnConfig;
    hasSeparateIncomeExpense: boolean;
}

export interface BankAmountParsingConfig {
    europeanNumberFormat: boolean;
}

export interface BankConfig {
    bankName: string;
    fileFormats: {
        xls: BankFileFormatConfig;
        xlsx: BankFileFormatConfig;
    };
    amountParsing: BankAmountParsingConfig;
}

@Injectable()
export class BankConfigService {
    private readonly configFolderPath = path.join(__dirname, 'bank_config');
    private readonly configCache = new Map<string, BankConfig>();

    getConfig(bankName: string): BankConfig {
        const cacheKey = bankName.toLowerCase();

        if (this.configCache.has(cacheKey)) {
            return this.configCache.get(cacheKey);
        }

        const configFileName = this.bankNameToFileName(bankName);
        const configPath = path.join(this.configFolderPath, configFileName);

        if (!fs.existsSync(configPath)) {
            throw new NotFoundException(`Bank configuration not found for: ${bankName}`);
        }

        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config: BankConfig = JSON.parse(configContent);

        this.configCache.set(cacheKey, config);
        return config;
    }

    getFileFormatConfig(bankName: string, fileExtension: string): BankFileFormatConfig {
        const config = this.getConfig(bankName);
        const format = fileExtension.toLowerCase().replace('.', '');

        if (format === 'xls') {
            return config.fileFormats.xls;
        } else if (format === 'xlsx') {
            return config.fileFormats.xlsx;
        }

        throw new NotFoundException(`Unsupported file format: ${fileExtension}`);
    }

    private bankNameToFileName(bankName: string): string {
        return bankName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') + '.json';
    }
}
