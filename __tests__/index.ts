import byNodeEnv from '../src';

test('adds 1 + 2 to equal 3', () => {
  byNodeEnv();
  expect(1 + 2).toBe(3);
});
