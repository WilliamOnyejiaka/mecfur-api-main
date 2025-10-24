
export default function pagination(page: number, limit: number, totalRecords: number) {
    const totalPages = Math.ceil(totalRecords / limit);

    return {
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalPages,
        totalRecords,
    };
}