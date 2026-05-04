const fs = require('fs');
const path = require('path');

const astGrepPath = path.join(__dirname, '../node_modules/@ast-grep/napi/index.js');
if (fs.existsSync(astGrepPath)) {
  const stubContent = `
// Stubbed for workerd compatibility
module.exports = {
  parse: () => ({}),
  findAll: () => [],
  replaceAll: () => '',
};
`;
  fs.writeFileSync(astGrepPath, stubContent);
  console.log('Stubbed @ast-grep/napi');
} else {
  console.log('@ast-grep/napi not found');
}
