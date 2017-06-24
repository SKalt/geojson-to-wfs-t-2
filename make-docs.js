const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');


jsdoc2md.render({ files: ['geojsonToWfst.js'] }).then(
  function(result){
    fs.writeFileSync('README.md', result);
    console.log(result);
    return 0;
  }
);

