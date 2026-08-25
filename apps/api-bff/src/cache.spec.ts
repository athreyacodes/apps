import { TtlCache } from './cache';

describe('TtlCache', () => {
  it('returns a value before expiry and misses after', () => {
    let now = 1_000;
    const cache = new TtlCache<string>(() => now);

    cache.set('k', 'v', 100);
    expect(cache.get('k')).toBe('v');

    now = 1_100;
    expect(cache.get('k')).toBeUndefined();
  });
});
