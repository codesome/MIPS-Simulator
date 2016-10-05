function enableButtons(argument) { // enable 'Next Step' and 'Run Till End' buttons
	document.getElementById("btn1").disabled = false;
	document.getElementById("btn2").disabled = false;
}

function disableButtons(argument) { // disable 'Next Step' and 'Run Till End' buttons
	document.getElementById("btn1").disabled = true;
	document.getElementById("btn2").disabled = true;
}

/*
* function: updateData
* Purpose: to load the .data section into the memory
*
* @Params
* 	start = start index of the data section in the array of instructions
* 	end = end index of the data section in the array of instructions
*
* returns 
*   * 'true' for successful execution
*   * 'false' for any error
*/
function updateData(start,end) {
	data = {}; 
	var d,arr,label,type;
	for(var i=start+1 ; i<end ; i++) {
		if(instructions[i].indexOf('.word')==-1 && instructions[i].indexOf('.space')==-1) { // exiting if not .word or .space
			return false;
		} else {
			d = fetchData(instructions[i]); // middleware
			
			if(!d) return false; // if could not fetch data

			label = d[1];
			type = d[2]; // 'word' or 'space'
			arr = d[3]; // content followed by .word or .space

			if(!validLabel(label + ':')){
    			alert('Invalid label: "'+removeBlankSpaces(instructions[i])+'"');
				document.getElementById('status').innerHTML = ' ERROR:'+instructions[i];
	    		currentInstruction = instructions.length;
	    		return;
    		}

			if(data[label]){ // checking for repetition of label
				alert('"' +label + '" repeated');
				return false;
			}

			arr = removeBlankSpaces(arr); // middleware
			arr = arr.split(','); // breaking the content

			for(var j=0 ; j<arr.length ; j++) { // validating and updating the number in the array
				if(arr[j]>2147483647 || arr[j]<-2147483648) return false;
				arr[j] = Number(arr[j]);
			}

			if(type=='word'){

				if(arr.length==1) data[label] = { // a single word
					type: 'word',
					number:arr[0],
					base: 2000000000+Math.floor(Math.random()*1000000000)
				};
				else data[label] = { // array of words
					type: 'word',
					array: arr.slice(),
					base: 2000000000+Math.floor(Math.random()*1000000000)
				};

			} else if(type=='space') {

				if(arr.length!=1) return false; // if more than 1 space option entered

				arr = arr[0];
				if(arr%4 != 0) return false;

				arr /= 4;
				if(arr==1) data[label] = { // a single word
					type: 'space',
					number:0,
					base: 2000000000+Math.floor(Math.random()*1000000000)
				}; 
				else data[label] = { // an array
					type: 'space',
					array: new Array(arr),
					base: 2000000000+Math.floor(Math.random()*1000000000)
				}

			} else {
				return false;
			}


		}
	}

	instructions.splice(start,end-start); // removing the data section from the array on instructions
	return true;
}

/*
* function: loadProgram
* Purpose: To validate and load all the instructions into the memory
*/	
function loadProgram() {

	disableButtons();

	data = {}; // clearing the data section
	allLabels = {};

	document.getElementById('status').innerHTML = ' (loading program . . .)';
		
	for(var i=0 ; i<allRegisters.length ; i++) { // setting all register values to 0
		registers[allRegisters[i]] = 0;
	}

	registers['$sp'] = { // setting the stack to an empty array of size 100
		array: new Array(stackLimit),
		current: -1,
		base: 2000000000+Math.floor(Math.random()*1000000000)
	};

	instructions = document.getElementById('mips-program').value.split('\n'); // fetching the program

	var pos;
	for(var i=0 ; i<instructions.length ; i++) { // scraping the comments from the instructions
		pos = instructions[i].indexOf('#');
		if(pos != -1){
			instructions[i] = instructions[i].slice(0,pos);
		}
		instructions[i] = handleBlankSpaces(instructions[i]); // middleware
	}

	function removeBlanks(){ // removing blank instructons (empty lines)
        var pos = instructions.indexOf('');
        if(pos != -1){
            instructions.splice(pos,1);
            removeBlanks();
        }
    }
    removeBlanks();

    // to load .data section
    pos = instructions.indexOf('.data');
    if(pos != -1) { // if .data exists
    	for(var i=pos+1 ; i<instructions.length ; i++) { // to find the end of .data section
    		if(instructions[i].indexOf(':')==-1) {
    			if(updateData(pos,i)) break;
    			else {
    				alert('Error reading the data');
    				return;
    			}
    		}
    	}
    }

    var x;
    for(var i=0 ; i<instructions.length ; i++) { // to validate the syntax
    	// middlewares: 'validateIns','getInstruction','checkForSyntaxError'
    	if((!validateIns(getInstruction(instructions[i])) && !validateIns(instructions[i])) || checkForSyntaxError(instructions[i])){ // if invalid
    		alert("Error in syntax: "+instructions[i]);
			document.getElementById('status').innerHTML = ' ERROR:'+instructions[i];
    		currentInstruction = instructions.length;
    		return;
    	}
    	if(isLabel(instructions[i])){ // checking for repetition of label

    		if(!validLabel(instructions[i])){
    			alert('Invalid label: "'+removeBlankSpaces(instructions[i])+'"');
				document.getElementById('status').innerHTML = ' ERROR:'+instructions[i];
	    		currentInstruction = instructions.length;
	    		return;
    		}

    		if(allLabels[removeBlankSpaces(instructions[i])]){
    			alert('"'+removeBlankSpaces(instructions[i])+'" repeated');
				document.getElementById('status').innerHTML = ' ERROR:'+instructions[i];
	    		currentInstruction = instructions.length;
	    		return;
    		} else {
    			allLabels[removeBlankSpaces(instructions[i])] = true;
    		}
    	}
	}

    currentInstruction = instructions.indexOf('.text')+1;

    updateRegistersInUI(); // middleware

	document.getElementById('status').innerHTML = ' (program loaded)';
	enableButtons();

}

/*
* function: loadSampleProgram
* Purpose: to load the sample programs in the UI
*
* @Params
* 	id = the id for the sample program
*
*/
function loadSampleProgram(id){
	document.getElementById('mips-program').value = sampleProgram[id];
	loadProgram();
}

/*
* function: nextStep
* Purpose: to execute the next instruction
*/
function nextStep() {

	if(currentInstruction < instructions.length) { // if it has not reached the end

		document.getElementById('status').innerHTML = 'Instruction Executed: '+instructions[currentInstruction];

		var instruction = instructions[currentInstruction];
		if(instruction.indexOf('halt') != -1) { // ending if its a 'halt'
			alert('Program Ended!');
			currentInstruction++;
			disableButtons();
			return false;
		} else if(instruction.indexOf('j ') != -1 || instruction.indexOf('$') != -1){ // checking if its not a lable
			if(instructionFunctions[getInstruction(instruction)](instruction)){
				// execution was successful
				updateRegistersInUI();
				currentInstruction++;
			} else {
				// execution was unsuccessful
				alert('Run time error: '+instruction);
				currentInstruction = instructions.length;
				disableButtons();
				return false;
			}
		} else { // executing next instruction if encountered a label
			currentInstruction++;
			nextStep();
		}
		return true;
	} else {
		return false;
	}

}

/*
* function: runProgram
* Purpose: to run the program till the end
*/
function runProgram(){
	disableButtons();
	while(nextStep());
}