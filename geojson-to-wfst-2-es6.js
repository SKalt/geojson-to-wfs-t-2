import {geomToGml as gml3} from 'geojson-to-gml-3';
import 'core-js/fn/object/entries';

/**
 * A namespace for xml utilities.
 * @private
 * @const
 * @type {Object}
 */
const xml = {
  /**
   * Turns an object into a string of xml attribute key-value pairs.
   * @memberOf xml.
   * @private
   * @function
   * @memberof xml
   * @param {Object} attrs an object mapping attribute names to attribute values
   * @return {string} a string of xml attribute key-value pairs
   */
  'attrs': function(attrs) {
    return Object.keys(attrs)
      .map((a) => attrs[a] ? ` ${a}="${attrs[a]}"` : '')
      .join('');
  },
  /**
   * Creates a string xml tag.
   * @private
   * @function
   * @memberof xml.
   * @param {string} ns the tag's xml namespace abbreviation.
   * @param {string} tagName the tag name.
   * @param {Object} attrs @see xml.attrs.
   * @param {string} inner inner xml.
   * @return {string} an xml string.
   */
  'tag': function(ns, tagName, attrs, inner) { // TODO: self-closing
    let tag = (ns ? `${ns}:` : '') + tagName;
    if (tagName) {
      return `<${tag}${this.attrs(attrs)}>${inner}</${tag}>`;
    } else {
      throw new Error(
        'no tag supplied ' + JSON.stringify([ns, tagName, attrs, inner])
      );
    }
  }
};
/**
 * Shorthand for creating a wfs xml tag.
 * @private
 * @param {string} tagName a valid wfs tag name.
 * @param {Object} attrs @see xml.attrs.
 * @param {string} inner @see xml.tag.
 * @return {string} a wfs element.
 */
const wfs = (tagName, attrs, inner) => xml.tag('wfs', tagName, attrs, inner);
/**
 * Ensures the result is an array.
 * @private
 * @function
 * @param {Feature|Feature[]|FeatureCollection} maybe a GeoJSON
 * FeatureCollection, Feature, or an array of Features.
 * @return {Feature[]}
 */
const ensureArray = (...maybe)=> (maybe[0].features || [].concat(...maybe))
	.filter((f) => f);
/**
 * Ensures a layer.id format of an input id.
 * @private
 * @function
 * @param {string} lyr layer name
 * @param {string} id id, possibly already in correct layer.id format.
 * @return {string} a correctly-formatted gml:id
 */
const ensureId = (lyr, id) => /\./.exec(id || '') ? id :`${lyr}.${id}`;
/**
 * return a correctly-formatted typeName
 * @private
 * @function
 * @param {string} ns namespace
 * @param {string} layer layer name
 * @param {string} typeName typeName to check
 * @return {string} a correctly-formatted typeName
 * @throws {Error} if typeName it cannot form a typeName from ns and layer
 */
const ensureTypeName = (ns, layer, typeName) =>{
  if (!typeName && !(ns && layer)){
    throw new Error(`no typename possible: ${JSON.stringify({typeName, ns, layer})}`);
  }
  return typeName || `${ns}:${layer}Type`;
};

/**
 * Stands in for other functions in swich statements, etc. Does nothing.
 * @private
 * @function
 * @return {undefined} nothng.
 */
const pass = () => undefined;

/**
 * Iterates over the key-value pairs, filtering by a whitelist if available.
 * @private
 * @function
 * @param {Array<string>} whitelist a whitelist of property names
 * @param {Object} properties an object mapping property names to values
 * @param {Function} cb a function to call on each (whitelisted key, value) pair
 */
const useWhitelistIfAvailable = (whitelist, properties, cb) =>{
  for (let prop of whitelist || Object.keys(properties)){
    properties[prop] ? cb(prop, properties[prop]) : pass();
  }
};
/**
 * Creates a fes:ResourceId filter from a layername and id
 * @private
 * @function
 * @param {string} lyr layer name of the filtered feature
 * @param {string} id feature id
 * @return {string} a filter-ecoding of the filter.
 */
const idFilter = (lyr, id) => `<fes:ResourceId rid="${ensureId(lyr, id)}"/>`;

const unpack = (()=>{
  let featureMembers = new Set(['properties', 'geometry', 'id', 'layer']);
  /**
   * Resolves attributes from feature, then params unless they are normally
   * found in the feature
   * @param {Object} feature a geojson feature
   * @param {Object} params an object of backup / override parameters
   * @param {Array<string>} args parameter names to resolve from feature or
   * params
   * @return {Object} an object mapping each named parameter to its resolved
   * value
   */
  return (feature, params, ...args) => {
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
})();

/**
 * Builds a filter from feature ids if one is not already input.
 * @private
 * @function
 * @param {string|undefined} filter a possible string filter
 * @param {Array<Object>} features an array of geojson feature objects
 * @param {Object} params an object of backup / override parameters
 * @return {string} A filter, or the input filter if it was a string.
 */
function ensureFilter(filter, features, params) {
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
};

// http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286
/**
 * Checks the type of the input action
 * @private
 * @function
 * @param {string | undefined} action
 * @return {Boolean} whether the action is allowed
*/
const ensureAction = (()=>{
  const allowed = new Set(['replace', 'insertBefore', 'insertAfter', 'remove']);
  return (action) => allowed.has(action);
})();

/**
 * An object containing optional named parameters.
 * @typedef {Object} Params
 * @prop {string|undefined} ns an xml namespace alias.
 * @prop {string|Object|undefined} layer a string layer name or {id}, where id
 * is the layer name
 * @prop {string|undefined} geometry_name the name of the feature geometry
 * field.
 * @prop {Object|undefined} properties an object mapping feature field names to
 * feature properties
 * @prop {string|undefined} id a string feature id.
 * @prop {string[]|undefined} whitelist an array of string field names to
 * use from @see Params.properties
 * @prop {string|undefined} inputFormat inputFormat, as specified at
 * [OGC 09-025r2 § 7.6.5.4]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65}.
 * @prop {string|undefined} srsName srsName, as specified at
 * [OGC 09-025r2 § 7.6.5.5]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66}.
 * if undefined, the gml3 module will default to 'EPSG:4326'.
 * @prop {string|undefined} handle handle parameter, as specified at
 * [OGC 09-025r2 § 7.6.2.6 ]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44}
 * @prop {string|undefined} filter a string fes:Filter.
 * @prop {string|undefined} typeName a string specifying the feature type within
 * its namespace. See [09-025r2 § 7.9.2.4.1]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#90}.
 * @prop {Object|undefined} schemaLocations an object mapping uri to
 * schema locations
 * @prop {Object|undefined} nsAssignments an object mapping ns to uri
 */

/**
 * An object containing optional named parameters for a transaction in addition
 * to parameters used elsewhere.
 * @typedef {Object} TransactionParams
 * @extends Params
 * @prop {string|undefined} lockId lockId parameter, as specified at
 * [OGC 09-025r2 § 15.2.3.1.2]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#277}.
 * @prop {string|undefined} releaseAction releaseAction parameter, as specified
 * at [OGC 09-025r2 § 15.2.3.2]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#278}.
 */

/**
 * A GeoJSON feature with the following optional foreign members (see
 * [rfc7965 § 6]{@link https://tools.ietf.org/html/rfc7946#section-6}).
 * or an object with some of the following members.
 * Members of Feature will be used over those in Params except for layer, id,
 * and properties.
 * @typedef {Object} Feature
 * @extends Params
 * @property {Object|undefined} geometry a GeoJSON geometry.
 * @property {string|undefined} type 'Feature'.
 * @example
 * {'id':'tasmania_roads.1', 'typeName':'topp:tasmania_roadsType'}
 * // can be passed to Delete
 */

/**
 * a GeoJSON FeatureCollection with optional foreign members as in Feature.
 * @typedef {Object} FeatureCollection
 * @extends Feature
 * @property {string} type 'FeatureCollection'.
 * @property {Feature[]} features an array of GeoJSON Features.
 */

/**
 * Turns an array of geojson features into gml:_feature strings describing them.
 * @function
 * @param {Feature[]} features an array of features to translate to
 * gml:_features.
 * @param {Params} params an object of backup / override parameters
 * @return {string} a gml:_feature string.
 */
function translateFeatures(features, params={}) {
  let inner = '';
  let {srsName} = params;
  for (let feature of features) {
    //TODO: add whitelist support
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
      (prop, val)=>fields += xml.tag(ns, prop, {}, properties[prop])
    );
    inner += xml.tag(ns, layer, {'gml:id': ensureId(layer, id)}, fields);
  }
  return inner;
}

/**
 * Returns a wfs:Insert tag wrapping a translated feature
 * @function
 * @param {Feature[]|FeatureCollection|Feature} features Feature(s) to pass to
 *  @see translateFeatures
 * @param {Params} params to be passed to @see translateFeatures, with optional
 * inputFormat, srsName, handle for the wfs:Insert tag.
 * @return {string} a wfs:Insert string.
 */
function Insert(features, params={}) {
  features = ensureArray(features);
  let {inputFormat, srsName, handle} = params;
  if (!features.length) {
    console.warn('no features supplied');
    return '';
  }
  let toInsert = translateFeatures(features, params);
  return xml.tag('wfs', 'Insert', {inputFormat, srsName, handle}, toInsert);
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
function Update(features, params={}) {
  features = ensureArray(features);
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
  const makeKvp = (prop, val, action) => wfs(
    'Property', {},
    wfs('ValueReference', {action}, prop) +
      (val !== undefined ? wfs('Value', {}, val): '')
  );
  if (params.properties) {
    let {/* handle, */inputFormat, filter, typeName, whitelist} = params;
    let {srsName, ns, layer, geometry_name} = unpack(
      features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name');
    typeName = ensureTypeName(ns, layer, typeName);
    filter = ensureFilter(filter, features, params);
    if (!filter && !features.length) {
      console.warn('neither features nor filter supplied');
      return '';
    }
    let fields = '';
    useWhitelistIfAvailable( // TODO: action attr
      whitelist, params.properties, (k, v) => fields += makeKvp(k, v)
    );
    if (geometry_name) {
      fields += makeKvp(
        geometry_name, xml.tag(
          ns, geometry_name, {}, gml3(params.geometry, '', {srsName})
        )
      );
    }
    return wfs('Update', {inputFormat, srsName, typeName}, fields + filter);
  } else {
    // encapsulate each update in its own Update tag
    return features.map(
      (f) => Update(
        f, Object.assign({}, params, {properties:f.properties})
      )
    ).join('');
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
function Delete(features, params={}) {
  features = ensureArray(features);
  let {filter, typeName} = params; // TODO: recurse & encapsulate by typeName
  let {ns, layer} = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName = ensureTypeName(ns, layer, typeName);
  filter = ensureFilter(filter, features, params);
  return wfs('Delete', {typeName}, filter);
}

/**
 * Returns a string wfs:Replace action.
 * @param {Feature[]|FeatureCollection|Feature} features feature(s) to replace
 * @param {Params} params with optional filter, inputFormat, srsName
 * @return {string} a string wfs:Replace action.
 */
function Replace(features, params={}) {
  features = ensureArray(features);
  let {filter, inputFormat, srsName} = unpack(
    features[0] || {}, params || {}, 'filter', 'inputFormat', 'srsName'
  );
  let replacements = translateFeatures(
    [features[0]].filter((f)=>f),
    params || {srsName}
  );
  filter = ensureFilter(filter, features, params);
  return wfs('Replace', {inputFormat, srsName}, replacements + filter);
}

/**
 * Wraps the input actions in a wfs:Transaction.
 * @param {Object|string[]|string} actions an object mapping {Insert, Update,
 * Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action
 * string(s) to wrap in a transaction.
 * @param {TransactionParams} params optional srsName, lockId, releaseAction, handle,
 * inputFormat, version, and required nsAssignments, schemaLocations.
 * @return {string} A wfs:transaction wrapping the input actions.
 * @throws {Error} if `actions` is not an array of strings, a string, or
 * {@see Insert, @see Update, @see Delete}, where each action are valid inputs
 * to the eponymous function.
 */
function Transaction(actions, params={}) {
  const transactionParams = ['srsName', 'lockId', 'releaseAction', 'handle'];
  let {
    /* srsName, lockId, releaseAction, handle, inputFormat, */ version, // optional
    nsAssignments = {} /*, schemaLocations*/ // required
  } = params;
  // let converter = {Insert, Update, Delete};
  let {insert:toInsert, update:toUpdate, delete:toDelete} = actions || {};
  let finalActions = ''; // processedActions would be more accurate

  if (Array.isArray(actions) && actions.every((v) => typeof(v) == 'string')) {
    finalActions += actions.join('');
  } else if (typeof(actions) == 'string') {
    finalActions = actions;
  } else if ([toInsert, toUpdate, toDelete].some((e) => e)) {
    finalActions += Insert(toInsert, params) +
      Update(toUpdate, params) +
      Delete(toDelete, params);
  } else {
    throw new Error(`unexpected input: ${JSON.stringify(actions)}`);
  }
  // generate schemaLocation, xmlns's
  let attrs = generateNsAssignments(nsAssignments, actions);
  attrs['xsi:schemaLocation'] = generateSchemaLines(params.schemaLocations);
  attrs['service'] = 'WFS';
  attrs['version'] = /2\.0\.\d+/.exec(version || '') ? version : '2.0.0';
  transactionParams.forEach((param) => {
    if (params[param]) {
      attrs[param] = params[param];
    }
  });
  return wfs('Transaction', attrs, finalActions);
}

/**
 * Generates an object to be passed to @see xml.attrs xmlns:ns="uri" definitions for a wfs:Transaction
 * @private
 * @param {Object} nsAssignments @see Params.nsAssignments
 * @param {string} xml arbitrary xml.
 * @return {Object} an object mapping each ns to its URI as 'xmlns:ns' : 'URI'.
 * @throws {Error} if any namespace used within `xml` is missing a URI definition
 */
function generateNsAssignments(nsAssignments, xml) {
  let attrs = {};
  const makeNsAssignment = (ns, uri) => attrs[`xmlns:${ns}`] = uri;
  for (let ns in nsAssignments) {
    makeNsAssignment(ns, nsAssignments[ns]);
  }
  // check all ns's assigned
  var re = /(<|typeName=")(\w+):/g;
  var arr;
  var allNamespaces = new Set();
  while ((arr = re.exec(xml)) !== null){
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
  }/*, schemaLocations*/
  return attrs;
}

/**
 * Returns a string alternating uri, whitespace, and the uri's schema's
 * location.
 * @private
 * @param {Object} schemaLocations an object mapping uri:schemalocation
 * @return {string} a string that is a valid xsi:schemaLocation value.
 */
function generateSchemaLines(schemaLocations={}) {
  // TODO: add ns assignment check
  schemaLocations['http://www.opengis.net/wfs/2.0'] =
    'http://schemas.opengis.net/wfs/2.0/wfs.xsd';
  let schemaLines = [];
  Object.entries(schemaLocations).forEach(
    (entry)=>schemaLines.push(entry.join('\n'))
  );
  return schemaLines.join('\n');
}

export {Insert, Update, Replace, Delete, Transaction};
