function parseImages(car) {
  if (!car) return car;
  return {
    ...car,
    images: car.images ? JSON.parse(car.images) : []
  };
}

function formatCar(car) {
  const parsed = parseImages(car);
  return {
    ...parsed,
    desc: parsed.description || `${parsed.brand} ${parsed.model}`,
    specs: parsed.engine
  };
}

function buildCarFilters(query) {
  const conditions = [];
  const params = [];

  if (query.search && query.search.length >= 2) {
    conditions.push(`(
      LOWER(brand) LIKE ? OR
      LOWER(model) LIKE ? OR
      CAST(year AS TEXT) LIKE ?
    )`);
    const term = `%${query.search.toLowerCase()}%`;
    params.push(term, term, `%${query.search}%`);
  }

  if (query.brand) {
    const brands = String(query.brand).split(',').map(b => b.trim()).filter(Boolean);
    if (brands.length) {
      conditions.push(`brand IN (${brands.map(() => '?').join(',')})`);
      params.push(...brands);
    }
  }

  if (query.maxPrice) {
    conditions.push('price <= ?');
    params.push(Number(query.maxPrice));
  }

  if (query.minPrice) {
    conditions.push('price >= ?');
    params.push(Number(query.minPrice));
  }

  if (query.year) {
    conditions.push('year = ?');
    params.push(Number(query.year));
  }

  if (query.fuel) {
    const fuels = String(query.fuel).split(',').map(f => f.trim()).filter(Boolean);
    if (fuels.length) {
      conditions.push(`fuel IN (${fuels.map(() => '?').join(',')})`);
      params.push(...fuels);
    }
  }

  if (query.transmission) {
    const map = { auto: 'Автомат', manual: 'Механика' };
    const value = map[query.transmission] || query.transmission;
    conditions.push('transmission = ?');
    params.push(value);
  }

  if (query.status) {
    conditions.push('status = ?');
    params.push(query.status);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

function buildSort(sort) {
  switch (sort) {
    case 'price_asc': return 'ORDER BY price ASC';
    case 'price_desc': return 'ORDER BY price DESC';
    case 'year_desc': return 'ORDER BY year DESC';
    default: return 'ORDER BY id DESC';
  }
}

module.exports = { formatCar, buildCarFilters, buildSort };