const Metadata = require('./src/common/classes/Metadata')
const { wrapExpressV4 } = require('./src/express-wrapper/express-v4-wrapper')
const convertToOpenapiV3 = require('./src/openapi-converter/metadata-to-openapi-v3')
module.exports = {
  Metadata,
  wrapExpressV4,
  convertToOpenapiV3
}
