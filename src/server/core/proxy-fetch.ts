import { getAuthToken } from './auth';
import { getConfig } from './config';

export function proxyFetch(
  url: string,
  options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
) {
  const config = getConfig();
  const token = getAuthToken();

  const response = UrlFetchApp.fetch(`${config.gandalf}/proxy`, {
    headers: {
      'x-proxy-url': url,
      Authorization: `Bearer ${token}`,
    },
    contentType: 'application/json',
    ...options,
  });

  return JSON.parse(response.getContentText());
}
