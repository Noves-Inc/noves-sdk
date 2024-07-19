// src/utils/urlUtils.ts

import { PageOptions } from '../types/types';

export function constructUrl(baseUrl: string, params?: PageOptions): string {
    if (!params) {
        return baseUrl;
    }

    const url = new URL(baseUrl);
    (Object.keys(params) as Array<keyof PageOptions>).forEach(key => {
        const value = params[key];
        if (value !== undefined) {
            url.searchParams.append(key, value.toString());
        }
    });

    return url.toString();
}

export function parseUrl(urlString: string): PageOptions {
    const url = new URL(urlString);
    const params: PageOptions = {};

    url.searchParams.forEach((value, key) => {
        if (key in params) {
            params[key as keyof PageOptions] = value as any;
        }
    });

    return params;
}
