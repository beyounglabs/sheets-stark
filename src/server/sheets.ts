import { getConfig } from './core';

export const getSheetsData = () => {
  const config = getConfig();

  Logger.log(`DATA:${config}`);

  return config;
};
