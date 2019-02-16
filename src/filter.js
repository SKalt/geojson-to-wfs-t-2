import {idFilter} from './xml.js';
import {unpack} from './utils.js';
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
