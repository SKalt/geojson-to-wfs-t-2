/* eslint-disable camelcase, new-cap */
// some snake_case variables are used to imitate gml's notation.
import {geomToGml as gml3} from 'geojson-to-gml-3';
import * as ensure from './ensure.js';
import * as xml from './xml.js';
import {
  generateNsAssignments, translateFeatures, useWhitelistIfAvailable, unpack,
  generateSchemaLines
} from './utils.js';
const {wfs} = xml;
/**
 * An object containing optional named parameters.
 * @typedef {Object} Params
 * @prop {?string} ns an xml namespace alias.
 * @prop {?string|?Object} layer a string layer name or {id}, where id
 * is the layer name
 * @prop {?string} geometry_name the name of the feature geometry
 * field.
 * @prop {?Object} properties an object mapping feature field names to
 * feature properties
 * @prop {?string} id a string feature id.
 * @prop {?string[]} whitelist an array of string field names to
 * use from @see Params.properties
 * @prop {?string} inputFormat inputFormat, as specified at
 * [OGC 09-025r2 § 7.6.5.4]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65}.
 * @prop {?string} srsName srsName, as specified at
 * [OGC 09-025r2 § 7.6.5.5]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66}.
 * if undefined, the gml3 module will default to 'EPSG:4326'.
 * @prop {?string} handle handle parameter, as specified at
 * [OGC 09-025r2 § 7.6.2.6 ]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44}
 * @prop {?string} filter a string fes:Filter.
 * @prop {?string} typeName a string specifying the feature type within
 * its namespace. See [09-025r2 § 7.9.2.4.1]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#90}.
 * @prop {?Object} schemaLocations an object mapping uri to
 * schema locations
 * @prop {?Object} nsAssignments an object mapping ns to uri
 */

/**
 * An object containing optional named parameters for a transaction in addition
 * to parameters used elsewhere.
 * @typedef {Object} TransactionParams
 * @extends Params
 * @prop {?string} lockId lockId parameter, as specified at
 * [OGC 09-025r2 § 15.2.3.1.2]{@link http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#277}.
 * @prop {?string} releaseAction releaseAction parameter, as specified
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
 * @property {?Object} geometry a GeoJSON geometry.
 * @property {?string} type 'Feature'.
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
 * Returns a wfs:Insert tag wrapping a translated feature
 * @function
 * @param {Feature[]|FeatureCollection|Feature} features Feature(s) to pass to
 *  @see translateFeatures
 * @param {Params} params to be passed to @see translateFeatures, with optional
 * inputFormat, srsName, handle for the wfs:Insert tag.
 * @return {string} a wfs:Insert string.
 */
function Insert(features, params={}) {
  features = ensure.array(features);
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
  features = ensure.array(features);
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
  const makeKvp = (prop, val, action) => {
    let value = '';
    if (val === null) {
      value = wfs('Value', {'xsi:nil': true}, '');
    } else if (val !== undefined) {
      value = wfs('Value', {}, val);
    }

    return wfs('Property', {}, wfs('ValueReference', {action}, prop) + value);
  };

  if (params.properties) {
    let {/* handle, */inputFormat, filter, typeName, whitelist} = params;
    let {srsName, ns, layer, geometry_name} = unpack(
      features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name');
    typeName = ensure.typeName(ns, layer, typeName);
    filter = ensure.filter(filter, features, params);
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
        f, Object.assign({}, params, {properties: f.properties})
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
 * from feature ids and layer(s) if left undefined (@see ensure.filter).
 * @return {string} a wfs:Delete string.
 */
function Delete(features, params={}) {
  features = ensure.array(features);
  let {filter, typeName} = params; // TODO: recur & encapsulate by typeName
  let {ns, layer} = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName = ensure.typeName(ns, layer, typeName);
  filter = ensure.filter(filter, features, params);
  return wfs('Delete', {typeName}, filter);
}

/**
 * Returns a string wfs:Replace action.
 * @param {Feature[]|FeatureCollection|Feature} features feature(s) to replace
 * @param {Params} params with optional filter, inputFormat, srsName
 * @return {string} a string wfs:Replace action.
 */
function Replace(features, params={}) {
  features = ensure.array(features);
  let {filter, inputFormat, srsName} = unpack(
    features[0] || {}, params || {}, 'filter', 'inputFormat', 'srsName'
  );
  let replacements = translateFeatures(
    [features[0]].filter((f)=>f),
    params || {srsName}
  );
  filter = ensure.filter(filter, features, params);
  return wfs('Replace', {inputFormat, srsName}, replacements + filter);
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
function Transaction(actions, params={}) {
  const transactionParams = ['srsName', 'lockId', 'releaseAction', 'handle'];
  let {
    version, // optional
    nsAssignments = {} // required
  } = params;
  // let converter = {Insert, Update, Delete};
  let {insert: toInsert, update: toUpdate, delete: toDelete} = actions || {};
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

export {Insert, Update, Replace, Delete, Transaction};
