import { getConfig } from './config';

let TOKEN: string;

export function getAuthToken(): string {
  if (TOKEN) {
    return TOKEN;
  }

  const config = getConfig();

  try {
    const response = UrlFetchApp.fetch(`${config.gandalf}/auth/login`, {
      method: 'post',
      muteHttpExceptions: true,
      contentType: 'application/json',
      payload: JSON.stringify({
        aggregator: 'SYSTEM',
        email: config.user,
        password: config.password,
      }),
    });

    Logger.log(response.getContentText());
    console.log(response);

    const data = JSON.parse(response.getContentText());

    return (TOKEN = data.token);
  } catch (e) {
    Logger.log(e);
    throw new Error('Erro ao autenticar');
  }
}
