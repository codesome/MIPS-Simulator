var sampleProgram = {

sampleProgram1: `
# Sample Program 1

### Airthmetic and Logical operations ###

.text

## Arithmetic ##

	addi $t0 , $zero , 30
	addi $t1 , $zero , 10

	add $t2 , $t0 , $t1

	sub $t3 , $t1 , $t0

	mul $t4 , $t0 , $t1

## Logical ##

	addi $t0 , $zero , 13 #...0001101
	addi $t1 , $zero , 11 #...0001011

	and $t2 , $t0 , $t1 #...0001001
	andi $t3 , $t2 , 12 #...0001001 & ...0001100 = ...0001000

	or $t4 , $t0 , $t1 #...0001111
	ori $t5 , $t0 , 2 #...0001111

	nor $t6 , $t0 , $t1 # ...1110000

	halt

# Expected register values after halt:
#	$t0 = 13 
#	$t1 = 11
#	$t2 = 9
#	$t3 = 8
#	$t4 = 15
#	$t5 = 15
#	$t6 = -16

`,

sampleProgram2: `
# Sample Program 2

### Load Word and Store Word ###

.data

	arr1: .word 1 , 2 , 3 , 4
	arr2: .space 8 # array of 2 words
	val1: .word 99
	val2: .space 4  # 1 word

.text

	la $s0 , arr1
	la $s1 , arr2

	# loading arr1
	lw $t0 , 0($s0)
	lw $t1 , 4($s0)
	lw $t2 , 8($s0)
	lw $t3 , 12($s0)

	# storing into arr2
	sw $t0 , 0($s1)
	sw $t1 , 4($s1)

	addi $sp , $sp , -8

	sw $t2 , 0($sp)
	sw $t3 , 4($sp)

	# loading arr2 and stack
	lw $t4 , 0($s1)
	lw $t5 , 4($s1)
	lw $t6 , 0($sp)
	lw $t7 , 4($sp)

	addi $sp , $sp , 8
	
	# copying val1 to val2
	lw $s2 , val1
	sw $s2 , val2
	lw $s3 , val2

	halt

# Expected register values after halt:
#	$t0 = 1 
#	$t1 = 2
#	$t2 = 3
#	$t3 = 4
#	$t4 = 1
#	$t5 = 2
#	$t6 = 3
#	$t7 = 4
#	$s2 = 99
#	$s3 = 99
#	$sp = [4,3,,,....] (array value)
#	arr1 = [1,2,3,4]
#	arr2 = [1,2]
#	val1 = 99
#	val2 = 99

`,

sampleProgram3: `
# Sample Program 3

### Jump Statements ###

.data
	N: .word 100

.text
	
	lw $s0 , N

	slti $t0 , $s0 , 0
	bne $t0 , $zero , end

	sumN:
		addi $t1 , $t1 , 0 #$t1 = i
		add $s1 , $s1 , $s0 #$s1 = sum
		loop:
			slt $t2 , $t1 , $s0 #i<N
			beq $t2 , $zero , end
			add $s1 , $s1 , $t1 #sum = sum + i
			addi $t1 , $t1 , 1 #i = i + 1
			j loop

	end:
		halt


# Expected register values after halt:
#	$t1 = 100
#	$s0 = 100
#	$s1 = 5050

`,

}