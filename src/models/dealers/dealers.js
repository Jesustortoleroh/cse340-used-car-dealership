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

export { getSortedDealers, getDealerBySlug };
