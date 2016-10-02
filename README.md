# MIPS-Simulator

## Run
Open `index.html` in your favourite browser and you are good to go.

## Instructions

* Enter your code in the text area provided and click on `Load Program` to load the program in the buffer.

* Click on `Next Step` to run the code line by line

* Click on `Run Till End` to run the program till the end or till `halt` appears

* To load any of the sample programs , click on one among `P1` , `P2` or `P3` on top right

* The value of all registers can be seen on the left side. The list is updated after execution of each instruction.

## About the files

* `samplePrograms.js` contains the 3 sample MIPS code

* `instructionFunctions.js` contains the implementation of the individual MIPS instructions

* `loaders.js` contains the code for parsing the MIPS code and running the parsed code

* `middlewares.js` contains the intermediate functions that will be used in `loaders.js` and `instructionFunctions.js`
