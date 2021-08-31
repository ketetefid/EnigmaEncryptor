import Enigma from '@cubbit/enigma';
import {WebFileStream} from '@cubbit/web-file-stream';
import {CipherGCM} from 'crypto';
import {Stream} from 'stream';


function encFile(file,cb) {


    Enigma.init().then(() =>
	{
	    const file_stream = WebFileStream.create_read_stream(file);
	    const aes = new Enigma.AES();
	    aes.init();
	    const iv = Enigma.Random.bytes(16);

	    const aes_stream = aes.encrypt_stream(iv);
	    aes_stream.once('finish', () => console.log('File encrypted'));
	    file_stream.pipe(aes_stream);

            let enc_buffer = Buffer.alloc(0);
            aes_stream.on('readable', () =>
		{
		    const data = aes_stream.read() as Buffer;
		    if(data)
			enc_buffer = Buffer.concat([enc_buffer, data]);
		}).once('finish', () => {
		    const tag = (aes_stream as CipherGCM).getAuthTag()

		    var enc_bufferwithtag;
		    enc_bufferwithtag = Buffer.concat([enc_buffer, tag]);
		    console.log("the data+tag in the encrypt function=",enc_bufferwithtag);
		    console.log("tag in the encrypt function=",tag);
		    console.log("key in the encrypt function=",iv);
		    console.log("the data in the encrypt function=",enc_buffer);
		    cb(enc_bufferwithtag,iv);
		    });

	});
}

module.exports = encFile;
