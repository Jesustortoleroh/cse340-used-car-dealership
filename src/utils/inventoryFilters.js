const allowedSorts = new Set([
    'name_asc',
    'name_desc',
    'price_asc',
    'price_desc',
    'newest',
    'year_desc',
    'mileage_asc'
]);

const invalidFilter = (key) => {
    const error = new Error(`Invalid ${key} filter`);
    error.status = 400;
    return error;
};

const getString = (query, key, fallback = '') => {
    const value = query[key];
    if (value === undefined) {
        return fallback;
    }
    if (typeof value !== 'string') {
        throw invalidFilter(key);
    }
    return value.trim();
};

const getNumber = (query, key, { integer = false } = {}) => {
    const value = getString(query, key);
    if (!value) {
        return null;
    }

    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || (integer && !Number.isSafeInteger(number))) {
        throw invalidFilter(key);
    }

    return number;
};

const parseInventoryFilters = (query) => {
    const search = getString(query, 'search').slice(0, 100);
    const categoryValue = getString(query, 'category');
    const filters = {
        search,
        category: categoryValue && categoryValue.toLowerCase() !== 'all' ? categoryValue : '',
        minPrice: getNumber(query, 'minPrice'),
        maxPrice: getNumber(query, 'maxPrice'),
        minYear: getNumber(query, 'minYear', { integer: true }),
        maxYear: getNumber(query, 'maxYear', { integer: true }),
        maxMileage: getNumber(query, 'maxMileage', { integer: true }),
        dealer: getString(query, 'dealer'),
        sort: getString(query, 'sort', 'name_asc') || 'name_asc',
        page: getNumber(query, 'page', { integer: true }) ?? 1
    };

    if (
        (filters.minPrice !== null &&
            filters.maxPrice !== null &&
            filters.minPrice > filters.maxPrice) ||
        (filters.minYear !== null &&
            filters.maxYear !== null &&
            filters.minYear > filters.maxYear) ||
        (filters.minYear !== null && filters.minYear < 1900) ||
        (filters.maxYear !== null && filters.maxYear < 1900) ||
        (filters.minYear !== null && filters.minYear > new Date().getFullYear() + 1) ||
        (filters.maxYear !== null && filters.maxYear > new Date().getFullYear() + 1)
    ) {
        throw invalidFilter('range');
    }
    if (filters.page < 1) {
        throw invalidFilter('page');
    }
    if (!allowedSorts.has(filters.sort)) {
        throw invalidFilter('sort');
    }

    return filters;
};

export { parseInventoryFilters };
