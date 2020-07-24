import { TypeComposer } from 'graphql-compose';
import DataLoader from 'dataloader';
import md5 from 'md5';
import { dataloaderOptions } from './definitions';

export function composeWithDataLoader(
  typeComposer: TypeComposer,
  options: dataloaderOptions = {}
): TypeComposer {
  // if (!(typeComposer instanceof TypeComposer)) {
  //   throw new Error('You should provide TypeComposer instance to composeWithDataLoader method');
  // }
  //
  //
  /**
   * Set defaults
   */
  options = {
    cacheExpiration: options.cacheExpiration || 300,
    removeProjection: options.removeProjection || true,
    debug: options.debug || false,
    cache: options.cache || false,
  };

  /**
   * Add DataLoader to FindById
   */
  let findByIdResolver = typeComposer.get('$findById');
  let findByIdLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (findById)');
        resolve(resolveParamsArray.map(rp => findByIdResolver.resolve(rp)));
      }),
    {
      cacheKeyFn: key => {
        let newKey = getHashKey(key);
        return newKey;
      },
      cache: options.cache,
    }
  );

  typeComposer.setResolver(
    'findById',
    findByIdResolver.wrapResolve(next => rp => {
      const { cacheExpiration, cache, removeProjection } = options;
      if (removeProjection) delete rp.projection;
      if (cacheExpiration > 0 && cache) {
        setTimeout(() => {
          findByIdsLoader.clear(rp);
        }, cacheExpiration);
      }
      return findByIdLoader.load(rp);
    })
  );

  /**
   * Add DataLoader to FindByIds
   */
  let findByIdsResolver = typeComposer.get('$findByIds');
  // 实例提供load,loadMany两个方法，分别为立即执行和批量执行
  let findByIdsLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (findByIds)');
        resolve(resolveParamsArray.map(rp => findByIdResolver.resolve(rp)));
      }),
    {
      cacheKeyFn: key => getHashKey(key),
      cache: options.cache,
    }
  );

  typeComposer.setResolver(
    'findByIds',
    findByIdsResolver.wrapResolve(fn => rp => {
      const { cacheExpiration, cache } = options;
      if (cacheExpiration > 0 && cache) {
        setTimeout(() => {
          findByIdsLoader.clear(rp);
        }, cacheExpiration);
      }
      // 修改为调用loadMany，安排调度任务，来统一执行同一个eventLoop任务
      return findByIdsLoader.loadMany(rp);
    })
  );

  /**
   * Add DataLoader to Count
   */
  let countResolver = typeComposer.get('$count');
  let countLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (count)');
        resolve(resolveParamsArray.map(rp => countResolver.resolve(rp)));
      }),
    { cacheKeyFn: key => getHashKey(key) }
  );

  typeComposer.setResolver(
    'count',
    countResolver.wrapResolve(fn => rp => {
      setTimeout(() => {
        let res = countLoader.clear(rp);
      }, options.cacheExpiration);
      return countLoader.load(rp);
    })
  );

  /**
   * Add DataLoader to FindOne
   */
  let findOneResolver = typeComposer.get('$findOne');
  let findOneLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (findOne)');
        resolve(resolveParamsArray.map(rp => findOneResolver.resolve(rp)));
      }),
    { cacheKeyFn: key => getHashKey(key) }
  );

  typeComposer.setResolver(
    'findOne',
    findOneResolver.wrapResolve(fn => rp => {
      setTimeout(() => {
        let res = findOneLoader.clear(rp);
      }, options.cacheExpiration);
      return findOneLoader.load(rp);
    })
  );

  /**
   * Add DataLoader to FindMany
   */
  let findManyResolver = typeComposer.get('$findMany');
  let findManyLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (findMany)');
        resolve(resolveParamsArray.map(rp => findManyResolver.resolve(rp)));
      }),
    { cacheKeyFn: key => getHashKey(key) }
  );

  typeComposer.setResolver(
    'findMany',
    findManyResolver.wrapResolve(next => rp => {
      if (options.removeProjection) delete rp.projection;
      setTimeout(() => {
        let res = findManyLoader.clear(rp);
      }, options.cacheExpiration);
      return findManyLoader.load(rp);
    })
  );

  /**
   * Add DataLoader to Connection
   */
  let connectionResolver = typeComposer.get('$connection');
  let connectionFieldNames = typeComposer.getFieldNames();
  let connectionLoader = new DataLoader(
    resolveParamsArray =>
      new Promise((resolve, reject) => {
        if (options.debug) console.log('New db request (connection)');
        resolve(resolveParamsArray.map(rp => connectionResolver.resolve(rp)));
      }),
    { cacheKeyFn: key => getHashKey(key) }
  );

  typeComposer.setResolver(
    'connection',
    connectionResolver.wrapResolve(next => rp => {
      if (options.removeProjection) {
        let projection = { edges: { node: {} } };
        connectionFieldNames.map(
          field => (projection.edges.node[field] = true)
        );
        rp.projection = projection;
      }
      setTimeout(() => {
        let res = connectionLoader.clear(rp);
      }, options.cacheExpiration);
      return connectionLoader.load(rp);
    })
  );

  const getHashKey = key => {
    let object = {};
    Object.assign(
      object,
      { args: key.args || {} },
      { projection: key.projection || {} },
      { rawQuery: JSON.stringify(key.rawQuery || {}) },
      { context: JSON.stringify(key.context || {}) }
    );
    let hash = md5(JSON.stringify(object));
    return hash;
  };

  return typeComposer;
}
