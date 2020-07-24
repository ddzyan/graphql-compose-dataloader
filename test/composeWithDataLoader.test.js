import { expect } from 'chai';
import { TypeComposer } from 'graphql-compose';
import { composeWithDataLoader } from '../lib/composeWithDataLoader';
import { userTypeComposer } from './mock/userTypeComposer';

describe('composeWithDataLoader', () => {
  const userComposer = composeWithDataLoader(userTypeComposer);

  describe('basic checks', () => {
    it('should return TypeComposer', () => {
      expect(userComposer).instanceof(TypeComposer);
    });
  });
});
