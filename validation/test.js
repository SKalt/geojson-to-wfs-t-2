const validate = require('xsd-schema-validator').validateXML;
const formatXml = require('./formatXml.js');
// const wfs = require('../geojsonToWfst.js');
const wfs = require('../geojson-to-wfst-2-cjs');
const {testCases, feature} = require('./featureExamples.js'); // in separate
// module since the fixtures are many lines of code.

function isValidWfst(xml){
  return new Promise(function(res, rej){
    validate(xml, './fixtures/mock_schema.xsd', (err, result) => {
      if (err) rej(err);
      res(result);
    });
  }).catch((err)=>{
    console.log(formatXml(xml));
    throw err;
  });
}
const tempId = (()=>{
  let counter = 1;
  return ()=>{
    counter += 1;
    return ` gml:id="ab.${counter}"`;
  };
})();

let test = (testCaseId, action, note) =>{ // TODO: anti-tests.
  it(`${testCaseId} : ${action}; ${note || ''}`,
     function(){
       const [feature, params] = testCases[testCaseId];
       let xml = wfs.Transaction(
	 wfs[action](feature, params),
	 {
	   nsAssignments:{
    	     topp:'http://www.openplans.org/topp'
	   },
	   schemaLocations:{}
	 }
       );
       xml = xml.replace(/<gml:(MultiCurve|LineString)/g, (match)=>`${match + tempId()}`);
       return isValidWfst(xml);
     }
    );
};
const tests = (testCaseId, ...actions) => actions.forEach(
  (action) => test(testCaseId, action)
);

// [ 'complete feature, empty params',
//   'complete feature, undefined params',
//   'separated layer, id number',
//   'layer override',
//   'parameter override',
//   'feature array',
//   'featureCollection',
//   'whitelist' ]

describe('Generation of valid WFS-T-2.0.0', function(){
  // it('exists / is visible', function(){
  //   console.log(formatXml(wfs.Insert(feature)), '\n-------------------');
  //   console.log(formatXml(wfs.Update(feature)), '\n-------------------');
  //   console.log(formatXml(wfs.Delete(feature, {ns:'topp'})), '\n-------------------');
  //   console.log(formatXml(wfs.Transaction(wfs.Delete(feature), {
  //     nsAssignments:{
  // 	topp:'http://www.openplans.org/topp'
  //     },
  //     schemaLocations:{}
  //   })), '\n-------------------');
  // });
  //for (let testCase in testCases){
  let testCase = "complete feature, empty params";
  // tests('complete feature, empty params',
	// 'Insert', 'Replace', 'Delete');
  // tests('complete feature, undefined params',
	// 'Insert', 'Replace', 'Update', 'Delete');
  // tests('separated layer, id number',
	// 'Insert', 'Replace','Update', 'Delete');
  // tests('layer override',
  //      	'Insert', 'Replace','Update', 'Delete');
  // tests('parameter override',
	// 'Insert', 'Replace','Update', 'Delete');
  // tests('feature array',
 	// 'Insert', 'Replace','Update', 'Delete');
  // tests('featureCollection',
	// 'Insert', 'Replace','Update', 'Delete');
  // tests('whitelist',
	// 'Insert', 'Update', 'Replace');
  tests('update error feature',
	'Insert', 'Update', 'Replace', 'Delete');
});
test = (testCaseId, action, note) => { // TODO: anti-tests.
  it(`${testCaseId} : ${action}; ${note || ''}`,
     function(){
       const [feature, params] = testCases[testCaseId];
       let xml = wfs.Transaction(
	 wfs[action](feature, params),
	 {
	   nsAssignments:{
    	     topp:'http://www.openplans.org/topp'
	   },
	   schemaLocations:{}
	 }
       );
       xml = xml.replace(/<gml:(MultiCurve|LineString)/g, (match)=>`${match + tempId()}`);
       return isValidWfst(xml)
	 .catch(()=>true)
	 .then(()=>{throw new Error('should have thrown an error');});
     }
    );
};
describe('Appropriate throwing of errors', function(){});
