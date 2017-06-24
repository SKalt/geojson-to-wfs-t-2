## Constants

<dl>
<dt><a href="#xml">xml</a> : <code>Object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#wfs">wfs(tagName, attrs, inner)</a></dt>
<dd><p>Shorthand for creating a wfs xml tag.</p>
</dd>
<dt><a href="#ensureArray">ensureArray(maybe)</a></dt>
<dd><p>Ensures the result is an array.</p>
</dd>
<dt><a href="#ensureId">ensureId(lyr, id)</a> ⇒ <code>string</code></dt>
<dd><p>Ensures a layer.id format of an input id.</p>
</dd>
<dt><a href="#ensureTypeName">ensureTypeName(ns, layer, typeName)</a> ⇒ <code>string</code></dt>
<dd><p>returns a correctly-formatted typeName</p>
</dd>
<dt><a href="#pass">pass()</a></dt>
<dd><p>Stands in for other functions in swich statements, etc. Does nothing.</p>
</dd>
<dt><a href="#useWhitelistIfAvailable">useWhitelistIfAvailable(whitelist, properties, cb)</a></dt>
<dd><p>Iterates over the key-value pairs, filtering by a whitelist if available.</p>
</dd>
<dt><a href="#idFilter">idFilter(lyr, id)</a></dt>
<dd><p>Creates a fes:ResourceId filter from a layername and id</p>
</dd>
<dt><a href="#ensureFilter">ensureFilter(filter, features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Builds a filter from feature ids if one is not already input.</p>
</dd>
<dt><a href="#ensureAction">ensureAction(action)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Checks the type of the input action</p>
</dd>
<dt><a href="#translateFeatures">translateFeatures(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Turns an array of geojson features into gml:_feature strings describing them.</p>
</dd>
<dt><a href="#Insert">Insert(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a wfs:Insert tag wrapping a translated feature
(@see translateFeatures).</p>
</dd>
<dt><a href="#Update">Update(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Updates the input features in bulk with params.properties or by id.</p>
</dd>
<dt><a href="#Delete">Delete(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Creates a wfs:Delete action, creating a filter and typeName from feature ids 
if none are supplied.</p>
</dd>
<dt><a href="#Replace">Replace(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a string wfs:Replace action.</p>
</dd>
<dt><a href="#Transaction">Transaction(actions, params)</a> ⇒ <code>string</code></dt>
<dd><p>Wraps the input actions in a wfs:Transaction.</p>
</dd>
<dt><a href="#generateNsAssignments">generateNsAssignments(nsAssignments, xml)</a> ⇒ <code>Object</code></dt>
<dd><p>Generates an object to be passed to @see xml.attr xmlns:ns=&quot;uri&quot; definitions for a wfs:Transaction</p>
</dd>
<dt><a href="#generateSchemaLines">generateSchemaLines(schemaLocations)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a string alternating uri, whitespace, and the uri&#39;s schema&#39;s location.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Params">Params</a> : <code>Object</code></dt>
<dd><p>An object containing optional named parameters.</p>
</dd>
<dt><a href="#Feature">Feature</a> : <code>Object</code></dt>
<dd><p>A GeoJSON feature with the following optional foreign members (@see <a href="https://tools.ietf.org/html/rfc7946#section-6">https://tools.ietf.org/html/rfc7946#section-6</a>)
or an object with some of the following members.
Members of Feature will be used over those in Params except for layer, id,
and properties.</p>
</dd>
<dt><a href="#FeatureCollection">FeatureCollection</a> : <code>Object</code></dt>
<dd><p>a GeoJSON FeatureCollection with optional foreign members as in @see Feature.</p>
</dd>
</dl>

<a name="xml"></a>

## xml : <code>Object</code>
**Kind**: global constant  

* [xml](#xml) : <code>Object</code>
    * [~attrs(attrs)](#xml..attrs) ⇒ <code>string</code>
    * [~tag(ns, tagName, attrs, inner)](#xml..tag) ⇒ <code>string</code>

<a name="xml..attrs"></a>

### xml~attrs(attrs) ⇒ <code>string</code>
Turns an object into a string of xml attribute key-value pairs.

**Kind**: inner method of [<code>xml</code>](#xml)  
**Returns**: <code>string</code> - a string of xml attribute key-value pairs  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>Object</code> | an object mapping attribute names to attribute values |

<a name="xml..tag"></a>

### xml~tag(ns, tagName, attrs, inner) ⇒ <code>string</code>
Creates a string xml tag.

**Kind**: inner method of [<code>xml</code>](#xml)  
**Returns**: <code>string</code> - an xml string.  

| Param | Type | Description |
| --- | --- | --- |
| ns | <code>string</code> | the tag's xml namespace abbreviation. |
| tagName | <code>string</code> | the tag name. |
| attrs | <code>Object</code> | @see xml attrs. |
| inner | <code>string</code> | inner xml. |

<a name="wfs"></a>

## wfs(tagName, attrs, inner)
Shorthand for creating a wfs xml tag.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| tagName | <code>string</code> | a valid wfs tag name. |
| attrs | <code>Object</code> | @see attrs. |
| inner | <code>string</code> | @see tag. |

<a name="ensureArray"></a>

## ensureArray(maybe)
Ensures the result is an array.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| maybe | <code>Array</code> \| <code>Object</code> | a GeoJSON Feature or FeatureCollection object or an array thereof. |

<a name="ensureId"></a>

## ensureId(lyr, id) ⇒ <code>string</code>
Ensures a layer.id format of an input id.

**Kind**: global function  
**Returns**: <code>string</code> - a correctly-formatted gml:id  

| Param | Type | Description |
| --- | --- | --- |
| lyr | <code>string</code> | layer name |
| id | <code>string</code> | id, possibly already in correct layer.id format. |

<a name="ensureTypeName"></a>

## ensureTypeName(ns, layer, typeName) ⇒ <code>string</code>
returns a correctly-formatted typeName

**Kind**: global function  
**Returns**: <code>string</code> - a correctly-formatted typeName  
**Throws**:

- <code>Error</code> if typeName it cannot form a typeName from ns and layer


| Param | Type | Description |
| --- | --- | --- |
| ns | <code>string</code> | namespace |
| layer | <code>string</code> | layer name |
| typeName | <code>string</code> | typeName to check |

<a name="pass"></a>

## pass()
Stands in for other functions in swich statements, etc. Does nothing.

**Kind**: global function  
<a name="useWhitelistIfAvailable"></a>

## useWhitelistIfAvailable(whitelist, properties, cb)
Iterates over the key-value pairs, filtering by a whitelist if available.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| whitelist | <code>Array.&lt;string&gt;</code> | a whitelist of property names |
| properties | <code>Object</code> | an object mapping property names to values |
| cb | <code>function</code> | a function to call on each (whitelisted key, value) pair |

<a name="idFilter"></a>

## idFilter(lyr, id)
Creates a fes:ResourceId filter from a layername and id

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| lyr | <code>string</code> | layer name of the filtered feature |
| id | <code>string</code> | feature id |

<a name="ensureFilter"></a>

## ensureFilter(filter, features, params) ⇒ <code>string</code>
Builds a filter from feature ids if one is not already input.

**Kind**: global function  
**Returns**: <code>string</code> - A filter, or the input filter if it was a string.  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>string</code> \| <code>undefined</code> | a possible string filter |
| features | <code>Array.&lt;Object&gt;</code> | an array of geojson feature objects |
| params | <code>Object</code> | an object of backup / override parameters |

<a name="ensureAction"></a>

## ensureAction(action) ⇒ <code>Boolean</code>
Checks the type of the input action

**Kind**: global function  
**Returns**: <code>Boolean</code> - whether the action is allowed  

| Param | Type |
| --- | --- |
| action | <code>string</code> \| <code>undefined</code> | 

<a name="translateFeatures"></a>

## translateFeatures(features, params) ⇒ <code>string</code>
Turns an array of geojson features into gml:_feature strings describing them.

**Kind**: global function  
**Returns**: <code>string</code> - a gml:_feature string.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) | an array of features to translate to  gml:_features. |
| params | [<code>Params</code>](#Params) | an object of backup / override parameters |

<a name="Insert"></a>

## Insert(features, params) ⇒ <code>string</code>
Returns a wfs:Insert tag wrapping a translated feature
(@see translateFeatures).

**Kind**: global function  
**Returns**: <code>string</code> - a wfs:Insert string.  
**See**: translateFeatures  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) | Feature(s) to pass to |
| params | [<code>Params</code>](#Params) | to be passed to @see translateFeatures, with optional inputFormat, srsName, handle for the wfs:Insert tag. |

<a name="Update"></a>

## Update(features, params) ⇒ <code>string</code>
Updates the input features in bulk with params.properties or by id.

**Kind**: global function  
**Returns**: <code>string</code> - a string wfs:Upate action.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) | features to update.  These may  pass in geometry_name, properties, and layer (overruled by params) and  ns, layer, srsName (overruling params). |
| params | [<code>Params</code>](#Params) | with optional properties, ns, layer, geometry_name, filter, typeName, whitelist. |

<a name="Update..makeKvp"></a>

### Update~makeKvp(prop, val, action)
makes a wfs:Property string containg a wfs:ValueReference, wfs:Value pair.

**Kind**: inner method of [<code>Update</code>](#Update)  

| Param | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | the field/property name |
| val | <code>string</code> | the field/property value |
| action | <code>string</code> | one of 'insertBefore', 'insertAfter', 'remove', 'replace'. See http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#286. `action` would delete or modify the order of fields within the remote feature. There is currently no way to input `action,` since wfs:Update's default action, 'replace', is sufficient. |

<a name="Delete"></a>

## Delete(features, params) ⇒ <code>string</code>
Creates a wfs:Delete action, creating a filter and typeName from feature ids 
if none are supplied.

**Kind**: global function  
**Returns**: <code>string</code> - a wfs:Delete string.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) |  |
| params | [<code>Params</code>](#Params) | optional parameter overrides. |
| [params.ns] | <code>string</code> | @see Params.ns |
| [params.layer] | <code>string</code> \| <code>Object</code> | @see Params.layer |
| [params.typeName] | <code>string</code> | @see Params.typeName. This will be inferred from feature/params layer and ns if this is left undefined. |
| [params.filter] | <code>filter</code> | @see Params.filter.  This will be inferred from feature ids and layer(s) if left undefined (@see ensureFilter). |

<a name="Replace"></a>

## Replace(features, params) ⇒ <code>string</code>
Returns a string wfs:Replace action.

**Kind**: global function  
**Returns**: <code>string</code> - a string wfs:Replace action.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) \| [<code>Feature</code>](#Feature) | feature(s) to replace |
| params | [<code>Params</code>](#Params) | with optional filter, inputFormat, srsName |

<a name="Transaction"></a>

## Transaction(actions, params) ⇒ <code>string</code>
Wraps the input actions in a wfs:Transaction.

**Kind**: global function  
**Returns**: <code>string</code> - A wfs:transaction wrapping the input actions.  
**Throws**:

- <code>Error</code> if `actions` is not an array of strings, a string, or 
{@see Insert, @see Update, @see Delete}, where each action are valid inputs 
to the eponymous function.


| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Object</code> \| <code>Array.&lt;string&gt;</code> \| <code>string</code> | an object mapping {Insert, Update, Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action  string(s) to wrap in a transaction. |
| params | <code>Object</code> | optional srsName, lockId, releaseAction, handle, inputFormat, version, and required nsAssignments, schemaLocations. |

<a name="generateNsAssignments"></a>

## generateNsAssignments(nsAssignments, xml) ⇒ <code>Object</code>
Generates an object to be passed to @see xml.attr xmlns:ns="uri" definitions for a wfs:Transaction

**Kind**: global function  
**Returns**: <code>Object</code> - an object mapping each ns to its URI as 'xmlns:ns' : 'URI'.  
**Throws**:

- <code>Error</code> if any namespace used within `xml` is missing a URI definition


| Param | Type | Description |
| --- | --- | --- |
| nsAssignments | <code>Object</code> | @see Params.nsAssignments |
| xml | <code>string</code> | arbitrary xml. |

<a name="generateSchemaLines"></a>

## generateSchemaLines(schemaLocations) ⇒ <code>string</code>
Returns a string alternating uri, whitespace, and the uri's schema's location.

**Kind**: global function  
**Returns**: <code>string</code> - a string that is a valid xsi:schemaLocation value.  

| Param | Type | Description |
| --- | --- | --- |
| schemaLocations | <code>Object</code> | an object mapping uri:schemalocation |

<a name="Params"></a>

## Params : <code>Object</code>
An object containing optional named parameters.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ns | <code>string</code> \| <code>undefined</code> | an xml namespace alias. |
| layer | <code>string</code> \| <code>Object</code> \| <code>undefined</code> | a string layer name or {id}, where id is the layer name |
| geometry_name | <code>string</code> \| <code>undefined</code> | the name of the feature geometry field. |
| properties | <code>Object</code> \| <code>undefined</code> | an object mapping feature field names to feature properties |
| id | <code>string</code> \| <code>undefined</code> | a string feature id. |
| whitelist | <code>Array.&lt;string&gt;</code> \| <code>undefined</code> | an array of string field names to  use from @see params.properties |
| inputFormat | <code>string</code> \| <code>undefined</code> | inputFormat, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65. |
| srsName | <code>string</code> \| <code>undefined</code> | srsName, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66 if undefined, the gml3 module will default to 'EPSG:4326'. |
| handle | <code>string</code> \| <code>undefined</code> | handle parameter, as specified at http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44 |
| filter | <code>string</code> \| <code>undefined</code> | a string fes:Filter. |
| typeName | <code>string</code> \| <code>undefined</code> | a string specifying the feature type within its namespace. @see http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#90. |
| schemaLocations | <code>Object</code> \| <code>undefined</code> | an object mapping uri to schemalocation |
| nsAssignments | <code>Object</code> \| <code>undefined</code> | an object mapping ns to uri |

<a name="Feature"></a>

## Feature : <code>Object</code>
A GeoJSON feature with the following optional foreign members (@see https://tools.ietf.org/html/rfc7946#section-6)
or an object with some of the following members.
Members of Feature will be used over those in Params except for layer, id,
and properties.

**Kind**: global typedef  
**Extends**: [<code>Params</code>](#Params)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| geometry | <code>Object</code> \| <code>undefined</code> | a GeoJSON geometry. |
| type | <code>string</code> \| <code>undefined</code> | 'Feature'. |

**Example**  
```js
{'id':'tasmania_roads.1', 'typeName':'topp:tasmania_roadsType'} 
// can be passed to @see Delete
```
<a name="FeatureCollection"></a>

## FeatureCollection : <code>Object</code>
a GeoJSON FeatureCollection with optional foreign members as in @see Feature.

**Kind**: global typedef  
**Extends**: [<code>Feature</code>](#Feature)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | 'FeatureCollection'. |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) | an array of GeoJSON Features. |

