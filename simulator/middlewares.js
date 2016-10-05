/*
* function: isR_Format
*
* @Params
* 	i = the instruction
*
* returns 'true' if the instruction is of format 'www $xx , $yy , $zz'
*/
function isR_Format(i) {
	if(/^add$|^sub$|^mul$|^or$|^nor$|^and$|^slt$/g.test(getInstruction(i)))
		return /\w+[ ]+\$\w+[ ]*\,[ ]*\$\w+[ ]*\,[ ]*\$\w+/.test(i);
	else 
		return false;
}

/*
* function: isI_Format
*
* @Params
* 	i = the instruction
*
* returns 'true' if the instruction is of format 'www $xx , $yy , zzzz'
*/
function isI_Format(i) {
	if(/^addi$|^slti$|^andi$|^ori$/g.test(getInstruction(i)))
		return /\w+[ ]+\$\w+[ ]*\,[ ]*\$\w+[ ]*\,[ ]*[-]?[0-9]+/.test(i);
	else if(/^beq$|^bne$/g.test(getInstruction(i)))
		return /\w+[ ]+\$\w+[ ]*\,[ ]*\$\w+[ ]*\,[ ]*\w+/.test(i);
	else
		return false;
}

/*
* function: isJ_Format
*
* @Params
* 	i = the instruction
*
* returns 'true' if the instruction is of format 'j label'
*/
function isJ_Format(i) {
	i = i.split(' ');
	return i[0]=='j' && i.length==2;
}

/*
* function: islw_Format1,islw_Format2
*
* @Params
* 	i = the instruction
*
* islw_Format1 returns 'true' if the instruction is of the form 'lw $xx , offset($yy)'
* islw_Format2 returns 'true' if the instruction is of the form 'lw $xx , label''
*/
function islw_Format1(i){
	if(/^lw$|^sw$/g.test(getInstruction(i)))
		return /\w+[ ]+\$\w+[ ]*\,[ ]*[0-9]+\(\$\w+\)/g.test(i);
	else
		return false;
}

function islw_Format2(i){
	if(/^lw$|^sw$|^la$/g.test(getInstruction(i)))
		return /\w+[ ]+\$\w+[ ]*\,[ ]*[\w0-9]+/g.test(i);
	else
		return false;
}

/*
* function: isLabel
*
* @Params
* 	i = the instruction
*
* returns 'true' if it is a label
*/
function isLabel(i) {
	if(i=='halt') return true;
	return /^\w+[ ]*\:$/g.test(i);
}

/*
* function: isLabel
*
* @Params
* 	i = the instruction
*
* returns 'true' if it is a valid label
*/
function validLabel(i) {
	if(i=='halt') return true;
	return /^[a-zA-Z]+[a-zA-Z0-9_]*[ ]*\:$/g.test(i);
}

/*
* function: R_format
*
* @Params
* 	i = the instruction
*
* returns an array containing 'rd' , 'rs' and 'rt'
*/
function R_format(i){
	return /(\$[^, ]*)[^\$]*(\$[^, ]*)[^\$]*(\$[^, ]*)/g.exec(i);
}

/*
* function: I_format
*
* @Params
* 	i = the instruction
*
* returns an array containing 'rd' , 'rs' and the label or the immediate value
*/
function I_format(i){
	return /(\$[^, ]*)[^\$]*(\$[^, ]*)[^A-Za-z0-9\-]*([-]?[A-Za-z0-9]*)/g.exec(i);
}

/*
* function: J_format
*
* @Params
* 	i = the instruction
*
* returns the label followed by 'j'
*/
function J_format(i){
	return /\j\s+(\w+)/g.exec(i);
}

/*
* function: lw_form1
*
* @Params
* 	i = the instruction
*
* returns an array containing 'rd' , the offfset and the register containing the address
*/
function lw_form1(i) { // offset and register
	return /\w+[ ]*(\$\w+)[ ]*\,[ ]*([0-9]+)\((\$\w+)\)/g.exec(i);
}

/*
* function: lw_form2
*
* @Params
* 	i = the instruction
*
* returns an array containing 'rd' and the label
*/
function lw_form2(i) { // label
	return /\w+[ ]*(\$\w+)[ ]*\,[ ]*(\w+)/g.exec(i);
}

/*
* function: getInstruction
*
* @Params
* 	i = the instruction
*
* returns the instruction name of the instruction i
*/
function getInstruction(i){
	return /\w+/g.exec(i)[0];
}

/*
* function: fetchData
* Purpose: To parse the data in the .data section
*
* @Params
* 	i = the instruction
*
* returns an array containing the label,type (word or space) and the content followed after the type , 
*/
function fetchData(i){
	return /(\w+)[ ]*\:[ ]*\.(\w+)[ ]*(.*)/g.exec(i);
}

/*
* function: validateIns
*
* @Params
* 	i = the instruction
*
* returns 'true' if the instruction name is valid
*/
function validateIns(i){
	if(i.indexOf(':')!=-1)
		return isLabel(i);
	else
		return /^add$|^addi$|^sub$|^mul$|^and$|^andi$|^or$|^ori$|^nor$|^slt$|^slti$|^beq$|^bne$|^j$|^lw$|^sw$|^la$|^halt$|^text$/g.test(i);
}

/*
* function: validRegisters
*
* @Params
* 	reg = register name
*
* returns 'true' if the register is valid
*/
function validRegisters(reg){
	return /^\$r0$|^\$at$|^\$v0$|^\$v1$|^\$a0$|^\$a1$|^\$a2$|^\$a3$|^\$t0$|^\$t1$|^\$t2$|^\$t3$|^\$t4$|^\$t5$|^\$t6$|^\$t7$|^\$s0$|^\$s1$|^\$s2$|^\$s3$|^\$s4$|^\$s5$|^\$s6$|^\$s7$|^\$t8$|^\$t9$|^\$k0$|^\$k1$|^\$gp$|^\$sp$|^\$s8$|^\$ra$|^\$zero$/g.test(reg);
}

/*
* function: isConstantReg
*
* @Params
* 	reg = register name
*
* returns 'true' for $zero and $at
*/
function isConstantReg(reg) {
	return /^\$zero$|^\$at$/g.test(reg);
}

/*
* function: isArray_register
*
* @Params
* 	reg = register name
*
* returns 'true' if the register holds and array/address
*/
function isArray_register(reg){
	return registers[reg].constructor == Object && registers[reg].array && registers[reg].array.constructor == Array;
}

/*
* function: isArray_data
*
* @Params
* 	label = label in the data section
*
* returns 'true' the corresponding label in .data section holds >1 word
*/
function isArray_data(label){
	return data[label].constructor == Array;
}

/*
* function: isNumber
*
* @Params
* 	num = number in string form
*
* returns 'true' if the string is a valid number
*/
function isNumber(num) {
	return /^[0-9]*$/g.test(num);
}

/*
* function: labelPosition
*
* @Params
* 	label = label name
*
* returns the position the the label in the array of instructions
*/
function labelPosition(label){
	for(var i=0 ; i<instructions.length ; i++) {
		if(instructions[i].indexOf(':')!=-1 && instructions[i].indexOf(label)!=-1 && (new RegExp('^'+label+'[ ]*\\:','g')).test(instructions[i])) return i;
	}
	return -1;
}

/*
* function: updateRegistersInUI
* Purpose: To update the value of register and the .data section in UI
*/
function updateRegistersInUI() {
	document.getElementById('dataSection').innerHTML = "";

	for(var i=0 ; i<allRegisterNames.length ; i++) { // to update the registers
		if(registers[allRegisters[i]].constructor == Object)
			registerDOM[i].innerHTML = registers[allRegisters[i]].base - (registers[allRegisters[i]].current * 4);
		else
			registerDOM[i].innerHTML = registers[allRegisters[i]];
	}

	var word = '' , space = '';

	for(i in data) { // to update the .data section
		if(data[i].type == 'word'){
			word += '&emsp;<li>'+ i + ': ' + (data[i].array? '['+data[i].array+']': data[i].number) + '<br></li>';
		} else if(data[i].type == 'space') {
			space += '&emsp;<li>'+ i + ': ' + (data[i].array? '['+data[i].array.slice().reverse()+']': data[i].number) + '<br></li>';
		}
	}

	// updated values in the stack
	var stack = '<b>$sp</b> (max size = 100 words) : <br>&emsp;' + (registers['$sp'].array? '['+registers['$sp'].array+']': registers['$sp'].number) + '<br>';
	
	document.getElementById('dataSection').innerHTML = stack + '<br>' + (word==''?'':('<b>.word</b>:<ul>' + word+'</ul>')) + (space==''? '' :('<b>.space</b><ul>' + space + '</ul>'));

}

/*
* function: handleBlankSpaces
* Purpose: To replace multiple blank/tab spaces with single blank space and scrape off the blank space at the beginning/end of the string
*
* @Params
* 	text = a string
*/
function handleBlankSpaces(text){
    if(text){
	    text = text.replace(/\t/g, ' ');
	    text = text.replace(/\s\s+/g, ' ');
	    if(text[text.length-1]==" " || text[text.length-1]=="\t") {
	      text = text.slice(0,text.length-1);
	    }
	    if(text[0]==" " || text[0]=="\t") {
	      text = text.slice(1,text.length);
	    }
	    return text;
    } else {
    	return "";
    }
}

/*
* function: removeBlankSpaces
* Purpose: To remove all the blank/tab spaces
*
* @Params
* 	text = a string
*/
function removeBlankSpaces(text){
    if(text){
	    text = text.replace(/\s/g, '');
	    text = text.replace(/\t/g, '');
	    return text;
    } else {
    	return "";
    }
}

/*
* function: checkForSyntaxError
*
* @Params
* 	i = the instruction
*
* returns 'true' if there is any syntax error in the instruction
*/
function checkForSyntaxError(i) {
	if(isR_Format(i)){ // if R format, check for valid registers for 'rd','rs' and 'rt'
		var reg = R_format(i);
		return !(validRegisters(reg[1]) && validRegisters(reg[2]) && validRegisters(reg[3]));
	} else if(isI_Format(i)) { // if I format, check for valid registers for 'rd' and 'rs'
		var reg = I_format(i);
		return !(validRegisters(reg[1]) && validRegisters(reg[2]));
	} else if(isJ_Format(i) || islw_Format1(i) || islw_Format2(i)) { // check for 'j' and 'lw'
		return false;
	} else { // check for label or '.text'
		return !isLabel(i) && i.indexOf('.text')==-1;
	}
}