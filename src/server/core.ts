import { getNamedRange } from 'utils/get-named-range';
import { getSheetByNameOrFail } from 'utils/get-sheet-by-name-or-fail';

export function getConfig(): string {
  Logger.log('GET_CONFIG');
  const env = getNamedRange(getSheetByNameOrFail('CONFIG'), 'CONFIG_ENV');
  Logger.log(`GET_CONFIG:${env}`);

  return env;
}
