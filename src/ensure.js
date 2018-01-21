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
export const array = (...maybe)=> (maybe[0].features || [].concat(...maybe))
  .filter((f) => f);
/**
 * Ensures a layer.id format of an input id.
 * @function
 * @param {String} lyr layer name
 * @param {String} id id, possibly already in correct layer.id format.
 * @return {String} a correctly-formatted gml:id
 */
export const id = (lyr, id) => /\./.exec(id || '') ? id :`${lyr}.${id}`;
/**
 * return a correctly-formatted typeName
 * @function
 * @param {String} ns namespace
 * @param {String} layer layer name
 * @param {String} typeName typeName to check
 * @return {String} a correctly-formatted typeName
 * @throws {Error} if typeName it cannot form a typeName from ns and layer
 */
export const typeName = (ns, layer, typeName) =>{
  if (!typeName && !(ns && layer)) {
    throw new Error(`no typename possible: ${
      JSON.stringify({typeName, ns, layer}, null, 2)
    }`);
  }
  return typeName || `${ns}:${layer}Type`;
};

/**
 * Builds a filter from feature ids if one is not already input.
 * @function
 * @param {?String} filter a possible string filter
 * @param {Array<Object>} features an array of geojson feature objects
 * @param {Object} params an object of backup / override parameters
 * @return {String} A filter, or the input filter if it was a string.
 */
export function filter(filter, features, params) {
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
 * @function
 * @param {?String} action
 * @return {Boolean} whether the action is allowed
*/
const allowedActions = new Set([
  'replace', 'insertBefore', 'insertAfter', 'remove'
]);
export const action = (action) => allowedActions.has(action);
