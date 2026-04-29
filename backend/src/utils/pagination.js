function getPagination(query, defaults = {}) {
    const page = Math.max(Number(query.page || defaults.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || defaults.limit || 20), 1), 100);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

function buildPagination(total, page, limit) {
    return {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
    };
}

module.exports = { getPagination, buildPagination };
