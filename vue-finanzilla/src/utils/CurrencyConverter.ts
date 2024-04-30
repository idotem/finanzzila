const mkdFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'MKD'
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

const usdFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
});

const eurFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR'
});

function getAppropriateFormatter(currency: string) {
    switch (currency) {
        case 'MKD':
            return mkdFormatter;
        case 'USD':
            return usdFormatter;
        case 'EUR':
            return eurFormatter;
        default:
            return mkdFormatter;
    }
}

function convertMKDtoCustomCurrency(valueInMKD: number, currency: string) {
    switch (currency) {
        case 'USD':
            return valueInMKD / 56.68; // current exchange rate
        case 'EUR':
            return valueInMKD / 61.5; // current exchange rate
        default:
            return valueInMKD;
    }
}

export function convertNumberToCurrency(
    valueInMKD: number | undefined,
    currency: string
) {
    if (valueInMKD === undefined) {
        return valueInMKD;
    }
    const valueInRequestedCurrency = convertMKDtoCustomCurrency(
        valueInMKD,
        currency
    );
    const formatter = getAppropriateFormatter(currency);
    return formatter.format(valueInRequestedCurrency);
}
