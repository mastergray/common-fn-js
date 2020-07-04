const fs = require("fs");                         // Native module for handling file system
const path = require("path");                     // Native module for handling path names
const exec = require('child_process').exec;       // Native module for running external processes

module.exports = COMMON = {

  /**
   *
   *  File I/O Methods
   *
   */

  // :: (STRING, STRING) -> PROMISE(*)
  // Reads file from given filename, returning promise of that file:
  "loadFile":(filename, encoding) => new Promise((resolve, reject) => {
    fs.readFile(filename, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }),

  // :: (STRING) -> PROMISE(STRING)
  // Loads file as text, returning promise of read text:
  "loadText":(filename) => COMMON.loadFile(filename, "utf8"),

  // :: (STRING) -> PROMISE(JSON)
  // Loads file as JSON, returning promise of read JSON:
  "loadJSON":(filename) => COMMON.loadFile(filename).then(async (file) => {
    try {
      return JSON.parse(file);
    } catch (err) {
      throw err;
    }
  }),

  // :: (STRING, *, STRING) -> PROMISE(STRING)
  // Write data to given filename using given encoding, returning a promise
  // of the filename the data was written to if succssesful:
  "writeFile":(filename, data, encoding) => new Promise((resolve, reject) => {
    fs.writeFile(filename, data, encoding, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filename);
      }
    });
  }),

  // :: (STRING, STRING) -> PROMISE(STRING)
  // Writes text to given filename:
  "writeText":(filename, data) => COMMON.writeFile(filename, data, 'utf8'),

  // :: (STRING, JSON) -> PROMISE(STRING)
  // Write JSON to given filename:
  "writeJSON":(filename, data) => new Promise((resolve, reject) => {
    try {
      let json = JSON.stringify(data);
      COMMON.writeText(filename, json).then(resolve);
    } catch (err) {
      reject(err);
    }
  }),

  // :: (STRING) -> STRING
  // Returns filename without path or extension:
  // NOTE: https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
  "nameOfFile":(filename) => path.basename(filename).split('.').slice(0, -1).join('.'),

  // readDir :: (STRING) -> PROMISE([STRING])
  // Returns a promise for an array of paths for the given directory filepath:
  "readDir":(dirname) => new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  }),

  // fileStats :: (STRING) -> PROMISE(stats)
  // Returns promise of file state for the given filename:
  "fileStats":(filename) => new Promise((resolve, reject) => {
    fs.stat(filename, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats);
      }
    });
  }),

  // listFiles:: (STRING, STRING) -> PROMISE([STRING])
  // Returns an array of every file in every subdirectory of given directory filted by optional file extension:
  // NOTE: File extension argument includes "."
  "listFiles":(dirname, extname) => {

    // :: (Array, string) -> Promise([string])
    let readPath = (list, filepath) => COMMON.fileStats(filepath).then((stat) => {
        // Add filepath to list:
        if (stat.isFile()) {
          // Check extension if set:
          if (extname) {
            if (path.extname(filepath) === extname) {
              list.push(filepath);
            }
          } else {
            list.push(filepath);
          }
        }
        // read every file in subdirectory:
        if (stat.isDirectory()) {
          return COMMON.readDir(filepath).then((files) => {
            return files.map((file) => readPath(list, `${filepath}/${file}`));
          }).then((promises) => {
            return Promise.all(promises);
          })
        }
      // Return promise of list:
    }).then(() => list);

    // Recursively read all files of all subdirectories of given dirname:
    return readPath([], dirname, extname);

  },

  /**
   *
   *  Functional Programming Methods
   *
   */

   // composeAll :: ([FUNCTION]) -> FUNCTION
   // Transforms a list of unary functions into a single unary function:
   "composeAll": (fns) => fns.reduce((result, fn) => {
     return (x) => fn(result(x));
   }, (x)=>x),

   // :: flatten :: ([[*]]) -> ([*])
   // Returns a single array of elements from an array that may contain other arrays:
   // NOTE: I realize this is natively supported now, but keeping here for reference:
   "flatten": (arr) => arr.reduce(function (a, b) {
     return Array.isArray(b) ? a.concat(COMMON.flatten(b)) : a.concat(b);
   }, []),

   // assoc :: (STRING, *) -> (OBJECT) -> OBJECT
   // Binds the given property with the given value to the given object:
   "assoc": (property, value) => (obj) => {
     obj[property] = value;
     return obj;
   },

   // rassoc :: (OBJECT) -> (STRING, *) ->  OBJECT
   // "Reverse" assoc operation; takes the object before binding identifer  to value of given object:
   "rassoc": (obj) => (property, value) => COMMON.assoc(property, value)(obj),

   // foldObj :: (OBJECT, (ACC, KEY, VALUE, OBJECT) -> ACC, ACC) -> ACC
   // Reduces the given object to the given acculmator using the given function:
   "foldObj":(obj, fn, acc) => Object.keys(obj).reduce((acc, key) => {
     return fn(acc, key, obj[key], obj);
   }, acc),

   /**
    *
    * CLI Methods
    *
    */

    // Return promise of variable number of argument from command line:
    // VARGS :: ([STRING]) -> PROMISE({STRING:STRING})
    "VARGS": (vargs) => new Promise((resolve, reject) => {
      try {
        vargs = process.argv.slice(2).reduce((result, varg, index) => {
          result[vargs[index]] = varg;
          return result;
        }, {});
        resolve(vargs);
      } catch (err) {
        reject(err);
      }
    }),

    // log  (*) -> *
    // Prints value to console then returns value:
    "log":(x) => {
      console.log(x);
      return x;
    },

    // err :: (*) -> *
    // Prints value to error then returns value:
    "err":(x) => {
      console.error(x);
      return x;
    },

    // exexAsync :: (STRING) -> PROMISE(STRING)
    // Wraps external process in a Promise:
    "execAsync":(command) => new Promise((resolve, reject) => {
      exec(command, function (err, stdout, stderr) {
        if (err) {
          reject(err);
        } else {
          resolve(stdout ? stdout : stderr);
        }
      });
    }),

    /**
     *
     *  Time/Date Methods
     *
     */

     // CONSTRUCTOR :: (DATE, DATE) -> TIMER
     // Finds the amount of time that's elapsed between a "start" DATE object and an "end" DATE object:
     "Timer": (START, END) => ({
       "start":(start) => COMMON.timer(start || Date.now(), END),
       "stop":(end) => COMMON.timer(START, end || Date.now()),
       "elapse":(fn) => fn === undefined ? END - START : fn(END-START)
     }),

     // Namespace for standarized time formatting methods:
     "timeFormat":{
       // :timeFormat.appendZero : STRING -> STRING
       // Appends 0 to a month less than 10:
       "appendZero":(val) => val < 10 ? "0" + val : val.toString(),
       // timeFormat.printDate :: (DATE) -> STRING
       // Returns date formatted as "mm-dd-yy":
       "printDate":(date) => {
         let month = COMMON.timeFormat.appendZero(date.getMonth()+1),
             day = COMMON.timeFormat.appendZero(date.getDate()),
             year = COMMON.timeFormat.appendZero(date.getFullYear());
         return `${month}-${day}-${year.slice(2)}`;
       },
       // timeFormat.printTime :: (DATE) -> STRING
       // Returns time formatted as "hours:minutes:seconds:milliseconds":
       "printTime":(date) => {
         let hours = COMMON.timeFormat.appendZero(date.getHours()),
             minutes = COMMON.timeFormat.appendZero(date.getMinutes()),
             seconds = COMMON.timeFormat.appendZero(date.getSeconds()),
             milliseconds = date.getMilliseconds().toString();
         return `${hours}:${minutes}:${seconds}:${milliseconds}`;
       }
     },

     // timestamp :: (DATE) -> STRING
     // Prints formatted timestamp using given date:
     // NOTE: If not date object is given, current time is used:
     "timestamp": (date) => {
       date = date || new Date();
       return `[${COMMON.timeFormat.printDate(date)}|${COMMON.timeFormat.printTime(date)}]`;
     },

  /**
   *
   *  Parsing Methods
   *
   */

    // parseArray :: [a], (b, a, NUMBER, [a] -> b, b), b -> b
    // Recursively applies function to every element of an array, returning a result:
    "parseArray":(arr, fn, result) => {
      arr.forEach((elem, index) => {
        if (elem instanceof Array) {
          result = COMMON.parseArray(elem, fn, result);
        } else if (elem instanceof Object) {
          result = COMMON.parseObj(elem, fn, result);
        } else {
          result = fn(result, elem, index, arr);
        }
      });
      return result;
    },

    // parseObj :: {x:y}, (b, y, x, {x:y}) -> b, b -> b
    // Recursively applies function to every property of an object, returning a result:
    "parseObj":(obj, fn, result) => {
      Object.keys(obj).forEach((key) => {
        let val = obj[key];
        if (val instanceof Array) {
          result = COMMON.parseArray(val, fn, result);
        } else if (val instanceof Object) {
          result = COMMON.parseObj(val, fn, result);
        } else {
          result = fn(result, val, key, obj);
        }
      });
      return result;
    }

}
