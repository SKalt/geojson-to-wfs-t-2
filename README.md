# geojson-to-wfs-t-2
[![npm version](https://badge.fury.io/js/geojson-to-wfs-t-2.svg)](https://badge.fury.io/js/geojson-to-wfs-t-2)
[![Build Status](https://img.shields.io/travis/SKalt/geojson-to-wfs-t-2/master.svg)](https://travis-ci.org/SKalt/geojson-to-wfs-t-2)


A library to create string Web Feature Service XML from geojson.  As a string formatting library, `geojson-to-wfst-2` has only one dependency and will work in any environment.

## Installation
get the library by executing
```
npm install geojson-to-wfs-t-2
```
or

```
git clone https://github.com/SKalt/geojson-to-wfs-t-2.git
```

and `import/require`-ing es6 or transpiled es5 commonjs, UMD, or es modules from `geojson-to-wfs-t-2/dist/`.

## Usage

```{javascript}
import wfs from 'geojson-to-wfs-t-2';

const nullIsland = {
  type: 'Feature',
  properties: {place_name: 'null island'},
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  }
  id: 'feature_id'
}
const params = {geometry_name: 'geom', layer: 'my_lyr', ns: 'my_namespace'};

// create a stringified transaction inserting null island
wfs.Transaction(
  wfs.Insert(nullIsland, params),
  {
    nsAssignments: {
      my_namespace: 'https://example.com/namespace_defn.xsd'
    }
  }
);

// create a stringified transaction updating null island's name
wfs.Transaction(
  wfs.Update({properties: {place_name: 'not Atlantis'}, id: nullIsland.id }),
  {nsAssignments: ...}
)
// same deal, but deleting it
wfs.Transaction(
  wfs.Delete({id: nullIsland.id}, params),
  {nsAssignments: ...}
)
```
See [API.md](./API.md) for the full API documentation.

#### Further notes:

- While you should make sure to secure permissions to your data elsewhere (such as the [geoserver layer-level permissions](http://docs.geoserver.org/stable/en/user/security/layer.html)), you excluding or encapsulating dangerous actions like `Delete` is a good idea.

- The functions `Insert, Update, Replace, Delete` in this module have remained uppercase (1) to remain similar to their xml names and (2) to avoid the keyword `delete`.  If you would prefer to adhere to camelcase naming, consider aliasing the functions on import, like `import {Insert as insert} from '...'`

## Contributing

Features, refactors, documentation, and tests are welcome! To contribute, branch or fork this repo, optionally open an issue, and then open a pull request.  Please include tests
and well-commented commits in all work.

Here's an example script to start developing a feature on this project:
```
git clone https://github.com/SKalt/geojson-to-wfs-t-2.git # or your fork
cd geojson-to-wfs-t-2
git checkout -b informative-feature-branch
npm install
```
