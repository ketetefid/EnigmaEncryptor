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
	    aes_stream.once('finish', () => console.log('File encrypted!'));
	    file_stream.pipe(aes_stream);

            let enc_buffer = Buffer.alloc(0);
            aes_stream.on('readable', () =>
		{
		    const data = aes_stream.read() as Buffer;
		    if(data)
			enc_buffer = Buffer.concat([enc_buffer, data]);
		});

            aes_stream.on('end', () =>
		{
		    const tag = (aes_stream as CipherGCM).getAuthTag();
		    let enc_read_stream = new Stream.Readable();
		    const dec_stream = aes.decrypt_stream(iv,tag);

            enc_read_stream.pipe(dec_stream);

		    let dec_buffer = Buffer.alloc(0);
		    dec_stream.on('readable', () =>
			{
			    const data = dec_stream.read() as Buffer;
			    if(data)
				dec_buffer = Buffer.concat([dec_buffer, data]);
			}).once('finish', () => {
			    cb(dec_buffer);
			    console.log("Decrypted!");
			});

		    enc_read_stream.push(enc_buffer);
		    enc_read_stream.push(null);
		});
	});
}

module.exports = encFile;
