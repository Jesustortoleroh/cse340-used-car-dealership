import db from '../db.js';

const getSortedDealers = async (sortBy = 'name') => {
  const orderBy =
    sortBy === 'location'
      ? 'location'
      : 'name';

  const result = await db.query(`
    SELECT id, name, location, phone, email, slug
    FROM dealers
    ORDER BY ${orderBy}
  `);

  return result.rows;
};

const getDealerBySlug = async (slug) => {
  const result = await db.query(
    'SELECT * FROM dealers WHERE slug = $1',
    [slug]
  );

  return result.rows[0] || {};
};

export { getSortedDealers, getDealerBySlug };
