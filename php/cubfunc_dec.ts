import Enigma from '@cubbit/enigma';
import {WebFileStream} from '@cubbit/web-file-stream';
//import {CipherGCM} from 'crypto';
import {Stream} from 'stream';


function decFile(enc_buffer,iv,cb) {


    Enigma.init().then(() =>
	{

	    
	    const aes = new Enigma.AES();
	    aes.init();

	    console.log ("the whole in the decrypt function=",enc_buffer);
	    
	    const tag = enc_buffer.slice(-16);
	    const enc_data = enc_buffer.slice(0,enc_buffer.length-16);


	    console.log("the tag in the decrypt function=",tag);
	    console.log("iv in the decrypt function=",iv);
	    console.log("the data in the decrypt function=",Buffer.from(enc_data));
	    let enc_read_stream = new Stream.Readable();

	    enc_read_stream.push(Buffer.from(enc_data));
	    enc_read_stream.push(null);
	    enc_read_stream.emit('error',(err) => { console.log('!')})
	    
	    const dec_stream = aes.decrypt_stream(Buffer.from(iv),Buffer.from(tag));
	    enc_read_stream.pipe(dec_stream);
	    dec_stream.once('finish', () => console.log('File decrypted'));
	    
	    let dec_buffer = Buffer.alloc(0);
	    dec_stream.on('readable', () =>
		{
		    const data = dec_stream.read() as Buffer;
		    if(data)
			dec_buffer = Buffer.concat([dec_buffer, data]);
		}).once('finish', () => {
		    cb(dec_buffer,iv);
		    //console.log(dec_buffer);
		});

	});
}

module.exports = decFile;
