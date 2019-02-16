(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.geojsonToWfst = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

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
    var results = '';

    for (var attrName in attrMappings) {
      var value = attrMappings[attrName];
      results += value ? " ".concat(attrName, "=\"").concat(value, "\"") : '';
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


  function multi(name, memberName, membercb, geom, gmlId) {
    var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    var srsName = params.srsName,
        gmlIds = params.gmlIds;
    var multi = "<gml:".concat(name).concat(attrs({
      srsName: srsName,
      'gml:id': gmlId
    }), ">");
    multi += "<gml:".concat(memberName, ">");
    geom.forEach(function (member, i) {
      var _gmlId = member.id || (gmlIds || [])[i] || '';

      if (name == 'MultiGeometry') {
        var memberType = member.type;
        member = member.coordinates;
        multi += membercb[memberType](member, _gmlId, params);
      } else {
        multi += membercb(member, _gmlId, params);
      }
    });
    multi += "</gml:".concat(memberName, ">");
    return multi + "</gml:".concat(name, ">");
  }
  /**
   * Converts an input geojson Point geometry to gml
   * @function
   * @param {Number[]} coords the coordinates member of the geojson geometry
   * @param {String|Number} gmlId the gml:id
   * @param {Params} params optional parameters
   * @returns {String} a string containing gml representing the input geometry
   */


  function point(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var srsName = params.srsName,
        srsDimension = params.srsDimension;
    return "<gml:Point".concat(attrs({
      srsName: srsName,
      'gml:id': gmlId
    }), ">") + "<gml:pos".concat(attrs({
      srsDimension: srsDimension
    }), ">") + orderCoords(coords).join(' ') + '</gml:pos>' + '</gml:Point>';
  }
  /**
   * Converts an input geojson LineString geometry to gml
   * @function
   * @param {Number[][]} coords the coordinates member of the geojson geometry
   * @param {String|Number} gmlId the gml:id
   * @param {Params} params optional parameters
   * @returns {String} a string containing gml representing the input geometry
   */

  function lineString(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var srsName = params.srsName,
        srsDimension = params.srsDimension;
    return "<gml:LineString".concat(attrs({
      srsName: srsName,
      'gml:id': gmlId
    }), ">") + "<gml:posList".concat(attrs({
      srsDimension: srsDimension
    }), ">") + coords.map(function (e) {
      return orderCoords(e).join(' ');
    }).join(' ') + '</gml:posList>' + '</gml:LineString>';
  }
  /**
   * Converts an input geojson LinearRing member of a polygon geometry to gml
   * @function
   * @param {Number[][]} coords the coordinates member of the geojson geometry
   * @param {String|Number} gmlId the gml:id
   * @param {Params} params optional parameters
   * @returns {String} a string containing gml representing the input geometry
   */

  function linearRing(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var srsName = params.srsName,
        srsDimension = params.srsDimension;
    return "<gml:LinearRing".concat(attrs({
      'gml:id': gmlId,
      srsName: srsName
    }), ">") + "<gml:posList".concat(attrs({
      srsDimension: srsDimension
    }), ">") + coords.map(function (e) {
      return orderCoords(e).join(' ');
    }).join(' ') + '</gml:posList>' + '</gml:LinearRing>';
  }
  /**
   * Converts an input geojson Polygon geometry to gml
   * @function
   * @param {Number[][][]} coords the coordinates member of the geojson geometry
   * @param {String|Number} gmlId the gml:id
   * @param {Params} params optional parameters
   * @returns {String} a string containing gml representing the input geometry
   */

  function polygon(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // geom.coordinates are arrays of LinearRings
    var srsName = params.srsName;
    var polygon = "<gml:Polygon".concat(attrs({
      srsName: srsName,
      'gml:id': gmlId
    }), ">") + '<gml:exterior>' + linearRing(coords[0]) + '</gml:exterior>';

    if (coords.length >= 2) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = coords.slice(1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var ring = _step.value;
          polygon += '<gml:interior>' + linearRing(ring) + '</gml:interior>';
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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

  function multiPoint(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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

  function multiLineString(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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

  function multiPolygon(coords, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
    return Object.entries(obj).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          type = _ref2[0],
          converter = _ref2[1];

      return _defineProperty({}, type[0].toUpperCase() + type.slice(1), converter);
    }).reduce(function (a, b) {
      return Object.assign(a, b);
    }, {});
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
    var converter = makeConverter(obj);
    return function (geom, gmlId, params) {
      var _arguments = arguments;

      var warn = function warn() {
        return new Error("unkown: ".concat(geom.type, " ") + _toConsumableArray(_arguments).join());
      };

      var convert = converter[geom.type] || warn;
      return convert(geom.coordinates || geom.geometries, gmlId, params);
    };
  }
  /**
   * a namespace to switch between geojson-handling functions by geojson.type
   * @const
   * @type {Object}
   */

  var allTypes = makeConverter({
    point: point,
    lineString: lineString,
    linearRing: linearRing,
    polygon: polygon,
    multiPoint: multiPoint,
    multiLineString: multiLineString,
    multiPolygon: multiPolygon
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

  function geometryCollection(geoms, gmlId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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

  var geomToGml = makeTranslator(Object.assign({
    geometryCollection: geometryCollection
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
  var array = function array() {
    var _ref;

    for (var _len = arguments.length, maybe = new Array(_len), _key = 0; _key < _len; _key++) {
      maybe[_key] = arguments[_key];
    }

    return (maybe[0].features || (_ref = []).concat.apply(_ref, maybe)).filter(Boolean);
  };
  /**
   * Ensures a layer.id format of an input id.
   * @function
   * @param {String} lyr layer name
   * @param {String} id id, possibly already in correct layer.id format.
   * @return {String} a correctly-formatted gml:id
   */

  var id$1 = function id(lyr, _id) {
    return /\./.exec(_id || '') ? _id : "".concat(lyr, ".").concat(_id);
  };
  /**
   * return a correctly-formatted typeName
   * @function
   * @param {String} ns namespace
   * @param {String} layer layer name
   * @param {String} typeName typeName to check
   * @return {String} a correctly-formatted typeName
   * @throws {Error} if typeName it cannot form a typeName from ns and layer
   */

  var typeName = function typeName(ns, layer, _typeName) {
    if (!_typeName && !(ns && layer)) {
      throw new Error("no typename possible: ".concat(JSON.stringify({
        typeName: _typeName,
        ns: ns,
        layer: layer
      }, null, 2)));
    }

    return _typeName || "".concat(ns, ":").concat(layer, "Type");
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
    return Object.keys(attrs).map(function (a) {
      return attrs[a] ? " ".concat(a, "=\"").concat(escape(attrs[a]), "\"") : '';
    }).join('');
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
    var tag = (ns ? "".concat(ns, ":") : '') + tagName;

    if (tagName) {
      return "<".concat(tag).concat(attrs$1(attrsObj)).concat(inner !== null ? ">".concat(inner, "</").concat(tag) : ' /', ">");
    } else {
      throw new Error('no tag supplied ' + JSON.stringify({
        ns: ns,
        tagName: tagName,
        attrsObj: attrsObj,
        inner: inner
      }, null, 2));
    }
  }
  /**
   * Creates a fes:ResourceId filter from a layername and id
   * @function
   * @param {String} lyr layer name of the filtered feature
   * @param {String} id feature id
   * @return {String} a filter-ecoding of the filter.
   */

  var idFilter = function idFilter(lyr, id$$1) {
    return "<fes:ResourceId rid=\"".concat(id$1(lyr, id$$1), "\"/>");
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

    var output = input.replace(/[<>&'"]/g, function (char) {
      switch (char) {
        case '<':
          return '&lt;';

        case '>':
          return '&gt;';

        case '&':
          return '&amp;';

        case "'":
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

  var useWhitelistIfAvailable = function useWhitelistIfAvailable(whitelist, properties, cb) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (whitelist || Object.keys(properties))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var prop = _step.value;
        var val = properties[prop];

        if (Number.isNaN(val)) {
          throw new Error('NaN is not allowed.');
        }

        if (val !== undefined) {
          cb(prop, val);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };
  var featureMembers = new Set(['properties', 'geometry', 'id', 'layer']);
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

  function unpack(feature, params) {
    var results = {};

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    for (var _i = 0; _i < args.length; _i++) {
      var arg = args[_i];

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
    var attrs = {};

    var makeNsAssignment = function makeNsAssignment(ns, uri) {
      return attrs["xmlns:".concat(ns)] = uri;
    };

    Object.keys(nsAssignments).forEach(function (ns) {
      makeNsAssignment(ns, nsAssignments[ns]);
    }); // check all ns's assigned

    var re = /(<|typeName=")(\w+):/g;
    var arr;
    var allNamespaces = new Set();

    while ((arr = re.exec(xml)) !== null) {
      allNamespaces.add(arr[2]);
    }

    if (allNamespaces.has('fes')) {
      makeNsAssignment('fes', 'http://www.opengis.net/fes/2.0');
    }
    makeNsAssignment('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    makeNsAssignment('gml', 'http://www.opengis.net/gml/3.2');
    makeNsAssignment('wfs', 'http://www.opengis.net/wfs/2.0');
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = allNamespaces[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var ns = _step2.value;

        if (!attrs['xmlns:' + ns]) {
          throw new Error("unassigned namespace ".concat(ns));
        }
      }
      /* , schemaLocations*/

    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return attrs;
  }
  /**
   * Returns a string alternating uri, whitespace, and the uri's schema's
   * location.
   * @param {Object} schemaLocations an object mapping uri:schemalocation
   * @return {string} a string that is a valid xsi:schemaLocation value.
   */

  function generateSchemaLines() {
    var schemaLocations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // TODO: add ns assignment check
    schemaLocations['http://www.opengis.net/wfs/2.0'] = 'http://schemas.opengis.net/wfs/2.0/wfs.xsd';
    var schemaLines = [];
    Object.entries(schemaLocations).forEach(function (entry) {
      return schemaLines.push(entry.join('\n'));
    });
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

  function translateFeatures(features) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var inner = '';
    var srsName = params.srsName,
        srsDimension = params.srsDimension;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      var _loop = function _loop() {
        var feature = _step3.value;

        // TODO: add whitelist support
        var _unpack = unpack(feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id', 'whitelist'),
            ns = _unpack.ns,
            layer = _unpack.layer,
            geometry_name = _unpack.geometry_name,
            properties = _unpack.properties,
            id$$1 = _unpack.id,
            whitelist = _unpack.whitelist;

        var fields = '';

        if (geometry_name) {
          fields += tag(ns, geometry_name, {}, geomToGml(feature.geometry, '', {
            srsName: srsName,
            srsDimension: srsDimension
          }));
        }

        useWhitelistIfAvailable(whitelist, properties, function (prop, val) {
          if (val === null) {
            return fields;
          }

          return fields += tag(ns, prop, {}, escape(properties[prop]));
        });
        inner += tag(ns, layer, {
          'gml:id': id$1(layer, id$$1)
        }, fields);
      };

      for (var _iterator3 = features[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = features[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var feature = _step.value;
          var layer = unpack(feature, params);
          filter += idFilter(layer, feature.id);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return "<fes:Filter>".concat(filter, "</fes:Filter>");
    } else {
      return filter;
    }
  }

  /* eslint-disable camelcase, new-cap */
  var _xml = xml,
      wfs$1 = _xml.wfs;
  /**
   * Returns a wfs:Insert tag wrapping a translated feature
   * @function
   * @param {Feature[]|FeatureCollection|Feature} features Feature(s) to pass to
   *  @see translateFeatures
   * @param {Params} params to be passed to @see translateFeatures, with optional
   * inputFormat, srsName, handle for the wfs:Insert tag.
   * @return {string} a wfs:Insert string.
   */

  function Insert(features) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    features = array(features);
    var inputFormat = params.inputFormat,
        srsName = params.srsName,
        handle = params.handle;

    if (!features.length) {
      console.warn('no features supplied');
      return '';
    }

    var toInsert = translateFeatures(features, params);
    return tag('wfs', 'Insert', {
      inputFormat: inputFormat,
      srsName: srsName,
      handle: handle
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

  function Update(features) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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

    var makeKvp = function makeKvp(prop, val, action$$1) {
      var value = '';

      if (val === null) {
        value = wfs$1('Value', {
          'xsi:nil': true
        }, '');
      } else if (val !== undefined) {
        value = wfs$1('Value', {}, val);
      }

      return wfs$1('Property', {}, wfs$1('ValueReference', {
        action: action$$1
      }, prop) + value);
    };

    if (params.properties) {
      var inputFormat = params.inputFormat,
          filter$$1 = params.filter,
          typeName$$1 = params.typeName,
          whitelist = params.whitelist;

      var _unpack = unpack(features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name'),
          srsName = _unpack.srsName,
          ns = _unpack.ns,
          layer = _unpack.layer,
          geometry_name = _unpack.geometry_name;

      typeName$$1 = typeName(ns, layer, typeName$$1);
      filter$$1 = filter(filter$$1, features, params);

      if (!filter$$1 && !features.length) {
        console.warn('neither features nor filter supplied');
        return '';
      }

      var fields = '';
      useWhitelistIfAvailable( // TODO: action attr
      whitelist, params.properties, function (k, v) {
        return fields += makeKvp(k, escape(v));
      });

      if (geometry_name) {
        fields += makeKvp(geometry_name, tag(ns, geometry_name, {}, geomToGml(params.geometry, '', {
          srsName: srsName
        })));
      }

      return wfs$1('Update', {
        inputFormat: inputFormat,
        srsName: srsName,
        typeName: typeName$$1
      }, fields + filter$$1);
    } else {
      // encapsulate each update in its own Update tag
      return features.map(function (f) {
        return Update(f, Object.assign({}, params, {
          properties: f.properties
        }));
      }).join('');
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

  function Delete(features) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    features = array(features);
    var filter$$1 = params.filter,
        typeName$$1 = params.typeName; // TODO: recur & encapsulate by typeName

    var _unpack2 = unpack(features[0] || {}, params, 'layer', 'ns'),
        ns = _unpack2.ns,
        layer = _unpack2.layer;

    typeName$$1 = typeName(ns, layer, typeName$$1);
    filter$$1 = filter(filter$$1, features, params);
    return wfs$1('Delete', {
      typeName: typeName$$1
    }, filter$$1);
  }
  /**
   * Returns a string wfs:Replace action.
   * @param {Feature[]|FeatureCollection|Feature} features feature(s) to replace
   * @param {Params} params with optional filter, inputFormat, srsName
   * @return {string} a string wfs:Replace action.
   */

  function Replace(features) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    features = ensure.array(features);

    var _unpack3 = unpack(features[0] || {}, params || {}, 'filter', 'inputFormat', 'srsName'),
        filter$$1 = _unpack3.filter,
        inputFormat = _unpack3.inputFormat,
        srsName = _unpack3.srsName;

    var replacements = translateFeatures([features[0]].filter(function (f) {
      return f;
    }), params || {
      srsName: srsName
    });
    filter$$1 = filter(filter$$1, features, params);
    return wfs$1('Replace', {
      inputFormat: inputFormat,
      srsName: srsName
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

  function Transaction(actions) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var transactionParams = ['srsName', 'lockId', 'releaseAction', 'handle'];
    var version = params.version,
        _params$nsAssignments = params.nsAssignments,
        nsAssignments = _params$nsAssignments === void 0 ? {} : _params$nsAssignments; // let converter = {Insert, Update, Delete};

    var _ref = actions || {},
        toInsert = _ref.insert,
        toUpdate = _ref.update,
        toDelete = _ref.delete;

    var finalActions = ''; // processedActions would be more accurate

    if (Array.isArray(actions) && actions.every(function (v) {
      return typeof v == 'string';
    })) {
      finalActions += actions.join('');
    } else if (typeof actions == 'string') {
      finalActions = actions;
    } else if ([toInsert, toUpdate, toDelete].some(function (e) {
      return e;
    })) {
      finalActions += Insert(toInsert, params) + Update(toUpdate, params) + Delete(toDelete, params);
    } else {
      throw new Error("unexpected input: ".concat(JSON.stringify(actions)));
    } // generate schemaLocation, xmlns's


    var attrs = generateNsAssignments(nsAssignments, actions);
    attrs['xsi:schemaLocation'] = generateSchemaLines(params.schemaLocations);
    attrs['service'] = 'WFS';
    attrs['version'] = /2\.0\.\d+/.exec(version || '') ? version : '2.0.0';
    transactionParams.forEach(function (param) {
      if (params[param]) {
        attrs[param] = params[param];
      }
    });
    return wfs$1('Transaction', attrs, finalActions);
  }

  exports.Insert = Insert;
  exports.Update = Update;
  exports.Delete = Delete;
  exports.Replace = Replace;
  exports.Transaction = Transaction;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
