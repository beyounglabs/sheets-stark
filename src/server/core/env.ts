import { getNamedRange } from 'utils/get-named-range';
import { getSheetByNameOrFail } from 'utils/get-sheet-by-name-or-fail';

const ENV = ['Staging', 'Produção'] as const;

export type Env = typeof ENV[number];

export function getEnv(): Env {
  return (getNamedRange(
    getSheetByNameOrFail('CONFIG'),
    'CONFIG_ENV'
  ).getValue() as any) as Env;
}

export function setEnv(env: Env) {
  const range = getNamedRange(getSheetByNameOrFail('CONFIG'), 'CONFIG_ENV');

  range.setValue(env as any);
}
