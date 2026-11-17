import db from '../db.js';

/**
 * Get all vehicles with category information
 */
const getVehicles = async (category = null, sortBy = 'price') => {
    const whereClause = category ? 'WHERE LOWER(c.name) = LOWER($1)' : '';

    const orderByClause = sortBy === 'name' ? 'v.name' : 'v.price';

    const query = `
        SELECT
            v.id,
            v.name,
            v.slug,
            v.description,
            v.price,
            v.year,
            v.mileage,
            v.vin,
            v.condition,
            v.inspection_notes,
            v.service_history,
            v.available,
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
 * Search vehicles by name, category, or description
 */
const searchVehicles = async (searchTerm, category = null, sortBy = 'price') => {
    // Build WHERE clause for search
    let whereClause = `
        WHERE 
            LOWER(v.name) LIKE LOWER($1)
            OR LOWER(v.description) LIKE LOWER($1)
    `;

    const params = [`%${searchTerm}%`];

    // Add category filter if provided
    if (category && category !== 'All' && category !== 'all') {
        // Use params.length + 1 to dynamically get the next placeholder index
        const nextIndex = params.length + 1;
        whereClause += ` AND LOWER(c.name) = LOWER($${nextIndex})`;
        params.push(category);
    }

    const orderByClause = sortBy === 'name' ? 'v.name' : 'v.price';

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
            v.year,
            v.mileage,
            v.vin,
            v.condition,
            v.inspection_notes,
            v.service_history,
            v.available,
            c.name AS category,
            d.name AS dealer,
            d.slug AS dealer_slug,
            d.location,
            vi.image_url
        FROM vehicles v
        JOIN categories c
            ON v.category_id = c.id
        LEFT JOIN LATERAL (
            SELECT dealer.name, dealer.slug, dealer.location
            FROM listings listing
            JOIN dealers dealer ON dealer.id = listing.dealer_id
            WHERE listing.vehicle_id = v.id
            ORDER BY listing.created_at DESC
            LIMIT 1
        ) d ON true
        LEFT JOIN LATERAL (
            SELECT image_url
            FROM vehicle_images
            WHERE vehicle_id = v.id AND is_primary = true
            ORDER BY id
            LIMIT 1
        ) vi ON true
        WHERE v.slug = $1
    `;

    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
        return null;
    }

    const vehicle = result.rows[0];

    const orderBy = sort === 'value' ? 'value' : 'feature';

    const specsResult = await db.query(
        `
            SELECT
                feature,
                value
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
 * Get vehicle by ID
 */
const getVehicleById = async (vehicleId) => {
    const query = `
        SELECT
            id,
            name,
            slug,
            description,
            price
        FROM vehicles
        WHERE id = $1
    `;

    const result = await db.query(query, [vehicleId]);

    return result.rows[0] || null;
};

const createTestDriveRequest = async (
    userId,
    vehicleId,
    preferredDate,
    preferredTime,
    description
) => {
    const result = await db.query(
        `
            INSERT INTO service_requests (
                user_id, service_type_id, vehicle_id, description, preferred_date, preferred_time
            )
            SELECT $1, st.id, v.id, $3, $4, $5
            FROM service_types st
            JOIN vehicles v ON v.id = $2
            WHERE st.name = 'Test Drive' AND v.available = true
            RETURNING *
        `,
        [userId, vehicleId, description, preferredDate, preferredTime]
    );

    return result.rows[0] || null;
};

const updateVehicleTrustDetails = async (slug, { vin, inspectionNotes, serviceHistory }) => {
    const result = await db.query(
        `
            UPDATE vehicles
            SET vin = NULLIF($2, ''),
                inspection_notes = NULLIF($3, ''),
                service_history = NULLIF($4, ''),
                updated_at = CURRENT_TIMESTAMP
            WHERE slug = $1
            RETURNING id
        `,
        [slug, vin, inspectionNotes, serviceHistory]
    );

    return result.rows[0] || null;
};

/**
 * Get all vehicles
 */
const getAllVehicles = async () => {
    return await getVehicles();
};

const getInventoryFilters = async () => {
    const [categoriesResult, dealersResult] = await Promise.all([
        db.query('SELECT name FROM categories ORDER BY name'),
        db.query(`
            SELECT DISTINCT d.name, d.slug
            FROM dealers d
            JOIN listings l ON l.dealer_id = d.id
            JOIN vehicles v ON v.id = l.vehicle_id
            WHERE v.available = true
            ORDER BY d.name
        `)
    ]);

    return {
        categories: categoriesResult.rows,
        dealers: dealersResult.rows
    };
};

const getFilteredVehicles = async ({
    search,
    category,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    dealer,
    sort,
    limit,
    page
}) => {
    const conditions = ['v.available = true'];
    const params = [];
    const addCondition = (sql, value) => {
        params.push(value);
        conditions.push(sql.replace('?', `$${params.length}`));
    };

    if (search) {
        params.push(`%${search}%`);
        conditions.push(
            `(v.name ILIKE $${params.length} OR v.description ILIKE $${params.length} OR v.vin ILIKE $${params.length})`
        );
    }
    if (category) {
        addCondition('LOWER(c.name) = LOWER(?)', category);
    }
    if (minPrice !== null) {
        addCondition('v.price >= ?', minPrice);
    }
    if (maxPrice !== null) {
        addCondition('v.price <= ?', maxPrice);
    }
    if (minYear !== null) {
        addCondition('v.year >= ?', minYear);
    }
    if (maxYear !== null) {
        addCondition('v.year <= ?', maxYear);
    }
    if (maxMileage !== null) {
        addCondition('v.mileage <= ?', maxMileage);
    }
    if (dealer) {
        addCondition(
            `EXISTS (
                SELECT 1
                FROM listings filtered_listing
                JOIN dealers filtered_dealer ON filtered_dealer.id = filtered_listing.dealer_id
                WHERE filtered_listing.vehicle_id = v.id
                  AND filtered_dealer.slug = ?
            )`,
            dealer
        );
    }

    const whereClause = conditions.join(' AND ');
    const orderBy =
        {
            price_asc: 'v.price ASC, v.id DESC',
            price_desc: 'v.price DESC, v.id DESC',
            year_desc: 'v.year DESC, v.id DESC',
            mileage_asc: 'v.mileage ASC NULLS LAST, v.id DESC',
            name_desc: 'v.name DESC',
            newest: 'v.created_at DESC, v.id DESC',
            name_asc: 'v.name ASC'
        }[sort] || 'v.name ASC';

    const countResult = await db.query(
        `
            SELECT COUNT(*)::int AS total
            FROM vehicles v
            JOIN categories c ON c.id = v.category_id
            WHERE ${whereClause}
        `,
        params
    );

    const total = countResult.rows[0].total;
    const currentPage = Math.min(page, Math.max(Math.ceil(total / limit), 1));
    const listParams = [...params, limit, (currentPage - 1) * limit];
    const vehiclesResult = await db.query(
        `
            SELECT
                v.id, v.name, v.slug, v.description, v.price, v.year, v.mileage,
                v.vin, v.condition, v.inspection_notes, v.service_history,
                c.name AS category,
                d.name AS dealer,
                d.slug AS dealer_slug,
                (
                    SELECT vi.image_url
                    FROM vehicle_images vi
                    WHERE vi.vehicle_id = v.id AND vi.is_primary = true
                    ORDER BY vi.id
                    LIMIT 1
                ) AS image_url,
                (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.vehicle_id = v.id) AS average_rating,
                (SELECT COUNT(*)::int FROM reviews r WHERE r.vehicle_id = v.id) AS review_count
            FROM vehicles v
            JOIN categories c ON c.id = v.category_id
            LEFT JOIN LATERAL (
                SELECT dealer.name, dealer.slug
                FROM listings listing
                JOIN dealers dealer ON dealer.id = listing.dealer_id
                WHERE listing.vehicle_id = v.id
                ORDER BY listing.created_at DESC
                LIMIT 1
            ) d ON true
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${listParams.length - 1}
            OFFSET $${listParams.length}
        `,
        listParams
    );

    return { vehicles: vehiclesResult.rows, total, page: currentPage };
};

const getHomePageData = async () => {
    const [vehiclesResult, statsResult, dealerResult] = await Promise.all([
        db.query(`
            SELECT v.id, v.name, v.slug, v.price, v.year,
                (SELECT vi.image_url FROM vehicle_images vi
                 WHERE vi.vehicle_id = v.id AND vi.is_primary = true
                 ORDER BY vi.id LIMIT 1) AS image_url
            FROM vehicles v
            WHERE v.available = true
              AND (v.featured = true OR NOT EXISTS (
                  SELECT 1 FROM vehicles featured
                  WHERE featured.available = true AND featured.featured = true
              ))
            ORDER BY v.featured DESC, v.created_at DESC
            LIMIT 4
        `),
        db.query(`
            SELECT
                (SELECT COUNT(*)::int FROM vehicles WHERE available = true) AS vehicles,
                (SELECT COUNT(*)::int FROM dealers) AS dealers,
                (SELECT COUNT(*)::int FROM categories) AS categories,
                (SELECT COUNT(*)::int FROM service_types) AS services
        `),
        db.query(`
            SELECT name, location, slug
            FROM dealers
            WHERE is_featured = true
            ORDER BY rating DESC, name
            LIMIT 1
        `)
    ]);

    return {
        vehicles: vehiclesResult.rows,
        stats: statsResult.rows[0],
        dealer: dealerResult.rows[0] || null
    };
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
    getVehicleBySlug,
    getVehicleById,
    searchVehicles,
    getInventoryFilters,
    getFilteredVehicles,
    getHomePageData,
    createTestDriveRequest,
    updateVehicleTrustDetails
};
