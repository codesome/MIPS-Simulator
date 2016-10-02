var instructionFunctions = {

	add: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;

		if(isArray_register(rt) && isArray_register(rs)) return false;

		if(isArray_register(rt)){

			var offset = registers[rs];
			var index = offset/4;
			if(offset%4 != 0 || (registers[rt].current+index)>=registers[rt].array.length || (registers[rt].current+index)<0) return false;

			registers[rd] = registers[rt];
			registers[rd].current += index;

		} else if(isArray_register(rs)) {

			var offset = registers[rt];
			var index = offset/4;
			if(offset%4 != 0 || (registers[rs].current+index)>=registers[rs].array.length || (registers[rs].current+index)<0) return false;

			registers[rd] = registers[rs];
			registers[rd].current += index;
		
		} else {
			registers[rd] = (registers[rt] + registers[rs])|0;
		}


		return true;

	},

	addi: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var imm = Number(reg[3]);

		if(isConstantReg(rd)) return false;

		if(imm>2147483647 || imm<-2147483648) return false;

		if(isArray_register(rt)){

			var offset = imm;
			var index = -(offset/4);
			if(offset%4 != 0 || (registers[rt].current+index)>=registers[rt].array.length || (registers[rt].current+index)<0) return false;

			registers[rd] = registers[rt];
			registers[rd].current += index;

		} else {
			registers[rd] = (registers[rt] + imm)|0;
		}


		return true;

	},

	sub: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = (registers[rt] - registers[rs])|0;

		return true;

	},

	mul: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = (registers[rt] * registers[rs])|0;

		return true;

	},

	and: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = (registers[rt] & registers[rs])|0;

		return true;

	},

	andi: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var imm = Number(reg[3]);
			
		if(isConstantReg(rd)) return false;
		
		if(imm>2147483647 || imm<-2147483648) return false;

		registers[rd] = (registers[rt] & imm)|0;

		return true;

	},

	or: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = (registers[rt] | registers[rs])|0;

		return true;

	},

	ori: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var imm = Number(reg[3]);
			
		if(isConstantReg(rd)) return false;
		
		if(imm>2147483647 || imm<-2147483648) return false;

		registers[rd] = (registers[rt] | imm)|0;

		return true;

	},

	nor: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = (~((registers[rt] | registers[rs])|0))|0;

		return true;

	},

	slt: function(i){

		var reg = R_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var rs = reg[3];

		if(isConstantReg(rd)) return false;
		
		registers[rd] = registers[rt]<registers[rs] ? 1 : 0;

		return true;

	},

	slti: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var imm = Number(reg[3]);
			
		if(isConstantReg(rd)) return false;
		
		if(imm>2147483647 || imm<-2147483648) return false;

		registers[rd] = registers[rt]<imm ? 1 : 0;

		return true;

	},

	beq: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var label = reg[3];
			
		if(registers[rd]==registers[rt]) {
			var pos = labelPosition(label);
			if(pos == -1) {
				alert('"' + label + '" not found');
				return false;
			} else {
				currentInstruction = pos;
			}
		}

		return true;

	},

	bne: function(i){

		var reg = I_format(i);
		var rd = reg[1];
		var rt = reg[2];
		var label = reg[3];
			
		if(registers[rd]!=registers[rt]) {
			var pos = labelPosition(label);
			if(pos == -1) {
				alert('"' + label + '" not found');
				return false;
			} else {
				currentInstruction = pos;
			}
		}

		return true;

	},

	j: function(i){

		var reg = J_format(i);
		var label = reg[1];

		var pos = labelPosition(label);
			
		if(pos == -1) {
			alert('"' + label + '" not found');
			return false;
		} else {
			currentInstruction = pos;
		}

		return true;

	},

	lw: function(i){

		if(islw_Format1(i)) {

			var d = lw_form1(i);
			var rd = d[1];
			var offset = Number(d[2]);
			var arr = registers[d[3]].array;

			if(isConstantReg(rd)) return false;
			
			if(offset%4 != 0 || !arr) return false;

			offset /= 4;
			var index = (registers[d[3]].current||0) - offset;

			if(index>=arr.length || index<0) return false;
			registers[rd] = arr[index]|0;

		} else if(islw_Format2(i)) {

			var d = lw_form2(i);
			var rd = d[1];
			var label = d[2];

			if(isConstantReg(rd)) return false;
			
			if(data[label].constructor != Object || data[label].array) return false;
			
			registers[rd] = data[label].number|0;

		} else {
			return false;
		}

		return true;

	},

	sw: function(i){

		if(islw_Format1(i)) {

			var d = lw_form1(i);
			var rd = d[1];
			var offset = Number(d[2]);
			var arr = registers[d[3]].array;

			if(isArray_register(rd)) return false;

			if(offset%4 != 0 || !arr) return false;

			offset /= 4;
			var index = (registers[d[3]].current||0) - offset;
			if(index>=arr.length || index<0) return false;

			registers[d[3]].array[index] = registers[rd]|0;
			if(registers[d[3]].label) data[registers[d[3]].label].array[index] = registers[rd]|0;

		} else if(islw_Format2(i)){

			var d = lw_form2(i);
			var rd = d[1];
			var label = d[2];

			if(data[label].constructor != Object || data[label].array || registers[rd].constructor == Object) return false;
			
			data[label].number = registers[rd]|0;

		} else {
			return false;
		}

		return true;

	},

	la : function(i) {
		
		if(islw_Format2(i)) {

			var d = lw_form2(i);
			var rd = d[1];
			var label = d[2];

			if(isConstantReg(rd)) return false;
			
			if(data[label].constructor == Object && data[label].array){
				if(data[label].type == 'word'){
					registers[rd] = {
						array: data[label].array.slice().reverse(),
						current: data[label].array.length-1,
						base: data[label].base,
						label: label
					};
				} else {
					registers[rd] = {
						array: data[label].array,
						current: data[label].array.length-1,
						base: data[label].base,
						label: label
					};
				}
			} else {
				registers[rd] = {
					array: [data[label].number],
					current: 0 ,
					base: data[label].base,
					label: label
				};
			}
			
			return true;

		} else {
			return false;
		}

	}

};