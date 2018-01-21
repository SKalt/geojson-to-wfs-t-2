# geojson-to-wfst-2
[![npm version](https://badge.fury.io/js/geojson-to-wfs-t-2.svg)](https://badge.fury.io/js/geojson-to-wfs-t-2)
[![Build Status](https://img.shields.io/travis/SKalt/geojson-to-wfs-t-2/master.svg)](https://travis-ci.org/SKalt/geojson-to-wfs-t-2)


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
import wfs from 'geojson-to-wfst-2';
```

this is equivalent to:
```{javascript}
import {Insert, Update, Replace, Delete, Transaction} from 'geojson-to-wfst-2'
```
While you should make sure to secure permissions to your data elsewhere (such as the [geoserver layer-level permissions](http://docs.geoserver.org/stable/en/user/security/layer.html)), you excluding or encapsulating dangerous actions like `Delete` is a good idea.
```{javascript}
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
  wfs.Update({properties: {place_name: 'not Atlantis'}, id: 'feature_id.in_db'}),
  {nsAssignments: ...}
)
// same deal, but deleting it
wfs.Transaction(
  wfs.Delete({id: 'feature_id.in_db'}, params),
  {nsAssignments: ...}
)
```
See [API.md](./API.md) for the full API documentation.

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
