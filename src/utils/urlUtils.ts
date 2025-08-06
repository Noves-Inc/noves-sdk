// src/utils/urlUtils.ts

import { PageOptions } from '../types/common';

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

    // Add default sort parameter if not provided
    if (params.sort === undefined) {
      queryParams.append('sort', 'desc');
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
        'pageSize',
        'viewAsTransactionSender',
        'v5Format',
        'numberOfEpochs',
        'includePrices',
        'excludeZeroPrices',
        'ignoreTransactions',
        'pageKey',
        'pageNumber',
        'ascending'
      ];
    
      keys.forEach(key => {
        const value = url.searchParams.get(key);
        if (value !== null) {
          if (key === 'sort') {
            params[key] = value as 'desc' | 'asc';
          } else if (key === 'liveData' || key === 'v5Format' || key === 'includePrices' || key === 'excludeZeroPrices' || key === 'ascending') {
            (params as any)[key] = value === 'true';
          } else if (key === 'viewAsAccountAddress' || key === 'ignoreTransactions' || key === 'pageKey') {
            params[key] = value;
          } else {
            // For numeric fields
            (params as any)[key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      });

    return params;
}