import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BankConfigService } from './bank-config.service';

jest.mock('fs');

describe('BankConfigService', () => {
    let service: BankConfigService;
    let existsSyncMock: jest.Mock;
    let readFileSyncMock: jest.Mock;

    const komercijalnaConfig = {
        bankName: 'KOMERCIJALNA BANKA',
        fileFormats: {
            xls: {
                startRow: 1,
                columns: { date: 0, name: 1, amount: 3 },
                hasSeparateIncomeExpense: false
            },
            xlsx: {
                startRow: 2,
                columns: { date: 1, name: 2, amount: 4 },
                hasSeparateIncomeExpense: false
            }
        },
        amountParsing: { europeanNumberFormat: false }
    };

    const nlbConfig = {
        bankName: 'NLB BANKA',
        fileFormats: {
            xls: {
                startRow: 27,
                columns: { date: 4, name: 5, expense: 15, income: 17 },
                hasSeparateIncomeExpense: true
            },
            xlsx: {
                startRow: 28,
                columns: { date: 5, name: 6, expense: 16, income: 18 },
                hasSeparateIncomeExpense: true
            }
        },
        amountParsing: { europeanNumberFormat: true }
    };

    beforeEach(() => {
        existsSyncMock = fs.existsSync as unknown as jest.Mock;
        readFileSyncMock = fs.readFileSync as unknown as jest.Mock;
        existsSyncMock.mockReset();
        readFileSyncMock.mockReset();
        service = new BankConfigService();
    });

    describe('getConfig', () => {
        it('should read and parse the config file when not cached', () => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(komercijalnaConfig));

            const result = service.getConfig('KOMERCIJALNA BANKA');

            expect(result.bankName).toBe('KOMERCIJALNA BANKA');
            expect(existsSyncMock).toHaveBeenCalledTimes(1);
            expect(readFileSyncMock).toHaveBeenCalledTimes(1);
        });

        it('should cache the config so subsequent reads do not hit the disk', () => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(komercijalnaConfig));

            service.getConfig('KOMERCIJALNA BANKA');
            const second = service.getConfig('KOMERCIJALNA BANKA');

            expect(second.bankName).toBe('KOMERCIJALNA BANKA');
            expect(readFileSyncMock).toHaveBeenCalledTimes(1);
        });

        it('should use a case-insensitive cache key', () => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(komercijalnaConfig));

            service.getConfig('KOMERCIJALNA BANKA');
            service.getConfig('komercijalna banka');

            expect(readFileSyncMock).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when the config file does not exist', () => {
            existsSyncMock.mockReturnValue(false);

            expect(() => service.getConfig('UNKNOWN BANK')).toThrow(NotFoundException);
            expect(readFileSyncMock).not.toHaveBeenCalled();
        });

        it('should convert the bank name to a lowercase dashed file name', () => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(nlbConfig));

            service.getConfig('NLB BANKA');

            const expectedPath = path.join(__dirname, 'bank_config', 'nlb-banka.json');
            expect(existsSyncMock).toHaveBeenCalledWith(expectedPath);
            expect(readFileSyncMock).toHaveBeenCalledWith(expectedPath, 'utf-8');
        });
    });

    describe('getFileFormatConfig', () => {
        beforeEach(() => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(komercijalnaConfig));
        });

        it('should return the xls config for the .xls extension', () => {
            const cfg = service.getFileFormatConfig('KOMERCIJALNA BANKA', '.xls');
            expect(cfg.hasSeparateIncomeExpense).toBe(false);
            expect(cfg.columns.date).toBe(0);
        });

        it('should return the xlsx config for the .xlsx extension', () => {
            const cfg = service.getFileFormatConfig('KOMERCIJALNA BANKA', 'xlsx');
            expect(cfg.startRow).toBe(2);
        });

        it('should throw NotFoundException for an unsupported file extension', () => {
            existsSyncMock.mockReturnValue(true);
            readFileSyncMock.mockReturnValue(JSON.stringify(komercijalnaConfig));
            service.getConfig('KOMERCIJALNA BANKA');

            expect(() => service.getFileFormatConfig('KOMERCIJALNA BANKA', '.csv')).toThrow(
                NotFoundException
            );
        });
    });
});
