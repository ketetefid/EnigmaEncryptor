import Enigma from '@cubbit/enigma';
import {WebFileStream} from '@cubbit/web-file-stream';
//import {CipherGCM} from 'crypto';
import {Stream} from 'stream';


function decFile(enc_buffer,iv,cb) {


    Enigma.init().then(() =>
	{

	    //console.log ("the whole in the decrypt function=",enc_buffer);
	    
	    const tag = Buffer.from(enc_buffer.slice(-16));
	    const enc_data = Buffer.from(enc_buffer.slice(0,enc_buffer.length-16));
	    const thekey = Buffer.from(iv);

	    const aes = new Enigma.AES();
	    aes.init({key:thekey,key_bits:256,algorithm:Enigma.AES.Algorithm.GCM}).then(()=>{

		console.log("the tag in the decrypt function=",tag);
		console.log("key in the decrypt function=",aes.key,thekey);
		//console.log("the data in the decrypt function=",enc_data);

		let enc_read_stream = new Stream.Readable();
		const dec_stream = aes.decrypt_stream(thekey,tag);


		enc_read_stream.pipe(dec_stream);
		dec_stream.once('finish', () => console.log('File decrypted.'));
		enc_read_stream.on('error',(err) => { console.log('!')});
		
		let dec_buffer = Buffer.alloc(0);
		dec_stream.on('readable', () =>
		    {
			const data = dec_stream.read() as Buffer;
			if(data)
			    dec_buffer = Buffer.concat([dec_buffer, data]);
		    }).once('finish', () => {
			cb(dec_buffer,thekey);
			//console.log(dec_buffer);
		    });
		enc_read_stream.push(enc_data);
		enc_read_stream.push(null);
		
	    });

	});
}

module.exports = decFile;
