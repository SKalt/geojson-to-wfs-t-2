## Functions

<dl>
<dt><a href="#translateFeatures">translateFeatures(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Turns an array of geojson features into gml:_feature strings describing them.</p>
</dd>
<dt><a href="#Insert">Insert(features, params)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a wfs:Insert tag wrapping a translated feature</p>
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

<a name="translateFeatures"></a>

## translateFeatures(features, params) ⇒ <code>string</code>
Turns an array of geojson features into gml:_feature strings describing them.

**Kind**: global function  
**Returns**: <code>string</code> - a gml:_feature string.  

| Param | Type | Description |
| --- | --- | --- |
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) | an array of features to translate to gml:_features. |
| params | [<code>Params</code>](#Params) | an object of backup / override parameters |

<a name="Insert"></a>

## Insert(features, params) ⇒ <code>string</code>
Returns a wfs:Insert tag wrapping a translated feature

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
| features | [<code>Array.&lt;Feature&gt;</code>](#Feature) \| [<code>FeatureCollection</code>](#FeatureCollection) | features to update.  These may pass in geometry_name, properties, and layer (overruled by params) and ns, layer, srsName (overruling params). |
| params | [<code>Params</code>](#Params) | with optional properties, ns (namespace), layer,  geometry_name, filter, typeName, whitelist. |

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
| actions | <code>Object</code> \| <code>Array.&lt;string&gt;</code> \| <code>string</code> | an object mapping {Insert, Update, Delete} to feature(s) to pass to Insert, Update, Delete, or wfs:action string(s) to wrap in a transaction. |
| params | [<code>TransactionParams</code>](#TransactionParams) | optional srsName, lockId, releaseAction, handle, inputFormat, version, and required nsAssignments, schemaLocations. |

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
| whitelist | <code>Array.&lt;string&gt;</code> \| <code>undefined</code> | an array of string field names to use from @see Params.properties |
| inputFormat | <code>string</code> \| <code>undefined</code> | inputFormat, as specified at [OGC 09-025r2 § 7.6.5.4](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#65). |
| srsName | <code>string</code> \| <code>undefined</code> | srsName, as specified at [OGC 09-025r2 § 7.6.5.5](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#66). if undefined, the gml3 module will default to 'EPSG:4326'. |
| handle | <code>string</code> \| <code>undefined</code> | handle parameter, as specified at [OGC 09-025r2 § 7.6.2.6 ](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#44) |
| filter | <code>string</code> \| <code>undefined</code> | a string fes:Filter. |
| typeName | <code>string</code> \| <code>undefined</code> | a string specifying the feature type within its namespace. See [09-025r2 § 7.9.2.4.1](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#90). |
| schemaLocations | <code>Object</code> \| <code>undefined</code> | an object mapping uri to schema locations |
| nsAssignments | <code>Object</code> \| <code>undefined</code> | an object mapping ns to uri |

<a name="TransactionParams"></a>

## TransactionParams : <code>Object</code>
An object containing optional named parameters for a transaction in addition
to parameters used elsewhere.

**Kind**: global typedef  
**Extends**: [<code>Params</code>](#Params)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lockId | <code>string</code> \| <code>undefined</code> | lockId parameter, as specified at [OGC 09-025r2 § 15.2.3.1.2](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#277). |
| releaseAction | <code>string</code> \| <code>undefined</code> | releaseAction parameter, as specified at [OGC 09-025r2 § 15.2.3.2](http://docs.opengeospatial.org/is/09-025r2/09-025r2.html#278). |

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
| geometry | <code>Object</code> \| <code>undefined</code> | a GeoJSON geometry. |
| type | <code>string</code> \| <code>undefined</code> | 'Feature'. |

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

