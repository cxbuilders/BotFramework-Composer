// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import lowerCase from 'lodash/lowerCase';

export const parseDeepLinkUrl = deeplinkUrl => {
  const convertedUrl = new URL(deeplinkUrl);
  const action = lowerCase(convertedUrl.hostname);
  switch (action) {
    case 'open': {
      const encodedUrl: string = convertedUrl.searchParams.get('url') || '';
      return decodeURIComponent(encodedUrl);
    }

    case 'create': {
      const encodedUrl: string = convertedUrl.search;
      const decoded = decodeURIComponent(encodedUrl);
      return `${convertedUrl.pathname}?${decoded}`;
    }

    default:
      return '';
  }
};
