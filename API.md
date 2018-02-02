## Modules

<dl>
<dt><a href="#module_ensure">ensure</a></dt>
<dd><p>common checks, coersions, and informative errors/ warnings</p>
</dd>
<dt><a href="#module_geojsonToWfst">geojsonToWfst</a></dt>
<dd><p>A library of functions to turn geojson into WFS transactions.</p>
</dd>
<dt><a href="#module_utils">utils</a></dt>
<dd><p>Common utilities for handling parameters for creation of WFS trasactions.</p>
</dd>
<dt><a href="#module_xml">xml</a></dt>
<dd><p>xml utilities.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Params">Params</a> : <code>Object</code></dt>
<dd><p>An object containing optional named parameters.</p>
</dd>
<dt><a href="#TransactionParams">TransactionParams</a> : <code>Object</code></dt>
<dd><p>An object containing optional named parameters for a transaction in addition
to parameters used elsewhere.</p>
</dd>
<dt><a href="#Feature">Feature</a> : <code>Object</code></dt>
<dd><p>A GeoJSON feature with the following optional foreign members (see
<a href="https://tools.ietf.org/html/rfc7946#section-6">rfc7965 § 6</a>).
or an object with some of the following members.
Members of Feature will be used over those in Params except for layer, id,
and properties.</p>
</dd>
<dt><a href="#FeatureCollection">FeatureCollection</a> : <code>Object</code></dt>
<dd><p>a GeoJSON FeatureCollection with optional foreign members as in Feature.</p>
</dd>
</dl>

<a name="module_ensure"></a>

## ensure
common checks, coersions, and informative errors/ warnings


* [ensure](#module_ensure)
    * _static_
        * [.id(lyr, id)](#module_ensure.id) ⇒ <code>String</code>
        * [.typeName(ns, layer, typeName)](#module_ensure.typeName) ⇒ <code>String</code>
        * [.filter(filter, features, params)](#module_ensure.filter) ⇒ <code>String</code>
    * _inner_
        * [~allowedActions(action)](#module_ensure..allowedActions) ⇒ <code>Boolean</code>

<a name="module_ensure.id"></a>

### ensure.id(lyr, id) ⇒ <code>String</code>
Ensures a layer.id format of an input id.

**Kind**: static method of [<code>ensure</code>](#module_ensure)  
**Returns**: <code>String</code> - a correctly-formatted gml:id  

| Param | Type | Description |
| --- | --- | --- |
| lyr | <code>String</code> | layer name |
| id | <code>String</code> | id, possibly already in correct layer.id format. |

<a name="module_ensure.typeName"></a>

### ensure.typeName(ns, layer, typeName) ⇒ <code>String</code>
return a correctly-formatted typeName

**Kind**: static method of [<code>ensure</code>](#module_ensure)  
**Returns**: <code>String</code> - a correctly-formatted typeName  
**Throws**:

- <code>Error</code> if typeName it cannot form a typeName from ns and layer


| Param | Type | Description |
| --- | --- | --- |
| ns | <code>String</code> | namespace |
| layer | <code>String</code> | layer name |
| typeName | <code>String</code> | typeName to check |

<a name="module_ensure.filter"></a>

### ensure.filter(filter, features, params) ⇒ <code>String</code>
Builds a filter from feature ids if one is not already input.

**Kind**: static method of [<code>ensure</code>](#module_ensure)  
**Returns**: <code>String</code> - A filter, or the input filter if it was a string.  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>String</code> | a possible string filter |
| features | <code>Array.&lt;Object&gt;</code> | an array of geojson feature objects |
| params | <code>Object</code> | an object of backup / override parameters |

<a name="module_ensure..allowedActions"></a>

### ensure~allowedActions(action) ⇒ <code>Boolean</code>
Checks the type of the input action

**Kind**: inner method of [<code>ensure</code>](#module_ensure)  
**Returns**: <code>Boolean</code> - whether the action is allowed  

| Param | Type |
| --- | --- |
| action | <code>String</code> | 

<a name="module_geojsonToWfst"></a>

## geojsonToWfst
A library of functions to turn geojson into WFS transactions.


* [geojsonToWfst](#module_geojsonToWfst)
    * [.Insert(features, params)](#module_geojsonToWfst.Insert) ⇒ <code>string</code>
    * [.Update(features, params)](#module_geojsonToWfst.Update) ⇒ <code>string</code>
    * [.Delete(features, params)](#module_geojsonToWfst.Delete) ⇒ <code>string</code>
    * [.Replace(features, params)](#module_geojsonToWfst.Replace) ⇒ <code>string</code>
    * [.Transaction(actions, params)](#module_geojsonToWfst.Transaction) ⇒ <code>string</code>

<a name="module_geojsonToWfst.Insert"></a>

### geojsonToWfst.Insert(features, params) ⇒ <code>string</code>
Returns a wfs:Insert tag wrapping a translated feature

**Kind**: static method of [<code>geojsonToWfst</code>](#module_geojsonToWfst)  
**Returns**: <code>string</code> - a wfs:Insert string.  
**See**: translateFeatures  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) | Feature(s) to pass to |
| params | [<code>Params</code>](#Params) | to be passed to @see translateFeatures, with optional inputFormat, srsName, handle for the wfs:Insert tag. |

<a name="module_geojsonToWfst.Update"></a>

### geojsonToWfst.Update(features, params) ⇒ <code>string</code>
Updates the input features in bulk with params.properties or by id.

**Kind**: static method of [<code>geojsonToWfst</code>](#module_geojsonToWfst)  
**Returns**: <code>string</code> - a string wfs:Upate action.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) | features to update.  These may pass in geometry_name, properties, and layer (overruled by params) and ns, layer, srsName (overruling params). |
| params | [<code>Params</code>](#Params) | with optional properties, ns (namespace), layer,  geometry_name, filter, typeName, whitelist. |

<a name="module_geojsonToWfst.Delete"></a>

### geojsonToWfst.Delete(features, params) ⇒ <code>string</code>
Creates a wfs:Delete action, creating a filter and typeName from feature ids
if none are supplied.

**Kind**: static method of [<code>geojsonToWfst</code>](#module_geojsonToWfst)  
**Returns**: <code>string</code> - a wfs:Delete string.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) |  |
| params | [<code>Params</code>](#Params) | optional parameter overrides. |
| [params.ns] | <code>string</code> | @see Params.ns |
| [params.layer] | <code>string</code> \| <code>Object</code> | @see Params.layer |
| [params.typeName] | <code>string</code> | @see Params.typeName. This will be inferred from feature/params layer and ns if this is left undefined. |
| [params.filter] | <code>filter</code> | @see Params.filter.  This will be inferred from feature ids and layer(s) if left undefined (@see ensure.filter). |

<a name="module_geojsonToWfst.Replace"></a>

### geojsonToWfst.Replace(features, params) ⇒ <code>string</code>
Returns a string wfs:Replace action.

**Kind**: static method of [<code>geojsonToWfst</code>](#module_geojsonToWfst)  
**Returns**: <code>string</code> - a string wfs:Replace action.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) | feature(s) to replace |
| params | [<code>Params</code>](#Params) | with optional filter, inputFormat, srsName |

<a name="module_geojsonToWfst.Transaction"></a>

### geojsonToWfst.Transaction(actions, params) ⇒ <code>string</code>
Wraps the input actions in a wfs:Transaction.

**Kind**: static method of [<code>geojsonToWfst</code>](#module_geojsonToWfst)  
**Returns**: <code>string</code> - A wfs:transaction wrapping the input actions.  
**Throws**:

- <code>Error</code> if `actions` is not an array of strings, a string, or
{@see Insert, @see Update, @see Delete}, where each action are valid inputs
to the eponymous function.


| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Object</code> \| <code>Array.&lt;string&gt;</code> \| <code>string</code> | an object mapping {Insert, Update, Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action string(s) to wrap in a transaction. |
| params | [<code>TransactionParams</code>](#TransactionParams) | optional srsName, lockId, releaseAction,  handle, inputFormat, version, and required nsAssignments, schemaLocations. |

<a name="module_utils"></a>

## utils
Common utilities for handling parameters for creation of WFS trasactions.


* [utils](#module_utils)
    * [.useWhitelistIfAvailable(whitelist, properties, cb)](#module_utils.useWhitelistIfAvailable)
    * [.unpack(feature, params, args)](#module_utils.unpack) ⇒ <code>Object</code>
    * [.generateNsAssignments(nsAssignments, xml)](#module_utils.generateNsAssignments) ⇒ <code>Object</code>
    * [.generateSchemaLines(schemaLocations)](#module_utils.generateSchemaLines) ⇒ <code>string</code>
    * [.translateFeatures(features, params)](#module_utils.translateFeatures) ⇒ <code>String</code>

<a name="module_utils.useWhitelistIfAvailable"></a>

### utils.useWhitelistIfAvailable(whitelist, properties, cb)
Iterates over the key-value pairs, filtering by a whitelist if available.

**Kind**: static method of [<code>utils</code>](#module_utils)  

| Param | Type | Description |
| --- | --- | --- |
| whitelist | <code>Array.&lt;String&gt;</code> | a whitelist of property names |
| properties | <code>Object</code> | an object mapping property names to values |
| cb | <code>function</code> | a function to call on each (whitelisted key, value) pair |

<a name="module_utils.unpack"></a>

### utils.unpack(feature, params, args) ⇒ <code>Object</code>
Resolves attributes from feature, then params unless they are normally
found in the feature

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>Object</code> - an object mapping each named parameter to its resolved
value  

| Param | Type | Description |
| --- | --- | --- |
| feature | <code>Object</code> | a geojson feature |
| params | <code>Object</code> | an object of backup / override parameters |
| args | <code>Array.&lt;String&gt;</code> | parameter names to resolve from feature or params |

<a name="module_utils.generateNsAssignments"></a>

### utils.generateNsAssignments(nsAssignments, xml) ⇒ <code>Object</code>
Generates an object to be passed to @see xml.attrs xmlns:ns="uri" definitions
for a wfs:Transaction

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>Object</code> - an object mapping each ns to its URI as 'xmlns:ns' : 'URI'.  
**Throws**:

- <code>Error</code> if any namespace used within `xml` is missing a URI
definition


| Param | Type | Description |
| --- | --- | --- |
| nsAssignments | <code>Object</code> | @see Params.nsAssignments |
| xml | <code>String</code> | arbitrary xml. |

<a name="module_utils.generateSchemaLines"></a>

### utils.generateSchemaLines(schemaLocations) ⇒ <code>string</code>
Returns a string alternating uri, whitespace, and the uri's schema's
location.

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - a string that is a valid xsi:schemaLocation value.  

| Param | Type | Description |
| --- | --- | --- |
| schemaLocations | <code>Object</code> | an object mapping uri:schemalocation |

<a name="module_utils.translateFeatures"></a>

### utils.translateFeatures(features, params) ⇒ <code>String</code>
Turns an array of geojson features into gml:_feature strings describing them.

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>String</code> - a gml:_feature string.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) | an array of features to translate to gml:_features. |
| params | [<code>Params</code>](#Params) | an object of backup / override parameters |

<a name="module_xml"></a>

## xml
xml utilities.


* [xml](#module_xml)
    * [.wfs](#module_xml.wfs) ⇒ <code>String</code>
    * [.attrs(attrs)](#module_xml.attrs) ⇒ <code>String</code>
    * [.tag(ns, tagName, attrsObj, inner)](#module_xml.tag) ⇒ <code>String</code>
    * [.idFilter(lyr, id)](#module_xml.idFilter) ⇒ <code>String</code>
    * [.escape(input)](#module_xml.escape) ⇒ <code>String</code>

<a name="module_xml.wfs"></a>

### xml.wfs ⇒ <code>String</code>
Shorthand for creating a wfs xml tag.

**Kind**: static constant of [<code>xml</code>](#module_xml)  
**Returns**: <code>String</code> - a wfs element.  

| Param | Type | Description |
| --- | --- | --- |
| tagName | <code>String</code> | a valid wfs tag name. |
| attrsObj | <code>Object</code> | @see xml.attrs. |
| inner | <code>String</code> | @see xml.tag. |

<a name="module_xml.attrs"></a>

### xml.attrs(attrs) ⇒ <code>String</code>
Turns an object into a string of xml attribute key-value pairs.

**Kind**: static method of [<code>xml</code>](#module_xml)  
**Returns**: <code>String</code> - a string of xml attribute key-value pairs  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>Object</code> | an object mapping attribute names to attribute values |

<a name="module_xml.tag"></a>

### xml.tag(ns, tagName, attrsObj, inner) ⇒ <code>String</code>
Creates a string xml tag.

**Kind**: static method of [<code>xml</code>](#module_xml)  
**Returns**: <code>String</code> - an xml string.  

| Param | Type | Description |
| --- | --- | --- |
| ns | <code>String</code> | the tag's xml namespace abbreviation. |
| tagName | <code>String</code> | the tag name. |
| attrsObj | <code>Object</code> | @see xml.attrs. |
| inner | <code>String</code> | inner xml. |

<a name="module_xml.idFilter"></a>

### xml.idFilter(lyr, id) ⇒ <code>String</code>
Creates a fes:ResourceId filter from a layername and id

**Kind**: static method of [<code>xml</code>](#module_xml)  
**Returns**: <code>String</code> - a filter-ecoding of the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lyr | <code>String</code> | layer name of the filtered feature |
| id | <code>String</code> | feature id |

<a name="module_xml.escape"></a>

### xml.escape(input) ⇒ <code>String</code>
Creates an xml-safe string from a given input string

**Kind**: static method of [<code>xml</code>](#module_xml)  
**Returns**: <code>String</code> - XML-safe string  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | String to escape |

<a name="Params"></a>

## Params : <code>Object</code>
An object containing optional named parameters.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ns | <code>string</code> | an xml namespace alias. |
| layer | <code>string</code> \| <code>Object</code> | a string layer name or {id}, where id is the layer name |
| geometry_name | <code>string</code> | the name of the feature geometry field. |
| properties | <code>Object</code> | an object mapping feature field names to feature properties |
| id | <code>string</code> | a string feature id. |
| whitelist | <code>Array.&lt;string&gt;</code> | an array of string field names to use from @see Params.properties |
| inputFormat | <code>string</code> | inputFormat, as specified at [OGC 09-025r2 § 7.6.5.4](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65). |
| srsName | <code>string</code> | srsName, as specified at [OGC 09-025r2 § 7.6.5.5](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66). if undefined, the gml3 module will default to 'EPSG:4326'. |
| handle | <code>string</code> | handle parameter, as specified at [OGC 09-025r2 § 7.6.2.6 ](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44) |
| filter | <code>string</code> | a string fes:Filter. |
| typeName | <code>string</code> | a string specifying the feature type within its namespace. See [09-025r2 § 7.9.2.4.1](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#90). |
| schemaLocations | <code>Object</code> | an object mapping uri to schema locations |
| nsAssignments | <code>Object</code> | an object mapping ns to uri |

<a name="TransactionParams"></a>

## TransactionParams : <code>Object</code>
An object containing optional named parameters for a transaction in addition
to parameters used elsewhere.

**Kind**: global typedef  
**Extends**: [<code>Params</code>](#Params)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lockId | <code>string</code> | lockId parameter, as specified at [OGC 09-025r2 § 15.2.3.1.2](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#277). |
| releaseAction | <code>string</code> | releaseAction parameter, as specified at [OGC 09-025r2 § 15.2.3.2](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#278). |

<a name="Feature"></a>

## Feature : <code>Object</code>
A GeoJSON feature with the following optional foreign members (see
[rfc7965 § 6](https://tools.ietf.org/html/rfc7946#section-6)).
or an object with some of the following members.
Members of Feature will be used over those in Params except for layer, id,
and properties.

**Kind**: global typedef  
**Extends**: [<code>Params</code>](#Params)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| geometry | <code>Object</code> | a GeoJSON geometry. |
| type | <code>string</code> | 'Feature'. |

**Example**  
```js
{'id':'tasmania_roads.1', 'typeName':'topp:tasmania_roadsType'}
// can be passed to Delete
```
<a name="FeatureCollection"></a>

## FeatureCollection : <code>Object</code>
a GeoJSON FeatureCollection with optional foreign members as in Feature.

**Kind**: global typedef  
**Extends**: [<code>Feature</code>](#Feature)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | 'FeatureCollection'. |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) | an array of GeoJSON Features. |

