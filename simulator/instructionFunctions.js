/*
* Common properties for following 4 functions
*
* @Params
* 	i = the instruction
* 	f = the function specific to the instruction
* 
* returns
*	* 'true' for successful execution of the instruction
*	* 'false' for run time error
*/

// ins $xx , $yy , $zz # ins = 'add' or 'sub'
function add_sub(i,f) {
	var reg = R_format(i);
	var rd = reg[1]; // $xx
	var rt = reg[2]; // $yy
	var rs = reg[3]; // $zz

	if(isConstantReg(rd)) return false; // for constant destination

	if(isArray_register(rt) && isArray_register(rs)) return false; // case of adding array to array

	if(isArray_register(rt)){ // if 'rt' corresponds to and array/address
		
		// modifying the offset of 'rt'
		var offset = registers[rs];
		var index = -offset/4;
		if(offset%4 != 0 || (f(registers[rt].current,index))>=registers[rt].array.length || (f(registers[rt].current,index))<0) return false;

		registers[rd] = JSON.parse(JSON.stringify(registers[rt]));
		registers[rd].current = f(registers[rd].current,index);

	} else if(isArray_register(rs)) { // if 'rs' corresponds to and array/address

		// modifying the offset of 'rs'
		var offset = registers[rt];
		var index = -offset/4;
		// console.log(rs);
		// console.log(currentInstruction,registers['$t2'],offset,registers[rs].current,(f(registers[rs].current,index)));
		// console.log(offset%4 != 0,(f(registers[rs].current,index))>=registers[rs].array.length,(f(registers[rs].current,index))<0);
		if(offset%4 != 0 || (f(registers[rs].current,index))>=registers[rs].array.length || (f(registers[rs].current,index))<0) return false;

		registers[rd] = JSON.parse(JSON.stringify(registers[rs]));
		registers[rd].current = f(registers[rd].current,index);
		
	} else { // if 'rt' and 'rs' are both numbers
		registers[rd] = (f(registers[rt],registers[rs]))|0;
	}

	return true;
}

// ins $xx , $yy , $zz # ins = 'mul' or 'and' or 'or' or 'nor' or 'slt'
function mul_and_or_nor_slt(i,f) {
	var reg = R_format(i);
	var rd = reg[1]; // $xx
	var rt = reg[2]; // $yy
	var rs = reg[3]; // $zz

	if(isConstantReg(rd)) return false;
		
	if(isArray_register(rt) && isArray_register(rs)) return false; // case of multiplying array to array
		
	registers[rd] = (f(registers[rt],registers[rs]))|0;

	return true;
}

// ins $xx , $yy , imm # ins = 'andi' or 'ori' or 'slti'
function andi_ori_slti(i,f) {
	var reg = I_format(i);
	var rd = reg[1]; // $xx
	var rt = reg[2]; // $yy
	var imm = Number(reg[3]); // imm
		
	if(isConstantReg(rd)) return false;
		
	if(isArray_register(rt)) return false; // case of AND of array with a number
		
	if(imm>2147483647 || imm<-2147483648) return false; // limiting to 32 bit number

	registers[rd] = (f(registers[rt],imm))|0;

	return true;
}

// ins $xx , $yy , label # ins = 'beq' or 'bne'
function beq_bne(i,f) {
	var reg = I_format(i);
	var rd = reg[1]; // $xx
	var rt = reg[2]; // $yy
	var label = reg[3]; // label
			
	if(f(registers[rd],registers[rt])) { // if $xx == $yy
		var pos = labelPosition(label);
		if(pos == -1) { // if label not found
			alert('"' + label + '" not found');
			return false;
		} else { // if label found
			currentInstruction = pos;
		}
	}

	return true;
}

/*
* Common properties for following functions in 'instructionFunctions'
*
* @Params
* 	i = the instruction
*
* returns
*	* 'true' for successful execution of the instruction
*	* 'false' for run time error
*/
var instructionFunctions = {

	add: function(i){
		return add_sub(i,function(a,b){ return a+b; });
	},

	addi: function(i){ // addi $xx , $yy , imm

		var reg = I_format(i);
		var rd = reg[1]; // $xx
		var rt = reg[2]; // $yy
		var imm = Number(reg[3]); // imm

		if(isConstantReg(rd)) return false;

		if(imm>2147483647 || imm<-2147483648) return false; // limiting to 32 bit number

		if(isArray_register(rt)){ // if 'rt' corresponds to and array/address

			// modifying the offset of 'rt'
			var offset = imm;
			var index = -(offset/4);
			if(offset%4 != 0 || (registers[rt].current+index)>=registers[rt].array.length || (registers[rt].current+index)<-1) return false;

			registers[rd] = JSON.parse(JSON.stringify(registers[rt]));
			registers[rd].current += index;

		} else { // if 'rt' is a number
			registers[rd] = (registers[rt] + imm)|0;
		}

		return true;

	},

	sub: function(i){
		return add_sub(i,function(a,b){ return a-b; });
	},

	mul: function(i){ 
		return mul_and_or_nor_slt(i,function(a,b){ return a*b; });
	},

	and: function(i){
		return mul_and_or_nor_slt(i,function(a,b){ return a&b; });
	},

	andi: function(i){
		return andi_ori_slti(i,function(a,b){ return a&b; });
	},

	or: function(i){
		return mul_and_or_nor_slt(i,function(a,b){ return a|b; });
	},

	ori: function(i){
		return andi_ori_slti(i,function(a,b){ return a|b; });
	},

	nor: function(i){
		return mul_and_or_nor_slt(i,function(a,b){ return ~(a|b); });
	},

	slt: function(i){
		return mul_and_or_nor_slt(i,function(a,b){ return a<b?1:0; });
	},

	slti: function(i){
		return andi_ori_slti(i,function(a,b){ return a<b?1:0; });
	},

	beq: function(i){ 
		return beq_bne(i,function(a,b){ return a==b; });
	},

	bne: function(i){
		return beq_bne(i,function(a,b){ return a!=b; });
	},

	j: function(i){ // j label

		var reg = J_format(i);
		var label = reg[1]; // label

		var pos = labelPosition(label);
			
		if(pos == -1) { // if label not found
			alert('"' + label + '" not found');
			return false;
		} else { // if label found
			currentInstruction = pos;
		}

		return true;

	},

	lw: function(i){

		if(islw_Format1(i)) { // lw $xx , offset($yy)

			var d = lw_form1(i);
			var rd = d[1]; // $xx
			var offset = Number(d[2]); // offset
			var arr = registers[d[3]].array; // $yy

			if(isConstantReg(rd)) return false;
			
			if(offset%4 != 0 || !arr) return false;

			offset /= 4;
			var index = (registers[d[3]].current||0) - offset; // index from the offset

			if(index>=arr.length || index<0) return false;
			registers[rd] = arr[index]|0; // loading the word

		} else if(islw_Format2(i)) { // lw $xx , label

			var d = lw_form2(i);
			var rd = d[1]; // $xx
			var label = d[2]; // label

			if(isConstantReg(rd)) return false;
			
			if(data[label].constructor != Object || data[label].array) return false; // if its array or not an address
			
			registers[rd] = data[label].number|0; // loading the word

		} else { // invalid lw format
			return false;
		}

		return true;

	},

	sw: function(i){

		if(islw_Format1(i)) { // sw $xx , offset($yy)

			var d = lw_form1(i);
			var rd = d[1]; // $xx
			var offset = Number(d[2]); // offset
			var arr = registers[d[3]].array; // $yy

			if(isArray_register(rd)) return false;

			if(offset%4 != 0 || !arr) return false;

			offset /= 4;
			var index = (registers[d[3]].current||0) - offset; // index from the offset

			if(index>=arr.length || index<0) return false;

			registers[d[3]].array[index] = registers[rd]|0;  // storing the word
			if(registers[d[3]].label) data[registers[d[3]].label].array[index] = registers[rd]|0;

		} else if(islw_Format2(i)){ // sw $xx , label

			var d = lw_form2(i);
			var rd = d[1]; // $xx
			var label = d[2]; // label

			if(data[label].constructor != Object || data[label].array || registers[rd].constructor == Object) return false;
			
			data[label].number = registers[rd]|0; // storing the word

		} else { // invalid sw format
			return false;
		}

		return true;

	},

	la : function(i) { // la $xx , label
		
		if(islw_Format2(i)) {

			var d = lw_form2(i);
			var rd = d[1]; // $xx
			var label = d[2]; // label

			if(isConstantReg(rd) || !data[label]) return false;
			
			if(data[label].constructor == Object && data[label].array){ // if label contains array
				if(data[label].type == 'word'){ // type = word
					registers[rd] = {
						array: data[label].array.slice().reverse(),
						current: data[label].array.length-1,
						base: data[label].base,
						label: label
					};
				} else { // type = space
					registers[rd] = {
						array: data[label].array,
						current: data[label].array.length-1,
						base: data[label].base,
						label: label
					};
				}
			} else if(data[label].constructor == Object) { // if label contains single word
				registers[rd] = {
					array: [data[label].number],
					current: 0 ,
					base: data[label].base,
					label: label
				};
			} else { // invalid label
				return false;
			}
			
			return true;

		} else { // invalid la format
			return false;
		}

	}

};