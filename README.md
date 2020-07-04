# common-fn-js
#### A collection of functions I often use in my node.js projects

I was tired of either rewriting this stuff, or keeping track of different files of
different versions - so I figured I would group everything into one public place.

### File I/O Methods
Method Name | Description | Signature
------------|---------- | -----------
loadFile | Reads file from given filename, returning promise of that file |  (STRING, STRING) -> PROMISE(\*)
loadText | Loads file as text, returning promise of read text |  (STRING) -> PROMISE(STRING)
loadJSON  | Loads file as JSON, returning promise of read JSON | (STRING) -> PROMISE(JSON)
writeFile | Write data to given filename using given encoding, returning a promise of the filename if successful | (STRING, \*, STRING) -> PROMISE(STRING)
writeText | Writes text to given filename, returning promise of filename | (STRING) -> PROMISE(STRING)
writeJSON | Write JSON to given filename, returning promise of filename | (STRING) -> PROMISE(STRING)
nameOfFile | Returns filename without path or extension | (STRING) -> PROMISE(STRING)
readDir |  Returns a promise for an array of paths for the given directory filepath | (STRING) -> PROMISE([STRING])
fileStats | Returns promise of file stats for the given filename | (STRING) -> PROMISE(fs.Stats)
listFiles | Returns an array of every file in every subdirectory of given directory filtered by optional file extension | (STRING, STRING) -> PROMISE([STRING])

### Functional Programming Methods
Method Name | Description | Signature
------------|---------- | -----------
composeAll | Transforms a list of unary functions into a single unary function | ([FUNCTION]) -> FUNCTION
flatten | Returns a single array of elements from an array that may contain other arrays | ([[\*]]) -> ([\*])
assoc | Binds the given property with the given value to the given object | (STRING, \*) -> (OBJECT) -> OBJECT
rassoc | "Reverse" assoc operation; takes the object before binding identifier  to value of given object |  (OBJECT) -> (STRING, \*) ->  OBJECT
foldObj | Reduces the given object to the given accumulator using the given function | (OBJECT, (ACC, KEY, VALUE, OBJECT) -> ACC, ACC) -> ACC

### CLI Methods
Method Name | Description | Signature
------------|---------- | -----------
VARGS | Return promise of variable number of argument from command line | ([STRING]) -> PROMISE({STRING:STRING})
log | Prints value to console then returns value |   (\*) -> \*
err |   Prints value to error then returns value | (\*) -> \*
execAsync | Runs shell command, returning promise of result | (STRING) -> PROMISE(STRING)

### Time/Date Methods
Method Name | Description | Signature
------------|---------- | -----------
Timer | Finds the amount of time that's elapsed between a "start" DATE object and an "end" DATE object | (DATE, DATE) -> TIMER
timeFormat | Namespace for standarized time formatting methods | OBJECT
timeFormat.appendZero |  Appends 0 to a month less than 10 | STRING -> STRING
timeFormat.printDate | Returns date formatted as _mm-dd-yy_ | (DATE) -> STRING
timeFormat.printTime | Returns time formatted as _hours:minutes:seconds:milliseconds_ |  (DATE) -> STRING
timestamp | Prints formatted timestamp as _timeFormat.printDate\|timeFormat.printTime_ | (DATE) -> STRING

### Parsing Methods
Method Name | Description | Signature
------------|---------- | -----------
parseArray | Recursively applies function to every element of an array, returning a result | [a], (b, a, NUMBER, [a] -> b, b), b -> b
parseObj | Recursively applies function to every property of an object, returning a result | {x:y}, (b, y, x, {x:y}) -> b, b -> b
