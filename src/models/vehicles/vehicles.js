import db from '../db.js';

const getVehicles = async (category = null, sortBy = 'price') => {
    const whereClause = category
        ? 'WHERE LOWER(c.name) = LOWER($1)'
        : '';

    const orderByClause =
        sortBy === 'name'
            ? 'v.name'
            : 'v.price';

    const query = `
        SELECT v.id, v.name, v.description, v.price, v.slug,
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
        description: vehicle.description,
        price: vehicle.price,
        category: vehicle.category,
        slug: vehicle.slug
    }));
};

const getVehicleDetail = async (identifier, identifierType = 'id', sortBy = 'feature') => {

    const whereClause =
        identifierType === 'slug'
            ? 'v.slug = $1'
            : 'v.id = $1';

    const orderByClause =
        sortBy === 'value'
            ? 'vs.value NULLS LAST'
            : 'vs.feature NULLS LAST';

    const query = `
        SELECT v.id, v.name, v.description, v.price, v.slug,
               c.name AS category,
               d.name AS dealer_name,
               d.location AS dealer_location,
               vs.feature, vs.value
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN listings l ON v.id = l.vehicle_id
        LEFT JOIN dealers d ON l.dealer_id = d.id
        LEFT JOIN vehicle_specs vs ON v.id = vs.vehicle_id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;

    const result = await db.query(query, [identifier]);

    if (result.rows.length === 0) return {};

    return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        price: result.rows[0].price,
        category: result.rows[0].category,
        slug: result.rows[0].slug,
        dealer: result.rows[0].dealer_name,
        location: result.rows[0].dealer_location,
        specs: result.rows
            .filter(row => row.feature !== null)   // Filter out rows without specs
            .map(row => ({
                feature: row.feature,
                value: row.value
            }))
    };
};

const getAllVehicles = () => getVehicles();

const getVehiclesByCategory = (category) => getVehicles(category);

const getVehicleById = (id, sortBy) =>
    getVehicleDetail(id, 'id', sortBy);

const getVehicleBySlug = (slug, sortBy) =>
    getVehicleDetail(slug, 'slug', sortBy);

export {
    getAllVehicles,
    getVehiclesByCategory,
    getVehicleById,
    getVehicleBySlug
};