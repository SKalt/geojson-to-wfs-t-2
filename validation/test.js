const validate = require('xsd-schema-validator').validateXML;
const formatXml = require('./formatXml.js');
// const wfs = require('../geojsonToWfst.js');
const wfs = require('../geojson-to-wfst-2-cjs');
const {testCases, feature} = require('./featureExamples.js'); // in separate
// module since the fixtures are many lines of code.
const assert = require('assert');

const isValidWfst = (xml) => {
  return new Promise(function(res, rej) {
    validate(xml, './fixtures/mock_schema.xsd', (err, result) => {
      if (err) rej(err);
      res(result);
    });
  }).catch((err)=>{
    console.log(formatXml(xml));
    throw err;
  });
};
const tempId = (()=>{
  let counter = 1;
  return ()=>{
    counter += 1;
    return ` gml:id="ab.${counter}"`;
  };
})();

let test = (testCaseId, action, note) =>{ // TODO: anti-tests.
  it(`${testCaseId} : ${action}; ${note || ''}`,
    function() {
      const [feature, params] = testCases[testCaseId];
      let xml = wfs.Transaction(
        wfs[action](feature, params),
        {
          nsAssignments: {
            topp: 'http://www.openplans.org/topp'
          },
          schemaLocations: {}
        }
      );
      xml = xml.replace(
        /<gml:(MultiCurve|LineString)/g,
        (match)=>`${match + tempId()}`
      );
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
describe('Generation of valid WFS-T-2.0.0', function() {
  // it('exists / is visible', function(){
  //   console.log(formatXml(wfs.Insert(feature)), '\n-------------------');
  //   console.log(formatXml(wfs.Update(feature)), '\n-------------------');
  //   console.log(formatXml(wfs.Delete(feature, {ns:'topp'})), '\n-------------------');
  //   console.log(formatXml(wfs.Transaction(wfs.Delete(feature), {
  //     nsAssignments:{
  //   topp:'http://www.openplans.org/topp'
  //     },
  //     schemaLocations:{}
  //   })), '\n-------------------');
  // });
  // for (let testCase in testCases){
  let testCase = 'complete feature, empty params';
  tests('complete feature, empty params',
    'Insert', 'Replace', 'Delete');
  tests('complete feature, undefined params',
    'Insert', 'Replace', 'Update', 'Delete');
  tests('separated layer, id number',
    'Insert', 'Replace', 'Update', 'Delete');
  tests('layer override',
         'Insert', 'Replace', 'Update', 'Delete');
  tests('parameter override',
    'Insert', 'Replace', 'Update', 'Delete');
  tests('feature array',
    'Insert', 'Replace', 'Update', 'Delete');
  tests('featureCollection',
    'Insert', 'Replace', 'Update', 'Delete');
  tests('whitelist',
    'Insert', 'Update', 'Replace');
  tests('update error feature',
    'Insert', 'Update', 'Replace', 'Delete');
});
test = (testCaseId, action, note) => { // TODO: anti-tests.
  it(`${testCaseId} : ${action}; ${note || ''}`,
    function() {
      const [feature, params] = testCases[testCaseId];
      let xml = wfs.Transaction(
        wfs[action](feature, params),
        {
          nsAssignments: {
            topp: 'http://www.openplans.org/topp'
          },
          schemaLocations: {}
        }
      );
      xml = xml.replace(
        /<gml:(MultiCurve|LineString)/g,
        (match)=>`${match + tempId()}`
      );
      return isValidWfst(xml)
        .catch(()=>true)
        .then(()=>{
          throw new Error('should have thrown an error');
        });
    }
  );
};
describe('Appropriate throwing of errors', function() {});

describe('Handles falsy values correctly.', () => {
  describe('empty string value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        emptystring: ''
      });

      const insert = wfs.Insert(testFeature);
      const xml = wfs.Transaction([insert], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<topp:emptystring><\/topp:emptystring>/);

      assert.notEqual(match, null, 'An xml match must be found for emptystring');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      const update = wfs.Update(testFeature, {
        properties: {
          emptystring: ''
        }
      });
      const xml = wfs.Transaction([update], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<wfs:ValueReference>emptystring<\/wfs:ValueReference><wfs:Value><\/wfs:Value>/);

      assert.notEqual(match, null, 'An xml match must be found for emptystring');
    });
  });

  describe('false value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        falsevalue: false
      });

      const insert = wfs.Insert(testFeature);
      const xml = wfs.Transaction([insert], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<topp:falsevalue>false<\/topp:falsevalue>/);

      assert.notEqual(match, null, 'An xml match must be found for falsevalue');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      const update = wfs.Update(testFeature, {
        properties: {
          falsevalue: false
        }
      });
      const xml = wfs.Transaction([update], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<wfs:ValueReference>falsevalue<\/wfs:ValueReference><wfs:Value>false<\/wfs:Value>/);

      assert.notEqual(match, null, 'An xml match must be found for emptystring');
    });
  });

  describe('0 value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        zero: 0
      });

      const insert = wfs.Insert(testFeature);
      const xml = wfs.Transaction([insert], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<topp:zero>0<\/topp:zero>/);

      assert.notEqual(match, null, 'An xml match must be found for zero');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      const update = wfs.Update(testFeature, {
        properties: {
          zero: 0
        }
      });
      const xml = wfs.Transaction([update], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<wfs:ValueReference>zero<\/wfs:ValueReference><wfs:Value>0<\/wfs:Value>/);

      assert.notEqual(match, null, 'An xml match must be found for zero');
    });
  });

  describe('null value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        nullvalue: null
      });

      const insert = wfs.Insert(testFeature);
      const xml = wfs.Transaction([insert], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/nullvalue/);

      assert.equal(match, null, 'Null values should not appear in an Insert');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      const update = wfs.Update(testFeature, {
        properties: {
          nullvalue: null
        }
      });
      const xml = wfs.Transaction([update], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/<wfs:ValueReference>nullvalue<\/wfs:ValueReference><wfs:Value xsi:nil="true"><\/wfs:Value>/);

      assert.notEqual(match, null, 'An xml match must be found for nullvalue');
    });
  });

  describe('undefined value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        undefinedvalue: undefined
      });

      const insert = wfs.Insert(testFeature);
      const xml = wfs.Transaction([insert], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/undefinedvalue/);

      assert.equal(match, null, 'Undefined values should not appear in an Insert');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      const update = wfs.Update(testFeature, {
        properties: {
          undefinedvalue: undefined
        }
      });
      const xml = wfs.Transaction([update], {
        nsAssignments: {
          topp: 'http://www.openplans.org/topp'
        }
      });

      const match = xml.match(/undefinedvalue/);

      assert.equal(match, null, 'Undefined values should not appear in an Update');
    });
  });

  describe('NaN value', () => {
    it('Insert', () => {
      const testFeature = Object.assign({}, feature);
      testFeature.properties = Object.assign({}, feature.properties, {
        nanvalue: NaN
      });

      assert.throws(() => wfs.Insert(testFeature),
        /NaN is not allowed/,
        'NaN in an Insert should throw.');
    });

    it('Update', () => {
      const testFeature = Object.assign({}, feature, {geometry_name: undefined});

      assert.throws(() => wfs.Update(testFeature, {
        properties: {
          nanvalue: NaN
        }
      }),
      /NaN is not allowed/,
      'NaN in an Update should throw.');
    });
  });
});
