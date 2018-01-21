const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');


jsdoc2md.render({files: ['src/**']}).then(
  function(result) {
    fs.writeFileSync('API.md', result);
    console.log(result);
    return 0;
  }
);
