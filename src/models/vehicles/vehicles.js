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
        SELECT
            v.id,
            v.name,
            v.slug,
            v.description,
            v.price,
            c.name AS category,
            vi.image_url
        FROM vehicles v
        JOIN categories c
            ON v.category_id = c.id
        LEFT JOIN vehicle_images vi
            ON vi.vehicle_id = v.id
            AND vi.is_primary = true
        ${whereClause}
        ORDER BY ${orderByClause}
    `;

    const params = category ? [category] : [];

    const result = await db.query(query, params);

    return result.rows;
};

/**
 * Get vehicle by slug
 */
const getVehicleBySlug = async (slug, sort = 'feature') => {
    const query = `
        SELECT
            v.id,
            v.name,
            v.slug,
            v.description,
            v.price,
            c.name AS category,
            d.name AS dealer,
            d.location,
            vi.image_url
        FROM vehicles v
        JOIN categories c
            ON v.category_id = c.id
        LEFT JOIN listings l
            ON l.vehicle_id = v.id
        LEFT JOIN dealers d
            ON d.id = l.dealer_id
        LEFT JOIN vehicle_images vi
            ON vi.vehicle_id = v.id
            AND vi.is_primary = true
        WHERE v.slug = $1
    `;

    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
        return null;
    }

    const vehicle = result.rows[0];

    const orderBy =
        sort === 'value'
            ? 'value'
            : 'feature';

    const specsResult = await db.query(
        `
        SELECT feature, value
        FROM vehicle_specs
        WHERE vehicle_id = $1
        ORDER BY ${orderBy}
        `,
        [vehicle.id]
    );

    vehicle.specs = specsResult.rows;

    return vehicle;
};

/**
 * Get all vehicles
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

export {
    getAllVehicles,
    getVehiclesByCategory,
    getVehicleBySlug
};