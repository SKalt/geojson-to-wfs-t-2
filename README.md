# geojson-to-wfst-2

A library to create string Web Feature Service XML from geojson.  As a string
formatting library, `geojson-to-wfst-2` has no dependencies and will work in
any environment.

## Installation
get the library by executing `npm install geojson-to-wfst-2` or

```
git clone https://github.com/SKalt/geojson-to-wfs-t-2.git [target-destination]
```

and `import/require`-ing the commonjs or es6 module scripts.

## Usage

```{javascript}
let wfs =  import 'geojson-to-wfst-2';
// or require('geojson-to-wfst-2') if import is unavailable.
// this is equivalent to:
let {Insert, Update, Replace, Delete, Transaction} = import 'geojson-to-wfst-2'
// check it:
const assert = require('assert')
assert.deepEqual(wfs, {Insert, Update, Replace, Delete, Transaction})
```
See [API.md](./API.md) for the api documentation.

## Contributing

Features and refactors are welcome. To contribute, branch or fork this repo,
optionally open an issue, and then open a pull request.  Please include tests
and well-commented commits in all work.

Here's an example script to start developing a feature on this project:
```
git clone https://github.com/SKalt/geojson-to-wfs-t-2.git # or your fork
cd geojson-to-wfs-t-2
git checkout -b informative-feature-branch
npm install
```