import { describe, it, expect } from 'vitest';
import { webSearch } from './index';

describe('webSearch tool', () => {
  it('should be a function', () => {
    expect(typeof webSearch).toBe('function');
  });

  it('should return a tool object', () => {
    const tool = webSearch();
    expect(typeof tool).toBe('object');
    expect(tool).toHaveProperty('description');
    expect(tool).toHaveProperty('inputSchema');
    expect(tool).toHaveProperty('execute');
  });
});
