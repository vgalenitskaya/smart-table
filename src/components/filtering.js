export function initFiltering(elements) {
    function updateIndexes(filterElements, indexes) {
        Object.entries(indexes).forEach(([elementName, values]) => {
            const select = filterElements[elementName];
            if (!select) return;

            select.append(...Object.values(values).map((name) => {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                return option;
            }));
        });
    }

    function applyFiltering(query, state) {
        const filters = {};

        ["date", "customer", "seller"].forEach((field) => {
            const value = state[field]?.trim();
            if (value) {
                filters[`filter[${field}]`] = value;
            }
        });

        const from = state.totalFrom?.trim() ?? "";
        const to = state.totalTo?.trim() ?? "";

        if (from !== "") {
            filters["filter[totalFrom]"] = from;
        }

        if (to !== "") {
            filters["filter[totalTo]"] = to;
        }

        return { ...query, ...filters };
    }

    return { updateIndexes, applyFiltering };
}
