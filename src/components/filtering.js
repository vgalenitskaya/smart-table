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

    function applyFiltering(query, state, action) {
        if (action?.name === "clear") {
            const field = action.dataset.field;

            Object.values(elements).forEach((element) => {
                if (element.name === field) {
                    element.value = "";
                    state[field] = "";
                }
            });
        }

        const filters = {};

        Object.values(elements).forEach((element) => {
            if (!["INPUT", "SELECT"].includes(element.tagName)) {
                return;
            }

            const field = element.name;
            const value = state[field]?.trim();

            if (field && value) {
                filters[`filter[${field}]`] = value;
            }
        });

        return { ...query, ...filters };
    }

    return { updateIndexes, applyFiltering };
}
