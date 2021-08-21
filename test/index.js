const COMMON = require("../index.js");

(async () => {

  // Start a timer:
  let timer = COMMON.Timer().start();

  // Write a file:
  await COMMON.writeText("./test/test.txt", "Hello world!");

  // Read a File:
  let text = await COMMON.loadText("./test/test.txt")
    .then(COMMON.log)
    .catch(COMMON.err)

  // Read all files from all subdirectories for a given path:
  let files = await COMMON.listFiles("./test");

  // Compose some functions
  await COMMON.composeAll([
    (result) => result.map(filename=>COMMON.nameOfFile(filename)), // Get name of all files without extension
    (result) => Promise.all(result)
      .then(result=>result.join())                                // Join array of filenames into STRING
      .then(COMMON.log)                                           // Write STRING to STDOUT
      .catch(COMMON.er)
  ])(files);

  // Delete test file:
  await COMMON.execAsync("rm ./test/test.txt");

  // See how long this took to run:
  timer.stop().elapse(duration=>{
    console.log(`Ran in ${duration / 1000} seconds`);
  })

})();
