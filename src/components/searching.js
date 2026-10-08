export function initSearching(searchField) {
    return function applySearching(query, state) {
        return state[searchField] ? { ...query, search: state[searchField] } : query;
    };
}
