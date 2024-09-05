module.exports.pagination = (data) => {
    const total_perpage = data.per_page || 10
    const total_page = Math.ceil(data.count / total_perpage);
    const current_page = parseInt(data.page) || 1
    const previous_page = current_page == 1 ? null : current_page - 1;
    const next_page = current_page == total_page ? null : parseInt(current_page) + 1;

    const result = {
        data: data.data,
        pagination: {
            total_records: data.count,
            total_perpage: total_perpage,
            total_page,
            current_page,
            next_page,
            previous_page
        }
    };
    return result;
}

module.exports.getPagination = (page, size) => {
    let ppage = 0;
    if (size && typeof size === 'string') {
        size = parseInt(size, 10);
    }
    if (page && typeof page === 'string') {
        ppage = parseInt(page, 10) - 1;
    }
    const limit = size ? + size : 10 || 10;
    const offset = ppage ? ppage * limit : 0 || 0;
    return { limit, offset }
}