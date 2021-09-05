// We create the alphabet of the allowed ascii values and the index
var asciiLetters = [],indx=[];
var i = 32, j=125;
for (; i <= j; ++i) {
    indx.push(i);
    asciiLetters.push(String.fromCharCode(i)); //string.charCodeAt(0) gives us the decimal ascii equivalent
}

// Split string to chunks of length n
function toChunk(str, n) {
    return str.match(new RegExp('.{1,' + n + '}', 'g'));
}

// Reverse the string
function revStr(str) {
    // Step 1. Use the split() method to return a new array
    var splitString = str.split(""); 
    
    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse();
    
    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join("");

    return joinArray;
}

// Returns sum of an ascii-equivalent of a string
function sumAscii (str) {
    var strarr=toChunk(str,1);
    var astr = [];
    var s = 0;
    for ( let i=0 ; i<str.length ; i++ ) {
	astr.push (strarr[i].charCodeAt(0));
	s = s + strarr[i].charCodeAt(0);
    }
    // astr will have the ascii-equivalet array
    return s;   
}

console.log(asciiLetters);
console.log(indx);

function ascii_encrypt ( mes , key ) {

    // Split the string into chunks of the key length
    var step1 = toChunk(mes,key.length);

    // Reverse each chunk
    var step2 = []; 

    for ( let i=0 ; i<step1.length ; i++ ) {
	step2.push (revStr(step1[i]));
    }

    // Shift downward each character of the chunk in step2 by decimal ascii sum
    // of key.length in the table of ascii values i.e., asciiLetters.

    var step3 = [];
    var st = sumAscii(key) % asciiLetters.length;

    var schunk;
    for ( var i=0 ; i<step2.length ; i++ ) {

	// convert the chunk to array of single characters
	schunk = toChunk(step2[i], 1);
	
	var tempstep = [];
	var newChar, ic;
	for ( var j=0 ; j<schunk.length ; j++ ) {
	    ic = (schunk[j].charCodeAt(0)-32+st)%asciiLetters.length;
	    newChar = asciiLetters[ic]
	    tempstep.push (newChar) ;
	}
	
	// rejoin the characters and reverse the chunk
	step3.push(revStr(tempstep.join(""))); 
    }
    // rejoin the parts and return it
    return step3.join("");

}


function ascii_decrypt ( mes , key ) {

    // Split the string into chunks of the key length again
    var step1 = toChunk(mes,key.length);

    // Reverse each chunk
    var step2 = []; 

    for ( let i=0 ; i<step1.length ; i++ ) {
	step2.push (revStr(step1[i]));
    }

    // Shift downward each character of the chunk in step2 by decimal ascii sum
    // of key.length in the table of ascii values i.e., asciiLetters.

    var step3 = [];
    var st = sumAscii(key) % asciiLetters.length;

    var schunk;
    for ( var i=0 ; i<step2.length ; i++ ) {

	// convert the chunk to array of single characters
	schunk = toChunk(step2[i], 1);
	
	var tempstep = [];
	var newChar, ic;
	for ( var j=0 ; j<schunk.length ; j++ ) {
	    ic = (schunk[j].charCodeAt(0)-32-st)%asciiLetters.length;
	    if (ic<0) ic = ic + asciiLetters.length;
	    newChar = asciiLetters[ic]
	    tempstep.push (newChar) ;
	}

	// rejoin the characters and reverse the chunk
	step3.push(revStr(tempstep.join(""))); 
    }
    // rejoin the parts and return it
    return step3.join("");

}

var mes, key;
mes = "Nothing is impossible, the word itself says 'I’m possible'!";
key = "Anyt#!ng";



var enc_mes = ascii_encrypt(mes,key);
console.log(enc_mes);

var dec_mes = ascii_decrypt(enc_mes, key);
console.log(dec_mes);

