function isR_Format(i) {
	return /\w+[ ]*\$\w+[ ]*\,[ ]*\$\w+[ ]*\,[ ]*\$\w+/.test(i);
}

function isI_Format(i) {
	return /\w+[ ]*\$\w+[ ]*\,[ ]*\$\w+[ ]*\,[ ]*[-]?\w+/.test(i);
}

function isJ_Format(i) {
	i = i.split(' ');
	return i[0]=='j' && i.length==2;
}

function islw_Format1(i){
	return /\w+[ ]*\$\w+[ ]*\,[ ]*[0-9]+\(\$\w+\)/g.test(i);
}

function islw_Format2(i){
	return /\w+[ ]*\$\w+[ ]*\,[ ]*[\w0-9]+/g.test(i);
}

function isLabel(i) {
	if(i=='halt') return true;
	return /^\w+[ ]*\:$/g.test(i);
}

function R_format(i){
	return /(\$[^, ]*)[^\$]*(\$[^, ]*)[^\$]*(\$[^, ]*)/g.exec(i);
}

function I_format(i){
	return /(\$[^, ]*)[^\$]*(\$[^, ]*)[^A-Za-z0-9\-]*([-]?[A-Za-z0-9]*)/g.exec(i);
}

function J_format(i){
	return /\j\s+(\w+)/g.exec(i);
}


function lw_form1(i) { // offset and register
	return /\w+[ ]*(\$\w+)[ ]*\,[ ]*([0-9]+)\((\$\w+)\)/g.exec(i);
}

function lw_form2(i) { // label
	return /\w+[ ]*(\$\w+)[ ]*\,[ ]*(\w+)/g.exec(i);
}

function getInstruction(i){
	return /\w+/g.exec(i)[0];
}

function fetchData(i){
	return /(\w+)[ ]*\:[ ]*\.(\w+)[ ]*(.*)/g.exec(i);
}

function validateIns(i){
	if(i.indexOf(':')!=-1)
		return isLabel(i);
	else
		return /^add$|^addi$|^sub$|^mul$|^and$|^andi$|^or$|^ori$|^nor$|^slt$|^slti$|^beq$|^bne$|^j$|^lw$|^sw$|^la$|^halt$|^text$/g.test(i);
}

function validRegisters(reg){
	return /^\$r0$|^\$at$|^\$v0$|^\$v1$|^\$a0$|^\$a1$|^\$a2$|^\$a3$|^\$t0$|^\$t1$|^\$t2$|^\$t3$|^\$t4$|^\$t5$|^\$t6$|^\$t7$|^\$s0$|^\$s1$|^\$s2$|^\$s3$|^\$s4$|^\$s5$|^\$s6$|^\$s7$|^\$t8$|^\$t9$|^\$k0$|^\$k1$|^\$gp$|^\$sp$|^\$s8$|^\$ra$|^\$zero$/g.test(reg);
}

function isConstantReg(reg) {
	return /^\$zero$|^\$at$/g.test(reg);
}

function isArray_register(reg){
	return registers[reg].constructor == Object && registers[reg].array && registers[reg].array.constructor == Array;
}

function isArray_data(label){
	return data[label].constructor == Array;
}

function isNumber(num) {
	return /^[0-9]*$/g.test(num);
}

function labelPosition(label){
	for(var i=0 ; i<instructions.length ; i++) {
		if(instructions[i].indexOf(':')!=-1 && instructions[i].indexOf(label)!=-1 && (new RegExp('^'+label+'[ ]*\\:','g')).test(instructions[i])) return i;
	}
	return -1;
}

function updateRegistersInUI() {
	document.getElementById('dataSection').innerHTML = "";

	for(var i=0 ; i<allRegisterNames.length ; i++) {
		if(registers[allRegisters[i]].constructor == Object)
			registerDOM[i].innerHTML = registers[allRegisters[i]].base - (registers[allRegisters[i]].current * 4);
		else
			registerDOM[i].innerHTML = registers[allRegisters[i]];
	}

	var word = '' , space = '';

	for(i in data) {
		if(data[i].type == 'word'){
			word += i + ': ' + (data[i].array? '['+data[i].array+']': data[i].number) + '<br>';
		} else if(data[i].type == 'space') {
			space += i + ': ' + (data[i].array? '['+data[i].array.slice().reverse()+']': data[i].number) + '<br>';
		}

		document.getElementById('dataSection').innerHTML = (word==''?'':('.word:<br>' + word)) + (space==''? '' :('<br><br>.space<br>' + space));

	}

}

function handleBlankSpaces(text){
    if(text){
	    text = text.replace('\t', ' ');
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

function removeBlankSpaces(text){
    if(text){
	    text = text.replace(/\s/g, '');
	    text = text.replace(/\t/g, '');
	    return text;
    } else {
    	return "";
    }
}

function checkForSyntaxError(i) {
	if(isR_Format(i)){
		var reg = R_format(i);
		return !(validRegisters(reg[1]) && validRegisters(reg[2]) && validRegisters(reg[3]));
	} else if(isI_Format(i)) {
		var reg = I_format(i);
		return !(validRegisters(reg[1]) && validRegisters(reg[2]));
	} else if(isJ_Format(i) || islw_Format1(i) || islw_Format2(i)) {
		return false;
	} else {
		return !isLabel(i) && i.indexOf('.text')==-1;
	}
}