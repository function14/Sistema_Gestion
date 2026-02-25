function paginate(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr);
}

module.exports = { paginate, parseDate };
