function enableButtons(argument) {
	document.getElementById("btn1").disabled = false;
	document.getElementById("btn2").disabled = false;
}

function disableButtons(argument) {
	document.getElementById("btn1").disabled = true;
	document.getElementById("btn2").disabled = true;
}


function updateData(start,end) { // to load the .data section
	data = {}; 
	var d,arr,label,type;
	for(var i=start+1 ; i<end ; i++) {
		if(instructions[i].indexOf('.word')==-1 && instructions[i].indexOf('.space')==-1) {
			return false;
		} else {
			d = fetchData(instructions[i]);
			
			if(!d) return false;

			label = d[1];
			type = d[2];
			arr = d[3];

			arr = removeBlankSpaces(arr);
			arr = arr.split(',');
			for(var j=0 ; j<arr.length ; j++) {
				arr[j] = Number(arr[j]);
				if(arr[j]>2147483647 || arr[j]<-2147483648) return false;
			}
			if(type=='word'){
				if(arr.length==1) data[label] = {
					type: 'word',
					number:arr[0],
					base: 2000000000+Math.floor(Math.random()*1000000000)
				};
				else data[label] = {
					type: 'word',
					array: arr.slice(),
					base: 2000000000+Math.floor(Math.random()*1000000000)
				};
			} else if(type=='space') {
				if(arr.length!=1) return false;
				arr = arr[0];
				if(arr%4 != 0) return false;

				arr /= 4;
				if(arr==1) data[label] = {
					type: 'space',
					number:0,
					base: 2000000000+Math.floor(Math.random()*1000000000)
				};
				else {
					data[label] = {
						type: 'space',
						array: new Array(arr),
						base: 2000000000+Math.floor(Math.random()*1000000000)
					}
				}

			} else {
				return false;
			}


		}
	}
	instructions.splice(start,end-start);
	return true;
}
	
function loadProgram() {

	disableButtons();

	data = {};

	document.getElementById('status').innerHTML = ' (loading program . . .)';
		
	for(var i=0 ; i<allRegisters.length ; i++) {
		registers[allRegisters[i]] = 0;
	}
	registers['$sp'] = {
		array: new Array(stackLimit),
		current: 0,
		base: 2000000000+Math.floor(Math.random()*1000000000)
	};

	instructions = document.getElementById('mips-program').value.split('\n');

	var pos;
	for(var i=0 ; i<instructions.length ; i++) {
		pos = instructions[i].indexOf('#');
		if(pos != -1) {
			instructions[i] = instructions[i].slice(0,pos);
		}
		instructions[i] = handleBlankSpaces(instructions[i]);
	}

	function removeBlanks(){
        var pos = instructions.indexOf('');
        if(pos != -1){
            instructions.splice(pos,1);
            removeBlanks();
        }
    }
    removeBlanks();

    // for .data
    pos = instructions.indexOf('.data');
    if(pos != -1) {
    	for(var i=pos+1 ; i<instructions.length ; i++) {
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
    for(var i=0 ; i<instructions.length ; i++) {
    	if((!validateIns(getInstruction(instructions[i])) && !validateIns(instructions[i])) || checkForSyntaxError(instructions[i])) {
    		alert("Error in syntax: "+instructions[i]);
			document.getElementById('status').innerHTML = ' ERROR:'+instructions[i];
    		currentInstruction = instructions.length;
    		return;
    	}
	}

    currentInstruction = instructions.indexOf('.text')+1;

    updateRegistersInUI();

	document.getElementById('status').innerHTML = ' (program loaded)';
	enableButtons();

}

function loadSampleProgram(id){
	document.getElementById('mips-program').value = sampleProgram[id];
	loadProgram();
}

function nextStep() {

	if(currentInstruction < instructions.length) {

		document.getElementById('status').innerHTML = 'Instruction Executed: '+instructions[currentInstruction];

		var instruction = instructions[currentInstruction];
		if(instruction.indexOf('halt') != -1) {
			alert('Program Ended!');
			currentInstruction++;
			disableButtons();
			return false;
		} else if(instruction.indexOf('j ') != -1 || instruction.indexOf('$') != -1){
			if(instructionFunctions[getInstruction(instruction)](instruction)){
					updateRegistersInUI();
					currentInstruction++;
			} else {
				alert('Run time error: '+instruction);
				currentInstruction = instructions.length;
				disableButtons();
				return false;
			}
		} else {
			currentInstruction++;
			nextStep();
		}
		return true;
	} else {
		return false;
	}

}

function runProgram(){
	disableButtons();
	while(nextStep());
}