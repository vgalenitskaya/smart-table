const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
    let sellers;
    let customers;
    let lastQuery;
    let lastResult;

    async function requestJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
        return response.json();
    }

    async function getIndexes() {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                requestJson(`${BASE_URL}/sellers`),
                requestJson(`${BASE_URL}/customers`),
            ]);
        }
        return { sellers, customers };
    }

    async function getRecords(query, isUpdated = false) {
        await getIndexes();
        const queryString = new URLSearchParams(query).toString();
        if (!isUpdated && lastResult && lastQuery === queryString) return lastResult;

        const records = await requestJson(`${BASE_URL}/records?${queryString}`);
        const result = {
            total: records.total,
            items: records.items.map((item) => ({
                id: item.receipt_id,
                date: item.date,
                seller: sellers[item.seller_id],
                customer: customers[item.customer_id],
                total: item.total_amount,
            })),
        };
        lastQuery = queryString;
        lastResult = result;
        return result;
    }

    return { getIndexes, getRecords };
}
