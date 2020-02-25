'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* eslint-disable no-console */
/**
 * reorder coordinates to lat, lng iff config.coordinateOrder is false.
 * @param  {Number[]} coords An array of coordinates,  [lng, lat, ...etc]
 * @return {Number[]} An array of coordinates in the correct order.
 */

function orderCoords(coords) {
  {
    return coords;
  }

  if (coords[2]) {
    return [coords[1], coords[0], coords[2]];
  }

  return coords.reverse();
}
/** @private*/


function attrs(attrMappings) {
  // return Object.entries()
  let results = '';

  for (let attrName in attrMappings) {
    let value = attrMappings[attrName];
    results += value ? ` ${attrName}="${value}"` : '';
  }

  return results;
}
/**
 * Optional parameters for conversion of geojson to gml geometries
 * @typedef {Object} Params
 * @property {?String} params.srsName as string specifying SRS, e.g. 'EPSG:4326'. Only applies to multigeometries.
 * @property {?Number[]|?String[]} params.gmlIds an array of number/string gml:ids of the member geometries.
 * @property {?Number|?String} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 */

/**
 * A handler to compile geometries to multigeometries
 * @function
 * @param {String} name the name of the target multigeometry
 * @param {String} memberName the gml:tag of each multigeometry member.
 * @param {Object[]|Array} geom an array of geojson geometries
 * @param {String|Number} gmlId the gml:id of the multigeometry
 * @param {Params} params optional parameters. Omit gmlIds at your own risk, however.
 * @returns {String} a string containing gml describing the input multigeometry
 * @throws {Error} if a member geometry cannot be converted to gml
 */


function multi(name, memberName, membercb, geom, gmlId, params = {}) {
  var {
    srsName,
    gmlIds
  } = params;
  let multi = `<gml:${name}${attrs({
    srsName,
    'gml:id': gmlId
  })}>`;
  multi += `<gml:${memberName}>`;
  geom.forEach(function (member, i) {
    let _gmlId = member.id || (gmlIds || [])[i] || '';

    if (name == 'MultiGeometry') {
      let memberType = member.type;
      member = member.coordinates;
      multi += membercb[memberType](member, _gmlId, params);
    } else {
      multi += membercb(member, _gmlId, params);
    }
  });
  multi += `</gml:${memberName}>`;
  return multi + `</gml:${name}>`;
}
/**
 * Converts an input geojson Point geometry to gml
 * @function
 * @param {Number[]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */


function point(coords, gmlId, params = {}) {
  var {
    srsName: srsName,
    srsDimension: srsDimension
  } = params;
  return `<gml:Point${attrs({
    srsName: srsName,
    'gml:id': gmlId
  })}>` + `<gml:pos${attrs({
    srsDimension
  })}>` + orderCoords(coords).join(' ') + '</gml:pos>' + '</gml:Point>';
}
/**
 * Converts an input geojson LineString geometry to gml
 * @function
 * @param {Number[][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function lineString(coords, gmlId, params = {}) {
  var {
    srsName: srsName,
    srsDimension: srsDimension
  } = params;
  return `<gml:LineString${attrs({
    srsName,
    'gml:id': gmlId
  })}>` + `<gml:posList${attrs({
    srsDimension
  })}>` + coords.map(e => orderCoords(e).join(' ')).join(' ') + '</gml:posList>' + '</gml:LineString>';
}
/**
 * Converts an input geojson LinearRing member of a polygon geometry to gml
 * @function
 * @param {Number[][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function linearRing(coords, gmlId, params = {}) {
  var {
    srsName: srsName,
    srsDimension: srsDimension
  } = params;
  return `<gml:LinearRing${attrs({
    'gml:id': gmlId,
    srsName
  })}>` + `<gml:posList${attrs({
    srsDimension
  })}>` + coords.map(e => orderCoords(e).join(' ')).join(' ') + '</gml:posList>' + '</gml:LinearRing>';
}
/**
 * Converts an input geojson Polygon geometry to gml
 * @function
 * @param {Number[][][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function polygon(coords, gmlId, params = {}) {
  // geom.coordinates are arrays of LinearRings
  var {
    srsName
  } = params;
  let polygon = `<gml:Polygon${attrs({
    srsName,
    'gml:id': gmlId
  })}>` + '<gml:exterior>' + linearRing(coords[0]) + '</gml:exterior>';

  if (coords.length >= 2) {
    for (let ring of coords.slice(1)) {
      polygon += '<gml:interior>' + linearRing(ring) + '</gml:interior>';
    }
  }

  polygon += '</gml:Polygon>';
  return polygon;
}
/**
 * Converts an input geojson MultiPoint geometry to gml
 * @function
 * @param {Number[][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function multiPoint(coords, gmlId, params = {}) {
  return multi('MultiPoint', 'pointMembers', point, coords, gmlId, params);
}
/**
 * Converts an input geojson MultiLineString geometry to gml
 * @function
 * @param {Number[][][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function multiLineString(coords, gmlId, params = {}) {
  return multi('MultiCurve', 'curveMembers', lineString, coords, gmlId, params);
}
/**
 * Converts an input geojson MultiPolygon geometry to gml
 * @function
 * @param {Number[][][][]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Params} params optional parameters
 * @returns {String} a string containing gml representing the input geometry
 */

function multiPolygon(coords, gmlId, params = {}) {
  return multi('MultiSurface', 'surfaceMembers', polygon, coords, gmlId, params);
}
/**
 * A helper to de-camelcase this module's geometry conversion methods
 * @param  {Object} obj a mapping of camelcase geometry types to converter functions
 * @return {Object} a mapping of capitalized geometry types to converter functions
 * @example
 * makeConverter({lineString})
 * // returns {LineString: lineString}
 */

function makeConverter(obj) {
  return Object.entries(obj).map(([type, converter]) => {
    return {
      [type[0].toUpperCase() + type.slice(1)]: converter
    };
  }).reduce((a, b) => Object.assign(a, b), {});
}
/**
* A helper to map geometry types to converter functions.
* @function
* @param {Object} obj an object mapping camelcase-d geometry type names to
* converter functions for that type.
* @example
* import {point, lineString} from 'geojson-to-gml-3';
* const geomToGml = makeTranslator({point, lineString});
* geomToGml({type: 'Point', coordinates: [0, 0]});
*/


function makeTranslator(obj) {
  const converter = makeConverter(obj);
  return function (geom, gmlId, params) {
    const warn = () => new Error(`unkown: ${geom.type} ` + [...arguments].join());

    const convert = converter[geom.type] || warn;
    return convert(geom.coordinates || geom.geometries, gmlId, params);
  };
}
/**
 * a namespace to switch between geojson-handling functions by geojson.type
 * @const
 * @type {Object}
 */

const allTypes = makeConverter({
  point,
  lineString,
  linearRing,
  polygon,
  multiPoint,
  multiLineString,
  multiPolygon
});
/**
 * Converts an input geojson GeometryCollection geometry to gml
 * @function
 * @param {Object[]} coords the coordinates member of the geojson geometry
 * @param {String|Number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {?String} params.srsName as string specifying SRS
 * @param {?Number|?String} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {String} a string containing gml representing the input geometry
 */

function geometryCollection(geoms, gmlId, params = {}) {
  return multi('MultiGeometry', 'geometryMembers', allTypes, geoms, gmlId, params);
}
/**
 * Translates any geojson geometry into GML 3.2.1
 * @public
 * @function
 * @param {Object} geom a geojson geometry object
 * @param {?Array} geom.coordinates the nested array of coordinates forming the geometry
 * @param {?Object[]} geom.geometries for a GeometryCollection only, the array of member geometry objects
 * @param {String|Number} gmlId the gml:id of the geometry
 * @param {object} params optional parameters
 * @param {?String} params.srsName a string specifying the SRS
 * @param {?String} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @param {?Number[]|?String[]} gmlIds  an array of number/string gml:ids of the member geometries of a multigeometry.
 * @returns {String} a valid gml string describing the input geojson geometry
 */

const geomToGml = makeTranslator(Object.assign({
  geometryCollection
}, allTypes));

/**
 * common checks, coersions, and informative errors/ warnings
 * @module ensure
 */

/**
 * Ensures the result is an array.
 * @private
 * @function
 * @param {Feature|Feature[]|FeatureCollection} maybe a GeoJSON
 * FeatureCollection, Feature, or an array of Features.
 * @return {Feature[]}
 */
const array = (...maybe) => (maybe[0].features || [].concat(...maybe)).filter(Boolean);
/**
 * Ensures a layer.id format of an input id.
 * @function
 * @param {String} lyr layer name
 * @param {String} id id, possibly already in correct layer.id format.
 * @return {String} a correctly-formatted gml:id
 */

const id = (lyr, id) => /\./.exec(id || '') ? id : `${lyr}.${id}`;
/**
 * return a correctly-formatted typeName
 * @function
 * @param {String} ns namespace
 * @param {String} layer layer name
 * @param {String} typeName typeName to check
 * @return {String} a correctly-formatted typeName
 * @throws {Error} if typeName it cannot form a typeName from ns and layer
 */

const typeName = (ns, layer, typeName) => {
  if (!typeName && !(ns && layer)) {
    throw new Error(`no typename possible: ${JSON.stringify({
      typeName,
      ns,
      layer
    }, null, 2)}`);
  }

  return typeName || `${layer}`;
}; // http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286

/**
 * xml utilities.
 * @module xml
 */

/**
 * Turns an object into a string of xml attribute key-value pairs.
 * @function
 * @param {Object} attrs an object mapping attribute names to attribute values
 * @return {String} a string of xml attribute key-value pairs
 */

function attrs$1(attrs) {
  return Object.keys(attrs).map(a => attrs[a] ? ` ${a}="${escape(attrs[a])}"` : '').join('');
}
/**
 * Creates a string xml tag.
 * @function
 * @param {String} ns the tag's xml namespace abbreviation.
 * @param {String} tagName the tag name.
 * @param {Object} attrsObj @see xml.attrs.
 * @param {String} inner inner xml.
 * @return {String} an xml string.
 */

function tag(ns, tagName, attrsObj, inner) {
  let tag = (ns ? `${ns}:` : '') + tagName;

  if (tagName) {
    return `<${tag}${attrs$1(attrsObj)}${inner !== null ? `>${inner}</${tag}` : ' /'}>`;
  } else {
    throw new Error('no tag supplied ' + JSON.stringify({
      ns,
      tagName,
      attrsObj,
      inner
    }, null, 2));
  }
}
/**
 * Shorthand for creating a wfs xml tag.
 * @param {String} tagName a valid wfs tag name.
 * @param {Object} attrsObj @see xml.attrs.
 * @param {String} inner @see xml.tag.
 * @return {String} a wfs element.
 */

const wfs = (tagName, attrsObj, inner) => tag('wfs', tagName, attrsObj, inner);
/**
 * Creates a fes:ResourceId filter from a layername and id
 * @function
 * @param {String} lyr layer name of the filtered feature
 * @param {String} id feature id
 * @return {String} a filter-ecoding of the filter.
 */

const idFilter = (lyr, id$$1) => {
  return `<fes:ResourceId rid="${id(lyr, id$$1)}"/>`;
};
/**
 * Creates an xml-safe string from a given input string
 * @function
 * @param {String} input String to escape
 * @return {String} XML-safe string
 */

function escape(input) {
  if (typeof input !== 'string') {
    // Backup check for non-strings
    return input;
  }

  const output = input.replace(/[<>&'"]/g, char => {
    switch (char) {
      case '<':
        return '&lt;';

      case '>':
        return '&gt;';

      case '&':
        return '&amp;';

      case `'`:
        return '&apos;';

      case '"':
        return '&quot;';
    }
  });
  return output;
}

/* eslint-disable camelcase */

/**
 * Common utilities for handling parameters for creation of WFS trasactions.
 * @module utils
 */

/**
 * Iterates over the key-value pairs, filtering by a whitelist if available.
 * @function
 * @param {Array<String>} whitelist a whitelist of property names
 * @param {Object} properties an object mapping property names to values
 * @param {Function} cb a function to call on each (whitelisted key, value) pair
 */

const useWhitelistIfAvailable = (whitelist, properties, cb) => {
  for (let prop of whitelist || Object.keys(properties)) {
    const val = properties[prop];

    if (Number.isNaN(val)) {
      throw new Error('NaN is not allowed.');
    }

    if (val !== undefined) {
      cb(prop, val);
    }
  }
};
const featureMembers = new Set(['properties', 'geometry', 'id', 'layer']);
/**
* Resolves attributes from feature, then params unless they are normally
* found in the feature
* @param {Object} feature a geojson feature
* @param {Object} params an object of backup / override parameters
* @param {Array<String>} args parameter names to resolve from feature or
* params
* @return {Object} an object mapping each named parameter to its resolved
* value
*/

function unpack(feature, params, ...args) {
  let results = {};

  for (let arg of args) {
    if (arg === 'layer') {
      results[arg] = (params.layer || {}).id || params.layer || (feature.layer || {}).id || feature.layer || '';
    } else if (!featureMembers.has(arg)) {
      results[arg] = feature[arg] || params[arg] || '';
    } else {
      results[arg] = params[arg] || feature[arg] || '';
    }
  }

  return results;
}
/**
 * Generates an object to be passed to @see xml.attrs xmlns:ns="uri" definitions
 * for a wfs:Transaction
 * @param {Object} nsAssignments @see Params.nsAssignments
 * @param {String} xml arbitrary xml.
 * @return {Object} an object mapping each ns to its URI as 'xmlns:ns' : 'URI'.
 * @throws {Error} if any namespace used within `xml` is missing a URI
 * definition
 */

function generateNsAssignments(nsAssignments, xml) {
  let attrs = {};

  const makeNsAssignment = (ns, uri) => attrs[`xmlns:${ns}`] = uri;

  Object.keys(nsAssignments).forEach(ns => {
    makeNsAssignment(ns, nsAssignments[ns]);
  }); // check all ns's assigned

  let re = /(<|typeName=")(\w+):/g;
  let arr;
  let allNamespaces = new Set();

  while ((arr = re.exec(xml)) !== null) {
    allNamespaces.add(arr[2]);
  }

  if (allNamespaces.has('fes')) {
    makeNsAssignment('fes', 'http://www.opengis.net/fes/2.0');
  }
  makeNsAssignment('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  makeNsAssignment('gml', 'http://www.opengis.net/gml/3.2');
  makeNsAssignment('wfs', 'http://www.opengis.net/wfs/2.0');

  for (let ns of allNamespaces) {
    if (!attrs['xmlns:' + ns]) {
      throw new Error(`unassigned namespace ${ns}`);
    }
  }
  /* , schemaLocations*/


  return attrs;
}
/**
 * Returns a string alternating uri, whitespace, and the uri's schema's
 * location.
 * @param {Object} schemaLocations an object mapping uri:schemalocation
 * @return {string} a string that is a valid xsi:schemaLocation value.
 */

function generateSchemaLines(schemaLocations = {}) {
  // TODO: add ns assignment check
  schemaLocations['http://www.opengis.net/wfs/2.0'] = 'http://schemas.opengis.net/wfs/2.0/wfs.xsd';
  let schemaLines = [];
  Object.entries(schemaLocations).forEach(entry => schemaLines.push(entry.join('\n')));
  return schemaLines.join('\n');
}
/**
 * Turns an array of geojson features into gml:_feature strings describing them.
 * @function
 * @param {Feature[]} features an array of features to translate to
 * gml:_features.
 * @param {Params} params an object of backup / override parameters
 * @return {String} a gml:_feature string.
 */

function translateFeatures(features, params = {}) {
  let inner = '';
  let {
    srsName,
    srsDimension
  } = params;

  for (let feature of features) {
    // TODO: add whitelist support
    let {
      ns,
      layer,
      geometry_name,
      properties,
      id: id$$1,
      whitelist
    } = unpack(feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id', 'whitelist');
    let fields = '';

    if (geometry_name) {
      fields += tag(ns, geometry_name, {}, geomToGml(feature.geometry, '', {
        srsName,
        srsDimension
      }));
    }

    useWhitelistIfAvailable(whitelist, properties, (prop, val) => {
      if (val === null) {
        return fields;
      }

      return fields += tag(ns, prop, {}, escape(properties[prop]));
    });
    inner += tag(ns, layer, {
      'gml:id': id(layer, id$$1)
    }, fields);
  }

  return inner;
}

/**
 * Builds a filter from feature ids if one is not already input.
 * @function
 * @param {?String} filter a possible string filter
 * @param {Array<Object>} features an array of geojson feature objects
 * @param {Object} params an object of backup / override parameters
 * @return {String} A filter, or the input filter if it was a string.
 */

function filter(filter, features, params) {
  if (!filter) {
    filter = '';

    for (let feature of features) {
      let layer = unpack(feature, params);
      filter += idFilter(layer, feature.id);
    }

    return `<fes:Filter>${filter}</fes:Filter>`;
  } else {
    return filter;
  }
}

/* eslint-disable camelcase, new-cap */
/**
 * Returns a wfs:Insert tag wrapping a translated feature
 * @function
 * @param {Feature[]|FeatureCollection|Feature} features Feature(s) to pass to
 *  @see translateFeatures
 * @param {Params} params to be passed to @see translateFeatures, with optional
 * inputFormat, srsName, handle for the wfs:Insert tag.
 * @return {string} a wfs:Insert string.
 */

function Insert(features, params = {}) {
  features = array(features);
  let {
    inputFormat,
    srsName,
    handle
  } = params;

  if (!features.length) {
    console.warn('no features supplied');
    return '';
  }

  let toInsert = translateFeatures(features, params);
  return tag('wfs', 'Insert', {
    inputFormat,
    srsName,
    handle
  }, toInsert);
}
/**
 * Updates the input features in bulk with params.properties or by id.
 * @param {Feature[]|FeatureCollection} features features to update.  These may
 * pass in geometry_name, properties, and layer (overruled by params) and
 * ns, layer, srsName (overruling params).
 * @param {Params} params with optional properties, ns (namespace), layer,
 *  geometry_name, filter, typeName, whitelist.
 * @return {string} a string wfs:Upate action.
 */

function Update(features, params = {}) {
  features = array(features);
  /**
   * makes a wfs:Property string containg a wfs:ValueReference, wfs:Value pair.
   * @private
   * @function
   * @memberof Update~
   * @param {string} prop the field/property name
   * @param {string} val the field/property value
   * @param {string} action one of 'insertBefore', 'insertAfter', 'remove',
   * 'replace'. See [OGC 09-025r2 § 15.2.5.2.1]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286}.
   * `action` would delete or modify the order of fields within the remote
   * feature. There is currently no way to input `action,` since wfs:Update's
   * default action, 'replace', is sufficient.
   * @return {string} a wfs:Property(wfs:ValueReference) pair.
   */

  const makeKvp = (prop, val, action$$1) => {
    let value = '';

    if (val === null) {
      value = wfs('Value', {
        'xsi:nil': true
      }, '');
    } else if (val !== undefined) {
      value = wfs('Value', {}, val);
    }

    return wfs('Property', {}, wfs('ValueReference', {
      action: action$$1
    }, prop) + value);
  };

  if (params.properties) {
    let {
      /* handle, */
      inputFormat,
      filter: filter$$1,
      typeName: typeName$$1,
      whitelist
    } = params;
    let {
      srsName,
      ns,
      layer,
      geometry_name
    } = unpack(features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name');
    typeName$$1 = typeName(ns, layer, typeName$$1);
    filter$$1 = filter(filter$$1, features, params);

    if (!filter$$1 && !features.length) {
      console.warn('neither features nor filter supplied');
      return '';
    }

    let fields = '';
    useWhitelistIfAvailable( // TODO: action attr
    whitelist, params.properties, (k, v) => fields += makeKvp(k, escape(v)));

    if (geometry_name) {
      fields += makeKvp(geometry_name, tag(ns, geometry_name, {}, geomToGml(params.geometry, '', {
        srsName
      })));
    }

    return wfs('Update', {
      inputFormat,
      srsName,
      typeName: typeName$$1
    }, fields + filter$$1);
  } else {
    // encapsulate each update in its own Update tag
    return features.map(f => Update(f, Object.assign({}, params, {
      properties: f.properties
    }))).join('');
  }
}
/**
 * Creates a wfs:Delete action, creating a filter and typeName from feature ids
 * if none are supplied.
 * @param {Feature[]|FeatureCollection|Feature} features
 * @param {Params} params optional parameter overrides.
 * @param {string} [params.ns] @see Params.ns
 * @param {string|Object} [params.layer] @see Params.layer
 * @param {string} [params.typeName] @see Params.typeName. This will be inferred
 * from feature/params layer and ns if this is left undefined.
 * @param {filter} [params.filter] @see Params.filter.  This will be inferred
 * from feature ids and layer(s) if left undefined (@see ensureFilter).
 * @return {string} a wfs:Delete string.
 */

function Delete(features, params = {}) {
  features = array(features);
  let {
    filter: filter$$1,
    typeName: typeName$$1
  } = params; // TODO: recur & encapsulate by typeName

  let {
    ns,
    layer
  } = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName$$1 = typeName(ns, layer, typeName$$1);
  filter$$1 = filter(filter$$1, features, params);
  return wfs('Delete', {
    typeName: typeName$$1
  }, filter$$1);
}
/**
 * Returns a string wfs:Replace action.
 * @param {Feature[]|FeatureCollection|Feature} features feature(s) to replace
 * @param {Params} params with optional filter, inputFormat, srsName
 * @return {string} a string wfs:Replace action.
 */

function Replace(features, params = {}) {
  features = array(features);
  let {
    filter: filter$$1,
    inputFormat,
    srsName
  } = unpack(features[0] || {}, params || {}, 'filter', 'inputFormat', 'srsName');
  let replacements = translateFeatures([features[0]].filter(f => f), params || {
    srsName
  });
  filter$$1 = filter(filter$$1, features, params);
  return wfs('Replace', {
    inputFormat,
    srsName
  }, replacements + filter$$1);
}
/**
 * Wraps the input actions in a wfs:Transaction.
 * @param {Object|string[]|string} actions an object mapping {Insert, Update,
 * Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action
 * string(s) to wrap in a transaction.
 * @param {TransactionParams} params optional srsName, lockId, releaseAction,
 *  handle, inputFormat, version, and required nsAssignments, schemaLocations.
 * @return {string} A wfs:transaction wrapping the input actions.
 * @throws {Error} if `actions` is not an array of strings, a string, or
 * {@see Insert, @see Update, @see Delete}, where each action are valid inputs
 * to the eponymous function.
 */

function Transaction(actions, params = {}) {
  const transactionParams = ['srsName', 'lockId', 'releaseAction', 'handle'];
  let {
    version,
    // optional
    nsAssignments = {} // required

  } = params; // let converter = {Insert, Update, Delete};

  let {
    insert: toInsert,
    update: toUpdate,
    delete: toDelete
  } = actions || {};
  let finalActions = ''; // processedActions would be more accurate

  if (Array.isArray(actions) && actions.every(v => typeof v == 'string')) {
    finalActions += actions.join('');
  } else if (typeof actions == 'string') {
    finalActions = actions;
  } else if ([toInsert, toUpdate, toDelete].some(e => e)) {
    finalActions += Insert(toInsert, params) + Update(toUpdate, params) + Delete(toDelete, params);
  } else {
    throw new Error(`unexpected input: ${JSON.stringify(actions)}`);
  } // generate schemaLocation, xmlns's


  let attrs = generateNsAssignments(nsAssignments, actions);
  attrs['xsi:schemaLocation'] = generateSchemaLines(params.schemaLocations);
  attrs['service'] = 'WFS';
  attrs['version'] = /2\.0\.\d+/.exec(version || '') ? version : '2.0.0';
  transactionParams.forEach(param => {
    if (params[param]) {
      attrs[param] = params[param];
    }
  });
  return wfs('Transaction', attrs, finalActions);
}

exports.Insert = Insert;
exports.Update = Update;
exports.Delete = Delete;
exports.Replace = Replace;
exports.Transaction = Transaction;
