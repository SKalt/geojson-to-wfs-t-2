const gml3 = require('geojson-to-gml-3').geomToGml;



const xml = {
  /**
   * Turns an object into a string of xml attribute key-value pairs.
   * @memberOf xml~
   * @function
   * @param {Object} attrs an object mapping attribute names to attribute values
   * @returns {String} a string of xml attribute key-value pairs
   */
  'attrs': function(attrs){
    return Object.keys(attrs)
      .map((a) => attrs[a] ? ` ${a}="${attrs[a]}"` : '')
      .join('');
  },
  /**
   * Creates a string xml tag.
   * @function 
   * @memberOf xml~
   * @param {String} ns the tag's namespace.
   * @param {String} tagName the tag name.
   * @param {Object} attrs @see attrs.
   * @param {String} inner inner xml.
   * @returns {String} an xml string.
   */
  'tag': function(ns, tagName, attrs, inner){ // TODO: self-closing
    let tag = (ns ? `${ns}:` : '') + tagName;
    if (tagName){
      return `<${tag}${this.attrs(attrs)}>${inner}</${tag}>`;   
    } else {
      throw new Error('no tag supplied ' + JSON.stringify(arguments));
    }
  }
};
/**
 * Shorthand for creating a wfs xml tag.
 * @param {String} tagName a valid wfs tag name.
 * @param {Object} attrs @see attrs.
 * @param {String} inner @see tag.
 */
const wfs = (tagName, attrs, inner) => xml.tag('wfs', tagName, attrs, inner);
/**
 * Ensures the result is an array.
 * @param {Array|Object} maybe a GeoJSON Feature or FeatureCollection object or an array thereof.
 */
const ensureArray = (...maybe)=> (maybe[0].features || [].concat(...maybe))
	.filter((f) => f);
/**
 * Ensures a layer.id format of an input id.
 * @param {String} lyr layer name
 * @param {String} id id, possibly already in correct layer.id format.
 * @returns {String} a correctly-formatted gml:id
 */
const ensureId = (lyr, id) => /\./.exec(id || '') ? id :`${lyr}.${id}`;
/**
 * returns a correctly-formatted typeName
 * @param {String} ns namespace
 * @param {String} layer layer name
 * @param {String} typeName typeName to check
 * @returns {String} a correctly-formatted typeName
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
 * @function 
 */
const pass = () => '';

/**
 * Iterates over the key-value pairs, filtering by a whitelist if available.
 * @param {Array<String>} whitelist a whitelist of property names
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
 * @param {String} lyr layer name of the filtered feature
 * @param {String} id feature id
 */
const idFilter = (lyr, id) => `<fes:ResourceId rid="${ensureId(lyr, id)}"/>`;

const unpack = (()=>{
  let featureMembers = new Set(['properties', 'geometry', 'id', 'layer']);
  /**
   * Resolves attributes from feature, then params unless they are normally
   * found in the feature
   * @param {Object} feature a geojson feature
   * @param {Object} params an object of backup / override parameters
   * @param {Array<String>} args parameter names to resolve from feature or params
   * @returns {Object} an object mapping each named parameter to its resolved value
   */
  return (feature, params, ...args) => {
    let results = {};
    for (let arg of args){
      if (arg === 'layer'){
	results[arg] = (params.layer || {}).id || params.layer
	  || (feature.layer||{}).id || feature.layer || '';
      } else if (!featureMembers.has(arg)){
        results[arg] = feature[arg] || params[arg] || '';
      } else {
        results[arg] = params[arg] || feature[arg]  || '';
      }
    }
    return results;
  };
})();

/**
 * Builds a filter from feature ids if one is not already input.
 * @param {String|undefined} filter a possible string filter
 * @param {Array<Object>} features an array of geojson feature objects
 * @param {Object} params an object of backup / override parameters
 * @returns {String} A filter, or the input filter if it was a string.
 */
const ensureFilter = (filter, features, params) => {
  if (!filter){
    filter = '';
    for (let feature of features){
      let layer = unpack(feature, params);
      filter += idFilter(layer, feature.id);
    }
    return `<fes:Filter>${filter}</fes:Filter>`;
  } else {
    return filter;
  }
};
//http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286
/**
 * Checks the type of the input action
 * @function 
 * @param {String | undefined} action 
 * @returns {Boolean} whether the action is allowed
*/
const ensureAction = (()=>{
  const allowed = new Set(['replace', 'insertBefore', 'insertAfter', 'remove']);
  return (action) => allowed.has(action);
})();


/**
 * Turns an array of geojson features into gml:_feature strings describing them.
 * @param {Array<Object>} features
 * @param {Object} params an object of backup / override parameters 
 * @param {String|undefined} ns an xml namespace alias 
 * @param {String|Object|undefined} layer a string layer name or {id}, where id
 * is the layer name
 * @param {String|undefined} geometry_name the name of the feature geometry field.
 * @param {Object} properties an object mappig feature field names to feature properties
 * @param {String|undefined} id a string feature id.
 * @param {Array<String>|undefined} whitelist an array of string field names to 
 * use from @see params.properties
 * @returns {String} a gml:_feature string.
 */
function translateFeatures(features, params={}){
  let inner = '';
  let {srsName} = params;
  for (let feature of features){
    //TODO: add whitelist support
    let {ns, layer, geometry_name, properties, id, whitelist} = unpack(
      feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id', 'whitelist'
    );
    let fields = '';
    if (geometry_name){
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
 * Returns a WFS Insert tag wrapping a translated feature.
 * @function 
 * @param {FeatureCollection} features
 * @param {Object} params @see translateFeature
 * @param {String|undefined} params.inputFormat inputFormat, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65
 * @param {String|undefined} params.srsName srsName, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66
 * @param {String|undefined} handle parameter, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44
 * @returns {String} a wfs:Insert string.
 */
function Insert(features, params={}){
  features = ensureArray(features);
  let {inputFormat, srsName, handle} = params;
  if (!features.length){
    console.warn('no features supplied');
    return '';
  }
  let toInsert = translateFeatures(features, params);
  return xml.tag('wfs', 'Insert', {inputFormat, srsName, handle}, toInsert);
}

/**
 * 
 * @param {Array<Feature>|FeatureCollection} features features to update
 * @param {Object} params
 * @returns {String} 
 */
function Update(features, params={}){
  features = ensureArray(features);
  const makeKvp = (prop, val, action) => wfs(
    // action cannot be defined, currently, but it would rearrange the order of
    //or remove the fields of targeted features.
    'Property', {},  wfs('ValueReference', {action}, prop) +
      wfs('Value', {}, val)
    // http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286
    // says a missing Value tag indicates a NULL value replacement
  );
  if (params.properties){
    let {handle, inputFormat, filter, typeName, whitelist} = params;
    let { srsName, ns, layer, geometry_name } = unpack(
      features[0] || {}, params, 'srsName', 'ns', 'layer', 'geometry_name');
    typeName = ensureTypeName(ns, layer, typeName);
    filter = ensureFilter(filter, features, params);
    if (!filter && !features.length){
      console.warn('neither features nor filter supplied');
      return '';
    }
    let fields = '';
    useWhitelistIfAvailable( // TODO: action attr
      whitelist, params.properties, (k, v) => fields += makeKvp(k,v)
    );
    if (geometry_name){
      fields +=  xml.tag(
	ns, geometry_name, {}, gml3(params.geometry, '', {srsName})
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
 * 
 * @param {} features
 * @param {} params
 * @returns {String} 
 */
function Delete(features, params={}){
  features = ensureArray(features);
  let {filter, typeName} = params; //TODO: recure & encapsulate by typeName
  let {ns, layer} = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName = ensureTypeName(ns, layer, typeName);
  filter = ensureFilter(filter, features, params);
  return wfs('Delete', {typeName}, filter); 
}

/**
 * Returns a string wfs:Replace action
 * @param {Array<Feature>|FeatureCollection|Feature} features feature(s) to 
 * @param {Object} params
 * @param {String} params.filter a string fes:Filter.
 * @param {String} params.inpurFormat 
 * @returns {String} 
 */
function Replace(features, params={}){
  features = ensureArray(features);
  let {filter, inputFormat, srsName} = unpack (
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
 * @param {Object|Array<String>|String} actions an object mapping {Insert, Update,
 * Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action 
 * string(s) to wrap in a transaction.
 * @param {Object} params
 * @returns {String} A wfs:transaction wrapping the input actions.
 * @throws {Error} if `actions` is not an array of strings, a string, or 
 * {Insert, Update, Delete}, where each action are valid inputs to the
 * eponymous function.
 */
function Transaction(actions, params={}){
  let {
    srsName, lockId, releaseAction, handle, inputFormat,
    nsAssignments, schemaLocations, version
  } = params;
  let converter = {Insert, Update, Delete};
  let {insert:toInsert, update:toUpdate, delete:toDelete} = actions || {};
  let finalActions = ''; // processedActions would be more accurate
  
  if (Array.isArray(actions) && actions.every((v) => typeof(v) == 'string')){
    finalActions += actions.join('');
  } else if (typeof(actions) == 'string') {
    finalActions = actions;
  }
    else if ([toInsert, toUpdate, toDelete].some((e) => e)){
    finalActions += Insert(toInsert, params) +
      Update(toUpdate, params) +
      Delete(toDelete, params);
  } else {
    throw new Error(`unexpected input: ${JSON.stringify(actions)}`);
  }
  // generate schemaLocation, xmlns's
  nsAssignments = nsAssignments || {};
  schemaLocations = schemaLocations || {};
  let attrs = generateNsAssignments(nsAssignments, actions);
  attrs['xsi:schemaLocation'] =  generateSchemaLines(params.schemaLocations);
  attrs['service'] = 'WFS';
  attrs['version'] = /2\.0\.\d+/.exec(version || '') ? version : '2.0.0';
  return wfs('Transaction', attrs, finalActions);
}

/**
 * Generates xmlns:ns="uri" definitions for a wfs:Transaction
 * @param {} nsAssignments
 * @param {} xml
 * @returns {Object} a 
 * @throws {Error} if any namespace used within xml is missing a URI definition
 */
function generateNsAssignments(nsAssignments, xml){
  let attrs = {};
  const makeNsAssignment = (ns, uri) => attrs[`xmlns:${ns}`] = uri;
  for (let ns in nsAssignments){
    makeNsAssignment(ns, nsAssignments[ns]);
  }
  // check all ns's assigned 
  var re = /(<|typeName=")(\w+):/g;
  var arr;
  var allNamespaces = new Set();
  while ((arr = re.exec(xml)) !== null){
    allNamespaces.add(arr[2]);
  }
  if (allNamespaces.has('fes')){
    makeNsAssignment('fes', 'http://www.opengis.net/fes/2.0');
  };
  makeNsAssignment('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  makeNsAssignment('gml', 'http://www.opengis.net/gml/3.2');
  makeNsAssignment('wfs', 'http://www.opengis.net/wfs/2.0');

  for (let ns of allNamespaces){
    if (!attrs['xmlns:' + ns]){
      throw new Error(`unassigned namespace ${ns}`);
    }
  }
  return attrs;
}

/**
 * Returns a string alternating uri, whitespace, and the uri's schema's location.
 * @param {Object} schemaLocations an object mapping uri:schemalocation
 * @returns {String} a string that is a valid xsi:schemaLocation value.
 */
function generateSchemaLines(schemaLocations={}){
  //TODO: add ns assignment check
  schemaLocations['http://www.opengis.net/wfs/2.0'] = 
    'http://schemas.opengis.net/wfs/2.0/wfs.xsd';
  var schemaLines = [];
  for (let uri in schemaLocations){
    schemaLines.push(`${uri}\n${schemaLocations[uri]}`);
  }
  return schemaLines.join('\n');
}

module.exports = {Insert, Update, Replace, Delete, Transaction};
