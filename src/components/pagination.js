import { getPages } from "../lib/utils.js";

export function initPagination({ pages, fromRow, toRow, totalRows }, createPage) {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    let pageCount = 1;
    let currentPage = 1;
    let currentLimit = 10;

    function applyPagination(query, state, action) {
        const limit = Number.isInteger(state.rowsPerPage) && state.rowsPerPage > 0
            ? state.rowsPerPage
            : 10;

        if (limit !== currentLimit) {
            currentPage = 1;
        } else {
            switch (action?.name) {
                case "first":
                    currentPage = 1;
                    break;
                case "prev":
                    currentPage -= 1;
                    break;
                case "next":
                    currentPage += 1;
                    break;
                case "last":
                    currentPage = pageCount;
                    break;
                case "page":
                    currentPage = Number(action.value);
                    break;
                default:
                    currentPage = 1;
            }
        }

        currentLimit = limit;
        currentPage = Math.min(
            Math.max(Number.isInteger(currentPage) ? currentPage : 1, 1),
            pageCount,
        );

        return {
            ...query,
            limit,
            page: currentPage,
        };
    }

    function updatePagination(total, { page, limit }) {
        pageCount = Math.max(1, Math.ceil(total / limit));
        currentPage = Math.min(Math.max(page, 1), pageCount);
        currentLimit = limit;

        const visiblePages = getPages(currentPage, pageCount, 5);

        pages.replaceChildren(
            ...visiblePages.map((pageNumber) =>
                createPage(
                    pageTemplate.cloneNode(true),
                    pageNumber,
                    pageNumber === currentPage,
                ),
            ),
        );

        fromRow.textContent = total
            ? (currentPage - 1) * limit + 1
            : 0;

        toRow.textContent = Math.min(currentPage * limit, total);
        totalRows.textContent = total;
    }

    return {
        applyPagination,
        updatePagination,
    };
}
