// src/utils/urlUtils.ts

import { PageOptions } from '../types/types';

export function constructUrl(endpoint: string, params?: PageOptions): string {
    if (!params || Object.keys(params).length === 0) {
        return endpoint;
    }
    const queryParams = new URLSearchParams();

    (Object.keys(params) as Array<keyof PageOptions>).forEach(key => {
      const value = params[key];
      if (value !== undefined) {
          queryParams.append(key, value.toString());
      }
    });

    if (params.sort === undefined) {
      params.sort = 'desc';
    }

    const queryString = queryParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
}

export function parseUrl(urlString: string): PageOptions {
    // Add a base URL for relative URLs
    const baseUrl = 'https://translate.noves.fi';
    const fullUrl = urlString.startsWith('http') ? urlString : `${baseUrl}${urlString}`;
    const url = new URL(fullUrl);
    const params: PageOptions = {};

    const keys: Array<keyof PageOptions> = [
        'startBlock',
        'endBlock',
        'startTimestamp',
        'endTimestamp',
        'sort',
        'viewAsAccountAddress',
        'liveData',
        'ignoreTransactions',
        'pageNumber'
      ];
    
      keys.forEach(key => {
        const value = url.searchParams.get(key === 'pageNumber' ? 'page' : key);
        if (value !== null) {
          if (key === 'sort') {
            params[key] = value as 'desc' | 'asc';
          } else if (key === 'liveData') {
            params[key] = (value === 'true') as any;
          } else if (key === 'viewAsAccountAddress' || key === 'ignoreTransactions') {
            params[key] = value;
          } else {
            params[key] = isNaN(Number(value)) ? (value as any) : Number(value);
          }
        }
      });

    return params;
}