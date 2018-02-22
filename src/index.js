/* eslint-disable camelcase, new-cap */
// some snake_case variables are used to imitate gml's notation.
/**
 * A library of functions to turn geojson into WFS transactions.
 * @module geojsonToWfst
 */
import {geomToGml as gml3} from 'geojson-to-gml-3';
import * as ensure from './ensure';
import * as xml from './xml';
import {
  generateNsAssignments, translateFeatures, useWhitelistIfAvailable, unpack,
  generateSchemaLines
} from './utils.js';
const {wfs} = xml;

/**
 * Returns a wfs:Insert tag wrapping a translated feature
 * @function
 * @param {Feature[]|FeatureCollection|Feature} features Feature(s) to pass to
 *  @see translateFeatures
 * @param {Params} params to be passed to @see translateFeatures, with optional
 * inputFormat, srsName, handle for the wfs:Insert tag.
 * @return {string} a wfs:Insert string.
 */
export function Insert(features, params={}) {
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
export function Update(features, params={}) {
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
      whitelist, params.properties, (k, v) =>
        fields += makeKvp(k, xml.escape(v))
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
export function Delete(features, params={}) {
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
export function Replace(features, params={}) {
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
export function Transaction(actions, params={}) {
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
