import { InjectionToken } from '@angular/core';

/** Empty string in production (same origin). `http://localhost:3000` when serving the BFF locally. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
