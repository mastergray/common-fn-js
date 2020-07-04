const UTIL = require("../index.js");

UTIL.execAsync("cp ./test/index.js ./test/index.backup.js")
  .then(UTIL.log)
  .catch(UTIL.err)
