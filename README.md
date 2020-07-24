# graphql-compose-dataloader-new

[![Greenkeeper badge](https://badges.greenkeeper.io/stoffern/graphql-compose-dataloader-new.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/stoffern/graphql-compose-dataloader-new.svg)]()
[![npm version](https://img.shields.io/npm/v/graphql-compose-dataloader-new.svg?style=flat-square)](https://www.npmjs.com/package/graphql-compose-dataloader-new)
[![npm](https://img.shields.io/npm/dt/graphql-compose-dataloader-new.svg)](https://www.npmjs.com/package/graphql-compose-dataloader-new)

Add DataLoader to graphql-composer resolvers.

### Installation

```
npm install graphql-compose-dataloader-new --save
```

Modules `graphql`, `graphql-compose` are in `peerDependencies`, so should be installed explicitly in your app. They have global objects and should not have ability to be installed as submodule.

### Example

```js
import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader-new';

const LanguagesSchema = new mongoose.Schema({
  language: String,
  skill: {
    type: String,
    enum: ['basic', 'fluent', 'native'],
  },
});

const Languages = mongoose.model('Languages', LanguagesSchema);
const LanguagesTC = composeWithDataLoader(composeWithMongoose(Languages), {
  cacheExpiration: 700,
});
```

#### Props

| Prop                   | Type      | Description                                                                                                   |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| **`cacheExpiration`**  | `number`  | Expiration in number of milliseconds. This will clear the one request sendt via the resolver (_Default: 500_) |
| **`removeProjection`** | `boolean` | Remove projection, this will request fields on the requested document and put it to cache (_Default: true_)   |
| **`debug`**            | `boolean` | Enable debug? (_Default: false_)                                                                              |
| **`cache`**            | `boolean` | Enable cache? (_Default: false_)                                                                              |

### License

=======
[MIT](https://github.com/nodkz/graphql-compose-mongoose/blob/master/LICENSE.md)
