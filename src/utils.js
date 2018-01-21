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
export const useWhitelistIfAvailable = (whitelist, properties, cb) =>{
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
export function unpack(feature, params, ...args) {
  let results = {};
  for (let arg of args) {
    if (arg === 'layer') {
      results[arg] = (params.layer || {}).id
        || params.layer
        || (feature.layer||{}).id
        || feature.layer
        || '';
    } else if (!featureMembers.has(arg)) {
      results[arg] = feature[arg]
        || params[arg]
        || '';
    } else {
      results[arg] = params[arg]
        || feature[arg]
        || '';
    }
  }
  return results;
};

/**
 * Generates an object to be passed to @see xml.attrs xmlns:ns="uri" definitions
 * for a wfs:Transaction
 * @param {Object} nsAssignments @see Params.nsAssignments
 * @param {String} xml arbitrary xml.
 * @return {Object} an object mapping each ns to its URI as 'xmlns:ns' : 'URI'.
 * @throws {Error} if any namespace used within `xml` is missing a URI
 * definition
 */
export function generateNsAssignments(nsAssignments, xml) {
  let attrs = {};
  const makeNsAssignment = (ns, uri) => attrs[`xmlns:${ns}`] = uri;
  Object.keys(nsAssignments).forEach((ns) => {
    makeNsAssignment(ns, nsAssignments[ns]);
  });
  // check all ns's assigned
  let re = /(<|typeName=")(\w+):/g;
  let arr;
  let allNamespaces = new Set();
  while ((arr = re.exec(xml)) !== null) {
    allNamespaces.add(arr[2]);
  }
  if (allNamespaces.has('fes')) {
    makeNsAssignment('fes', 'http://www.opengis.net/fes/2.0');
  };
  makeNsAssignment('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  makeNsAssignment('gml', 'http://www.opengis.net/gml/3.2');
  makeNsAssignment('wfs', 'http://www.opengis.net/wfs/2.0');

  for (let ns of allNamespaces) {
    if (!attrs['xmlns:' + ns]) {
      throw new Error(`unassigned namespace ${ns}`);
    }
  }/* , schemaLocations*/
  return attrs;
}

/**
 * Returns a string alternating uri, whitespace, and the uri's schema's
 * location.
 * @param {Object} schemaLocations an object mapping uri:schemalocation
 * @return {string} a string that is a valid xsi:schemaLocation value.
 */
export function generateSchemaLines(schemaLocations={}) {
  // TODO: add ns assignment check
  schemaLocations['http://www.opengis.net/wfs/2.0'] =
    'http://schemas.opengis.net/wfs/2.0/wfs.xsd';
  let schemaLines = [];
  Object.entries(schemaLocations).forEach(
    (entry)=>schemaLines.push(entry.join('\n'))
  );
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
export function translateFeatures(features, params={}) {
  let inner = '';
  let {srsName} = params;
  for (let feature of features) {
    // TODO: add whitelist support
    let {ns, layer, geometry_name, properties, id, whitelist} = unpack(
      feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id',
      'whitelist'
    );
    let fields = '';
    if (geometry_name) {
      fields += xml.tag(
        ns, geometry_name, {}, gml3(feature.geometry, '', {srsName})
      );
    }
    useWhitelistIfAvailable(
      whitelist, properties,
      (prop, val)=> {
        if (val === null) {
          return fields;
        }
        return fields += xml.tag(ns, prop, {}, properties[prop]);
      }
    );
    inner += xml.tag(ns, layer, {'gml:id': ensure.id(layer, id)}, fields);
  }
  return inner;
}
