/**
 * Utility functions for timezone-safe date parsing, formatting, and comparisons.
 */

/**
 * Parse any date representation (Date object, 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss.sssZ', 'DD.MM.YYYY')
 * into a local Date object without timezone shifting.
 */
export function parseDate(dateVal: Date | string | undefined | null): Date {
    if (!dateVal) return new Date();
    if (dateVal instanceof Date) return new Date(dateVal.getTime());
    if (typeof dateVal === 'string') {
        const isoMatch = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10), 0, 0, 0, 0);
        }
        const dotMatch = dateVal.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (dotMatch) {
            return new Date(parseInt(dotMatch[3], 10), parseInt(dotMatch[2], 10) - 1, parseInt(dotMatch[1], 10), 0, 0, 0, 0);
        }
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Format a Date to local 'YYYY-MM-DD' string.
 */
export function formatDateToYYYYMMDD(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = parseDate(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format a Date to display 'DD.MM.YYYY' string.
 */
export function formatDateDisplay(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = parseDate(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Get the date range for a given month string 'YYYY-MM'.
 * Returns start date (1st of month 00:00:00.000) and end date (last day of month 23:59:59.999),
 * along with formatted display strings.
 */
export function getMonthDateRange(monthStr: string): {
    start: Date;
    end: Date;
    startFormatted: string;
    endFormatted: string;
    monthName: string;
} {
    const [yStr, mStr] = monthStr.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10); // 1-indexed (1 to 12)

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const monthName = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    return {
        start,
        end,
        startFormatted: formatDateDisplay(start),
        endFormatted: formatDateDisplay(end),
        monthName
    };
}

/**
 * Check if a date falls within [start, end] inclusive.
 */
export function isDateInRange(date: Date | string, start: Date, end: Date): boolean {
    const d = parseDate(date);
    return d >= start && d <= end;
}
