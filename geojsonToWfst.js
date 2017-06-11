const gml3 = require('geojson-to-gml-3').geomToGml;

const xml = {
  'attrs': function(attrs){
    return Object.keys(attrs)
      .map((a) => attrs[a] ? ` ${a}="${attrs[a]}"` : '')
      .join('');
  },
  'tag': function(ns, tagName, attrs, inner){ // TODO: self-closing
    let tag = (ns ? `${ns}:` : '') + tagName;
    if (tagName){
      return `<${tag}${this.attrs(attrs)}>${inner}</${tag}>`;   
    } else {
      throw new Error('no tag supplied ' + JSON.stringify(arguments));
    }
  }
};
const wfs = (tagName, attrs, inner) => xml.tag('wfs', tagName, attrs, inner);
const ensureArray = (...maybe)=> maybe[0].features || [].concat(...maybe);
const ensureId = (lyr, id) => /\./.exec(id || '') ? id :`${lyr}.${id}`;
const ensureTypeName = (ns, layer, typeName) =>{
  if (!typeName && !(ns && layer)){
    throw new Error(`no typename possible: ${JSON.stringify({typeName, ns, layer})}`);
  }
  return typeName || `${ns}:${layer}Type`;
};
//const ensureObj = (maybe)=> maybe || {};
const iterateKvp = (obj, cb) => Object.keys(obj).forEach((k)=>cb(k, obj[k]));
const pass = () => '';
const useWhitelistIfAvailable = (whitelist, properties, cb) =>{
  for (let prop of whitelist || Object.keys(properties)){
    cb(prop, properties[prop]);
  }
};
const idFilter = (lyr, id) => `<fes:ResourceId rid="${ensureId(lyr, id)}"/>`;
const unpack = (()=>{
  let featureMembers = new Set(['properties', 'geometry', 'id', 'layer']);
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
const ensureAction = (()=>{
  const allowed = new Set(['replace', 'insertBefore', 'insertAfter', 'remove']);
  return (action) => allowed.has(action);
})();


function translateFeatures(features, params){
  let inner = '';
  let {srsName} = params;
  for (let feature of features){
    //TODO: add whitelist support
    let {ns, layer, geometry_name, properties, id} = unpack(
      feature, params, 'ns', 'layer', 'geometry_name', 'properties', 'id'
    );
    let fields = '';
    if (geometry_name){
      fields += xml.tag(ns, geometry_name, {}, gml3(feature.geometry, '', {srsName}));
    }
    for (let prop in properties){
      fields += xml.tag(ns, prop, {}, properties[prop]);
    }
    inner += xml.tag(ns, layer, {'gml:id': id}, fields);
  }
  return inner;
}

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
    let { srsName, ns, layer } = unpack(
      features[0] || {}, params, 'srsName', 'ns', 'layer');
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

function Delete(features, params={}){
  features = ensureArray(features);
  let {filter, typeName} = params; //TODO: recure & encapsulate by typeName
  let {ns, layer} = unpack(features[0] || {}, params, 'layer', 'ns');
  typeName = ensureTypeName(ns, layer, typeName);
  filter = ensureFilter(filter, features, params);
  return wfs('Delete', {typeName}, filter); 
}

function Replace(features, params){
  features = ensureArray(features);
  let {filter, inputFormat, srsName} = params;
  let replacements = translateFeatures(features, params);
  filter = ensureFilter(filter, features, params);
  return wfs('Replace', {inputFormat, srsName}, replacements + filter);
}

function Transaction(verbs, params={}){
  let {
    srsName, lockId, releaseAction, handle, inputFormat,
    nsAssignments, schemaLocations
  } = params;
  let converter = {Insert, Update, Delete};
  let {insert:toInsert, update:toUpdate, delete:toDelete} = verbs || {};
  let actions = '';
  
  if (Array.isArray(verbs) && verbs.every((v) => typeof(v) == 'string')){
    actions += verbs.join('');
  } else if (typeof(verbs) == 'string') {
    actions = verbs;
  }
    else if ([toInsert, toUpdate, toDelete].some((e) => e)){
    actions += Insert(toInsert, params) +
      Update(toUpdate, params) +
      Delete(toDelete, params);
  } else {
    throw new Error(`unexpected input: ${JSON.stringify(verbs)}`);
  }
  // generate schemaLocation, xmlns's
  nsAssignments = nsAssignments || {};
  schemaLocations = schemaLocations || {};
  let attrs = generateNsAssignments(nsAssignments, actions);
  attrs['xsi:schemaLocation'] = generateSchemaLines(params.schemaLocations);
  return wfs('Transaction', attrs, actions);
}

function generateNsAssignments(nsAssignments, xml){
  let attrs = {};
  const makeNsAssignment = (ns, uri) => attrs[`xmlns:${ns}`] = uri;
  for (let ns in nsAssignments){
    makeNsAssignment(ns, nsAssignments[ns]);
  }
  let defaultNamespaces = {
    'wfs': 'http://www.opengis.net/wfs/2.0',
    'fes': 'http://www.opengis.net/fes/2.0',
    'gml': 'http://www.opengis.net/gml/3.2',
    'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
  };
  // check all ns's assigned 
  var re = /(<|typeName=")(\w+):/g;
  var arr;
  var allNamespaces = new Set();
  while ((arr = re.exec(xml)) !== null){
    allNamespaces.add(arr[2]);
  }
  ['wfs', 'xsi', 'gml', 'fes'].filter((e)=>allNamespaces.has(e)).forEach(
    (usedNs) => makeNsAssignment(usedNs, defaultNamespaces[usedNs])
  );
  for (let ns of allNamespaces){
    if (!attrs['xmlns:' + ns]){
      throw new Error(`unassigned namespace ${ns}`);
    }
  }
  return attrs;
}

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
