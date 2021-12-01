import { SheetForm } from 'utils/sheet-form';
import { getEnv } from './env';

const FIELDS = ['gandalf', 'mystique', 'stark', 'user', 'password'] as const;

let cache: Record<string, Record<typeof FIELDS[number], string>> = {};

export function getConfig() {
  const env = getEnv();

  const range =
    env === 'Staging'
      ? 'CONFIG_STAGING'
      : env === 'Produção'
      ? 'CONFIG_PRODUCTION'
      : null;

  if (range == null) {
    throw new Error('Selecione um ambiente');
  }

  if (env in cache) {
    return cache[env];
  }

  const config = new SheetForm({
    sheet: 'CONFIG',
    fields: FIELDS,
    range: range,
  });

  const values = config.values();

  return (cache[env] = values);
}
