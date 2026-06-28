import db from '../db.js';

/**
 * Get all vehicles with category information
 */
const getVehicles = async (category = null, sortBy = 'price') => {
    const whereClause = category
        ? 'WHERE LOWER(c.name) = LOWER($1)'
        : '';

    const orderByClause =
        sortBy === 'name'
            ? 'v.name'
            : 'v.price';

    const query = `
        SELECT v.id, v.name, v.price,
               c.name AS category
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        ${whereClause}
        ORDER BY ${orderByClause}
    `;

    const params = category ? [category] : [];

    const result = await db.query(query, params);

    return result.rows.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        price: vehicle.price,
        category: vehicle.category
    }));
};

/**
 * Get a single vehicle by ID
 */
const getVehicleDetail = async (identifier, identifierType = 'id') => {
    const whereClause = identifierType === 'id'
        ? 'v.id = $1'
        : 'v.name ILIKE $1'; // Fallback for name-based lookup

    const query = `
        SELECT v.id, v.name, v.price,
               c.name AS category
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE ${whereClause}
    `;

    const result = await db.query(query, [identifier]);

    if (result.rows.length === 0) return null;

    return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        price: result.rows[0].price,
        category: result.rows[0].category
    };
};

/**
 * Get all vehicles (with optional category filter)
 */
const getAllVehicles = async () => {
    return await getVehicles();
};

/**
 * Get vehicles by category
 */
const getVehiclesByCategory = async (category) => {
    if (!category || category === 'All' || category === 'all') {
        return await getVehicles();
    }
    return await getVehicles(category);
};

/**
 * Get vehicle by ID
 */
const getVehicleById = async (id) => {
    return await getVehicleDetail(id, 'id');
};

/**
 * Get vehicle by name (slug fallback)
 */
const getVehicleBySlug = async (slug) => {
    // Try to find by ID first (since your slugs might be IDs)
    const id = parseInt(slug);
    if (!isNaN(id)) {
        return await getVehicleDetail(id, 'id');
    }
    // Fallback: search by name
    return await getVehicleDetail(slug, 'name');
};

export {
    getAllVehicles,
    getVehiclesByCategory,
    getVehicleById,
    getVehicleBySlug
};