# data-access-weather

HTTP client for Apps weather. Calls the BFF using `@apps/contract-bff` types. Does not call Open-Meteo. Zod parsing lives on the BFF so the weather bundle stays under the 250 kB error budget.
