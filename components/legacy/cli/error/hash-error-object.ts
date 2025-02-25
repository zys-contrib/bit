import hash from 'object-hash';
import yn from 'yn';
import { getConfig } from '@teambit/config-store';
import { CFG_ANALYTICS_ANONYMOUS_KEY } from '@teambit/legacy.constants';
import { logger } from '@teambit/legacy.logger';
import cloneErrorObject, { systemFields } from './clone-error-object';

export function hashErrorIfNeeded(error: Error) {
  let clonedError = error;
  try {
    clonedError = cloneErrorObject(error);
  } catch {
    logger.warn('could not clone error', error);
  }

  const shouldHash = yn(getConfig(CFG_ANALYTICS_ANONYMOUS_KEY), { default: true });
  if (!shouldHash) return clonedError;
  const fields = Object.getOwnPropertyNames(clonedError);
  const fieldToHash = fields.filter((field) => !systemFields.includes(field) && field !== 'message');
  if (!fieldToHash.length) return clonedError;

  fieldToHash.forEach((field) => {
    try {
      clonedError[field] = hashValue(clonedError[field]);
    } catch {
      logger.debug(`could not hash field ${field}`);
    }
  });

  return clonedError;
}

function hashValue(value: any): string {
  if (!value) return value;
  const type = typeof value;
  switch (type) {
    case 'undefined':
    case 'number':
    case 'boolean':
      return value;
    case 'object':
      // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
      if (Array.isArray(value)) return value.map((v) => hash(v));
      // ignoreUnknown helps to not throw error for some errors with custom props.
      return hash(value, { ignoreUnknown: true });
    default:
      return hash(value);
  }
}
