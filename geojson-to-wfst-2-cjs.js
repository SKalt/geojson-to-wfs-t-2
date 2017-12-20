'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* eslint-disable no-console */
/* 
 Note this can only convert what geojson can store: simple feature types, not
 coverage, topology, etc.
 */

/** 
 * geojson coordinates are in longitude/easting, latitude/northing [,elevation]
 * order by [RFC-7946 § 3.1.1]{@link https://tools.ietf.org/html/rfc7946#section-3.1.1}.
 * however, you may use a CRS that follows a latitude/easting,
 * longitude/northing, [,elevation] order.
 */
var coordinateOrder = true;
function orderCoords(coords){
  if (coordinateOrder){
    return coords;
  } 
  if (coords[2]){
    return [coords[1], coords[0], coords[2]];
  } 
  return coords.reverse();
}



/** @private*/
function attrs(attrMappings){
  let results = '';
  for (let attrName in attrMappings){
    let value = attrMappings[attrName];
    results += (value ? ` ${attrName}="${value}"` : '');
  }
  return results;
}

/**
 * checks outer scope for gmlId argument/variable
 * @function 
 */
const enforceGmlId = (gmlId) =>{
  if (!gmlId){
    console.warn('No gmlId supplied');
  }
};

/**
 * A handler to compile geometries to multigeometries
 * @function
 * @param {string} name the name of the target multigeometry
 * @param {string} memberName the gml:tag of each multigeometry member.
 * @param {Object[]|Array} geom an array of geojson geometries
 * @param {string|number} gmlId the gml:id of the multigeometry
 * @param {Object} params optional parameters. Omit gmlIds at your own risk, however.
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number[]|string[]} params.gmlIds an array of number/string gml:ids of the member geometries.
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml describing the input multigeometry
 * @throws {Error} if a member geometry cannot be converted to gml
 */
function multi(name, memberName, membercb, geom, gmlId, params={}){
  enforceGmlId(gmlId);
  var {srsName, gmlIds} = params;
  let multi = `<gml:${name}${attrs({srsName, 'gml:id':gmlId})}>`;
  multi += `<gml:${memberName}>`;
  geom.forEach(function(member, i){
    let _gmlId = member.id || (gmlIds || [])[i] || '';
    if (name == 'MultiGeometry'){
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
 * @param {number[]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function Point(coords, gmlId, params={}){
  enforceGmlId(gmlId);
  var {srsName:srsName, srsDimension:srsDimension} = params;
  return `<gml:Point${attrs({srsName:srsName, 'gml:id': gmlId})}>` +
    `<gml:pos${attrs({srsDimension})}>` +
    orderCoords(coords).join(' ') +
    '</gml:pos>' +
    '</gml:Point>';
}
/**
 * Converts an input geojson LineString geometry to gml
 * @function 
 * @param {number[][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function LineString(coords, gmlId, params={}){
  enforceGmlId(gmlId);
  var {srsName:srsName, srsDimension:srsDimension} = params;
  return `<gml:LineString${attrs({srsName, 'gml:id':gmlId})}>` +
    `<gml:posList${attrs({srsDimension})}>` +
    coords.map((e)=>orderCoords(e).join(' ')).join(' ') + 
    '</gml:posList>' +
    '</gml:LineString>';
}
/**
 * Converts an input geojson LinearRing member of a polygon geometry to gml
 * @function 
 * @param {number[][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function LinearRing(coords, gmlId, params={}){
  enforceGmlId(gmlId);
  var {srsName:srsName, srsDimension:srsDimension} = params;
  return `<gml:LinearRing${attrs({'gml:id':gmlId, srsName})}>` +
    `<gml:posList${attrs({srsDimension})}>` +
    coords.map((e)=>orderCoords(e).join(' ')).join(' ') + 
    '</gml:posList>' + 
    '</gml:LinearRing>';
}
/**
 * Converts an input geojson Polygon geometry to gml
 * @function 
 * @param {number[][][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function Polygon(coords, gmlId, params={}){
  enforceGmlId(gmlId);
  // geom.coordinates are arrays of LinearRings
  var {srsName} = params;
  let polygon = `<gml:Polygon${attrs({srsName, 'gml:id':gmlId})}>` +
        '<gml:exterior>' +
        LinearRing(coords[0]) +
        '</gml:exterior>';
  if (coords.length >= 2){
    for (let linearRing of coords.slice(1)){
      polygon += '<gml:interior>' +
        LinearRing(linearRing) + 
        '</gml:interior>';
    }
  }
  polygon += '</gml:Polygon>';
  return polygon;
}
/**
 * Converts an input geojson MultiPoint geometry to gml
 * @function
 * @param {number[][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function MultiPoint(coords, gmlId, params={}){
  enforceGmlId(gmlId);
  return multi('MultiPoint', 'pointMembers', Point, coords, gmlId, params);
}

/**
 * Converts an input geojson MultiLineString geometry to gml
 * @function 
 * @param {number[][][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function MultiLineString(coords, gmlId, params={}){
  return multi('MultiCurve', 'curveMembers', LineString, coords, gmlId, params);
}
/**
 * Converts an input geojson MultiPolygon geometry to gml
 * @function 
 * @param {number[][][][]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function MultiPolygon(coords, gmlId, params={}){
  return multi('MultiSurface', 'surfaceMembers', Polygon, coords, gmlId, params);
}
/** @const 
 * @desc a namespace to switch between geojson-handling functions by geojson.type
 */
const converter = {
  Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString,
  MultiPolygon, GeometryCollection
};
/**
 * Converts an input geojson GeometryCollection geometry to gml
 * @function 
 * @param {Object[]} coords the coordinates member of the geojson geometry
 * @param {string|number} gmlId the gml:id
 * @param {Object} params optional parameters
 * @param {string|undefined} params.srsName as string specifying SRS
 * @param {number|string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @returns {string} a string containing gml representing the input geometry
 */
function GeometryCollection(geoms, gmlId, params={}){
  return multi('MultiGeometry', 'geometryMembers', converter,
               geoms, gmlId, params);
}

/**
 * Translates any geojson geometry into GML 3.2.1
 * @public 
 * @function 
 * @param {Object} geom a geojson geometry object
 * @param {Array|undefined} geom.coordinates the nested array of coordinates forming the geometry
 * @param {Object[]|undefined} geom.geometries for a GeometryCollection only, the array of member geometry objects
 * @param {string|number} gmlId the gml:id of the geometry
 * @param {object} params optional parameters
 * @param {string|undefined} params.srsName a string specifying the SRS
 * @param {string|undefined} params.srsDimension the dimensionality of each coordinate, i.e. 2 or 3.
 * @param {number[]|string[]|undefined} gmlIds  an array of number/string gml:ids of the member geometries of a multigeometry.
 * @returns {string} a valid gml string describing the input geojson geometry
 */
function geomToGml(geom, gmlId, params){
  return converter[geom.type](
    geom.coordinates || geom.geometries,
    gmlId,
    params
  );
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.3' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document) && _isObject(document.createElement);
var _domCreate = function (it) {
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _redefine = createCommonjsModule(function (module) {
var SRC = _uid('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

_core.inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === _global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if (target) _redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});
var _shared = function (key) {
  return store[key] || (store[key] = {});
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)



var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var f$1 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$1
};

var isEnum = _objectPie.f;
var _objectToArray = function (isEntries) {
  return function (it) {
    var O = _toIobject(it);
    var keys = _objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

// https://github.com/tc39/proposal-object-values-entries

var $entries = _objectToArray(true);

_export(_export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

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
  'attrs': function (attrs) {
    return Object.keys(attrs).map(a => attrs[a] ? ` ${a}="${attrs[a]}"` : '').join('');
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
  'tag': function (ns, tagName, attrs, inner) {
    // TODO: self-closing
    let tag = (ns ? `${ns}:` : '') + tagName;
    if (tagName) {
      return `<${tag}${this.attrs(attrs)}>${inner}</${tag}>`;
    } else {
      throw new Error('no tag supplied ' + JSON.stringify([ns, tagName, attrs, inner]));
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
const ensureArray = (...maybe) => (maybe[0].features || [].concat(...maybe)).filter(f => f);
/**
 * Ensures a layer.id format of an input id.
 * @private
 * @function
 * @param {string} lyr layer name
 * @param {string} id id, possibly already in correct layer.id format.
 * @return {string} a correctly-formatted gml:id
 */
const ensureId = (lyr, id) => /\./.exec(id || '') ? id : `${lyr}.${id}`;
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
const ensureTypeName = (ns, layer, typeName) => {
  if (!typeName && !(ns && layer)) {
    throw new Error(`no typename possible: ${JSON.stringify({ typeName, ns, layer })}`);
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
const useWhitelistIfAvailable = (whitelist, properties, cb) => {
  for (let prop of whitelist || Object.keys(properties)) {
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

const unpack = (() => {
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
        results[arg] = (params.layer || {}).id || params.layer || (feature.layer || {}).id || feature.layer || '';
      } else if (!featureMembers.has(arg)) {
        results[arg] = feature[arg] || params[arg] || '';
      } else {
        results[arg] = params[arg] || feature[arg] || '';
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
}

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
function translateFeatures(features, params = {}) {
  let inner = '';
  let { srsName } = params;
  for (let feature of features) {
    //TODO: add whitelist support
    let { ns, layer, geometry_name, properties, id, whitelist } = unpack(feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id', 'whitelist');
    let fields = '';
    if (geometry_name) {
      fields += xml.tag(ns, geometry_name, {}, geomToGml(feature.geometry, '', { srsName }));
    }
    useWhitelistIfAvailable(whitelist, properties, (prop, val) => fields += xml.tag(ns, prop, {}, properties[prop]));
    inner += xml.tag(ns, layer, { 'gml:id': ensureId(layer, id) }, fields);
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
function Insert(features, params = {}) {
  features = ensureArray(features);
  let { inputFormat, srsName, handle } = params;
  if (!features.length) {
    console.warn('no features supplied');
    return '';
  }
  let toInsert = translateFeatures(features, params);
  return xml.tag('wfs', 'Insert', { inputFormat, srsName, handle }, toInsert);
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
  const makeKvp = (prop, val, action) => wfs('Property', {}, wfs('ValueReference', { action }, prop) + (val !== undefined ? wfs('Value', {}, val) : ''));
  if (params.properties) {
    let { /* handle, */inputFormat, filter, typeName, whitelist } = params;
    let { srsName, ns, layer, geometry_name } = unpack(features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name');
    typeName = ensureTypeName(ns, layer, typeName);
    filter = ensureFilter(filter, features, params);
    if (!filter && !features.length) {
      console.warn('neither features nor filter supplied');
      return '';
    }
    let fields = '';
    useWhitelistIfAvailable( // TODO: action attr
    whitelist, params.properties, (k, v) => fields += makeKvp(k, v));
    if (geometry_name) {
      fields += makeKvp(geometry_name, xml.tag(ns, geometry_name, {}, geomToGml(params.geometry, '', { srsName })));
    }
    return wfs('Update', { inputFormat, srsName, typeName }, fields + filter);
  } else {
    // encapsulate each update in its own Update tag
    return features.map(f => Update(f, Object.assign({}, params, { properties: f.properties }))).join('');
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
  features = ensureArray(features);
  let { filter, typeName } = params; // TODO: recurse & encapsulate by typeName
  let { ns, layer } = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName = ensureTypeName(ns, layer, typeName);
  filter = ensureFilter(filter, features, params);
  return wfs('Delete', { typeName }, filter);
}

/**
 * Returns a string wfs:Replace action.
 * @param {Feature[]|FeatureCollection|Feature} features feature(s) to replace
 * @param {Params} params with optional filter, inputFormat, srsName
 * @return {string} a string wfs:Replace action.
 */
function Replace(features, params = {}) {
  features = ensureArray(features);
  let { filter, inputFormat, srsName } = unpack(features[0] || {}, params || {}, 'filter', 'inputFormat', 'srsName');
  let replacements = translateFeatures([features[0]].filter(f => f), params || { srsName });
  filter = ensureFilter(filter, features, params);
  return wfs('Replace', { inputFormat, srsName }, replacements + filter);
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
function Transaction(actions, params = {}) {
  const transactionParams = ['srsName', 'lockId', 'releaseAction', 'handle'];
  let {
    /* srsName, lockId, releaseAction, handle, inputFormat, */version, // optional
    nsAssignments = {} /*, schemaLocations*/ // required
  } = params;
  // let converter = {Insert, Update, Delete};
  let { insert: toInsert, update: toUpdate, delete: toDelete } = actions || {};
  let finalActions = ''; // processedActions would be more accurate

  if (Array.isArray(actions) && actions.every(v => typeof v == 'string')) {
    finalActions += actions.join('');
  } else if (typeof actions == 'string') {
    finalActions = actions;
  } else if ([toInsert, toUpdate, toDelete].some(e => e)) {
    finalActions += Insert(toInsert, params) + Update(toUpdate, params) + Delete(toDelete, params);
  } else {
    throw new Error(`unexpected input: ${JSON.stringify(actions)}`);
  }
  // generate schemaLocation, xmlns's
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
  } /*, schemaLocations*/
  return attrs;
}

/**
 * Returns a string alternating uri, whitespace, and the uri's schema's
 * location.
 * @private
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

exports.Insert = Insert;
exports.Update = Update;
exports.Replace = Replace;
exports.Delete = Delete;
exports.Transaction = Transaction;
