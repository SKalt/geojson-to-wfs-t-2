
const makeId = (
  ()=>{
    let counter = 15;
    return () => {
      counter += 1;
      return `tasmania_roads.${counter}`;
    };
  }
)();

const basicGeojson = { // complete feature 
  "type":"Feature",
  "id":"tasmania_roads.15",
  "geometry":{
    "type":"MultiLineString",
    "coordinates":[
      [
	[146.4685,-41.241478],
	[146.5747,-41.251186],
	[146.6404,-41.255154],
	[146.7661,-41.332348],
      ]
    ]
  },
  "geometry_name":"the_geom",
  "properties":{
    "TYPE":"RnbwRd"
  },
  "ns":"topp",
  "layer":{
    "id":"tasmania_roads"
  },
  "srsName":"EPSG:4326"
};

const makeFeature = (overrides, ...deletions) =>{
  let newFeature = Object.assign({}, basicGeojson, overrides);
  
  deletions.forEach((d)=> delete newFeature[d]);
  return newFeature;
};

const should_work_inputs = { //feature/s, params pairs
  // empty params, feature-only tests
  // insertions
  "complete feature, empty params":[basicGeojson, {}],
  "complete feature, undefined params":[makeFeature('', 'geometry_name')],
  "separated layer, id number":[
    makeFeature({id:"15", layer:"tasmania_roads"}, 'geometry_name'), {}
  ],
  "layer override":[makeFeature('', 'geometry_name'), {"layer":"tasmania_roads"}],
  "parameter override":[
    makeFeature({"srsName":"EPSG:3857"}, 'geometry_name'),
    {"srsName":"EPSG:4326"}
  ],
  // TODO: add case sensitive attr checkers.
  "feature array":[[
    makeFeature({id:makeId()}, 'geometry_name'),
    makeFeature({id:makeId()}, 'geometry_name')
  ], {}],
  "featureCollection": [
    {"type":"FeatureCollection",
     "features":[
       makeFeature({id:makeId()}, 'geometry_name'),
       makeFeature({id:makeId()}, 'geometry_name')
     ]
    }, {}],
  "whitelist":[
    makeFeature({
      "properties":{
	"TYPE":"FuryRd",
	"Irrelevant":"blah"
      }
    }, 'geometry_name'),
    {
      "whitelist":["TYPE"]
    }
  ]
};

module.exports = {testCases:should_work_inputs, feature:basicGeojson};
