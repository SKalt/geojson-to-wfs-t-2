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
