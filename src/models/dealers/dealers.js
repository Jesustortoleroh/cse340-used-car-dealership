import db from '../db.js';

const getSortedDealers = async (sortBy = 'name') => {
  const allowedSorts = ['name', 'location'];

  const orderBy = allowedSorts.includes(sortBy)
    ? sortBy
    : 'name';

  const result = await db.query(`
    SELECT
      id,
      name,
      location,
      phone,
      email,
      slug, 
      image_url
    FROM dealers
    ORDER BY ${orderBy}
  `);

  return result.rows;
};

const getDealerBySlug = async (slug) => {
  const result = await db.query(
    `
    SELECT *
    FROM dealers
    WHERE slug = $1
    `,
    [slug]
  );

  return result.rows[0] || null;
};

/**
 * Get all vehicles associated with a dealer by dealer ID
 * Returns vehicles with category and primary image
 * Supports optional sorting
 */
const getVehiclesByDealerId = async (dealerId, sort = 'name_asc') => {
  // Build ORDER BY clause based on sort parameter
  let orderByClause;
  switch (sort) {
    case 'price_asc':
      orderByClause = 'v.price ASC';
      break;
    case 'price_desc':
      orderByClause = 'v.price DESC';
      break;
    case 'name_desc':
      orderByClause = 'v.name DESC';
      break;
    case 'newest':
      orderByClause = 'v.id DESC'; // Using id as proxy for newest
      break;
    case 'name_asc':
    default:
      orderByClause = 'v.name ASC';
      break;
  }

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
    JOIN listings l ON l.vehicle_id = v.id
    JOIN categories c ON v.category_id = c.id
    LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = true
    WHERE l.dealer_id = $1
    ORDER BY ${orderByClause}
  `;

  const result = await db.query(query, [dealerId]);
  return result.rows;
};

export { 
  getSortedDealers, 
  getDealerBySlug,
  getVehiclesByDealerId  
};
