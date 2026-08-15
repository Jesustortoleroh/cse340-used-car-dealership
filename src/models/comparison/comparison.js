import db from '../db.js';

/**
 * Get vehicle by ID for comparison
 */
const getVehicleForComparison = async (vehicleId) => {
    const query = `
        SELECT 
            v.id,
            v.name,
            v.slug,
            v.price,
            v.year,
            v.mileage,
            v.transmission,
            v.fuel_type,
            v.color,
            v.description,
            c.name AS category_name,
            vi.image_url,
            (
                SELECT json_agg(
                    json_build_object(
                        'feature', vs.feature,
                        'value', vs.value
                    )
                )
                FROM vehicle_specs vs
                WHERE vs.vehicle_id = v.id
            ) AS specs
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = true
        WHERE v.id = $1
    `;

    const result = await db.query(query, [vehicleId]);
    return result.rows[0] || null;
};

/**
 * Get all vehicles for comparison dropdown
 */
const getAllVehiclesForComparison = async () => {
    const query = `
        SELECT 
            id,
            name,
            slug,
            price,
            year
        FROM vehicles
        ORDER BY name ASC
    `;

    const result = await db.query(query);
    return result.rows;
};

/**
 * Compare multiple vehicles
 */
const compareVehicles = async (vehicleIds) => {
    if (!vehicleIds || vehicleIds.length < 2) {
        return [];
    }

    const placeholders = vehicleIds.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
        SELECT 
            v.id,
            v.name,
            v.slug,
            v.price,
            v.year,
            v.mileage,
            v.transmission,
            v.fuel_type,
            v.color,
            v.description,
            c.name AS category_name,
            vi.image_url,
            (
                SELECT json_agg(
                    json_build_object(
                        'feature', vs.feature,
                        'value', vs.value
                    )
                )
                FROM vehicle_specs vs
                WHERE vs.vehicle_id = v.id
            ) AS specs
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = true
        WHERE v.id IN (${placeholders})
        ORDER BY v.price ASC
    `;

    const result = await db.query(query, vehicleIds);
    return result.rows;
};

export {
    getVehicleForComparison,
    getAllVehiclesForComparison,
    compareVehicles
};