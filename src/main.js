import "./fonts/ys-display/fonts.css";
import "./style.css";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// API для получения данных с сервера
const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = Number.parseInt(state.rowsPerPage, 10);
    const page = Number.parseInt(state.page ?? 1, 10);

    return {
        ...state,
        rowsPerPage,
        page,
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */

let renderVersion = 0;

async function render(action) {
    const version = ++renderVersion;
    const state = collectState();

    let query = {};

    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    try {
        let { total, items } = await api.getRecords(query);

        if (version !== renderVersion) {
            return;
        }

        const pageCount = Math.max(
            1,
            Math.ceil(total / query.limit),
        );

        if (query.page > pageCount) {
            query = {
                ...query,
                page: pageCount,
            };

            ({ total, items } = await api.getRecords(query));

            if (version !== renderVersion) {
                return;
            }
        }

        updatePagination(total, query);
        sampleTable.render(items);
    } catch (error) {
        if (version !== renderVersion) {
            return;
        }

        console.error("Не удалось загрузить данные таблицы:", error);
        sampleTable.render([]);
        updatePagination(0, { ...query, page: 1 });
    }
}


const sampleTable = initTable(
    {
        tableTemplate: "table",
        rowTemplate: "row",
        before: ["search", "header", "filter"],
        after: ["pagination"],
    },
    render,
);

const applySearching = initSearching("search");

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal,
]);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (element, page, isCurrent) => {
        const input = element.querySelector("input");
        const label = element.querySelector("span");

        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        element.setAttribute("aria-label", `Goto page ${page}`);

        return element;
    },
);

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

async function init() {
    try {
        const indexes = await api.getIndexes();
        updateIndexes(sampleTable.filter.elements, { searchBySeller: indexes.sellers });
        await render();
    } catch (error) {
        console.error("Не удалось инициализировать таблицу:", error);
    }
}

init();
