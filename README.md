# Client-side Encryption
One of the nicest concepts is how you can encrypt everything before it leaves your device. In this tutorial we are going to setup an environment and demonstrate how to achieve the goal.
# The goal
We want to have an encryption vault where we can upload a file. The file will be encrypted before leaving the client. Upon the upload, the interface will give the user a UUID and an encryption key by which they would be able to retrieve the original file. When a download is requested, the encrypted file will be downloaded and then would be encrypted on the user's device. This way, no sensitive information would be transferred and most of the work will be done client-side.

## Step 1: Setting up the development environment

We would be utilizing Docker to setup an Apache-PHP webserver along with a MySql server for storing the uploaded entries. The following code will got to the `docker-compose.yml` file.
```yml
version: '3.8'
services:
    php-apache-environment:
        container_name: php-apache
        build:
            context: ./php
            dockerfile: Dockerfile
        depends_on:
            - db
        volumes:
            - ./php/:/var/www/html/
        user: nobody
        ports:
            - 8000:80
    db:
        container_name: db
        image: mysql
        restart: always
        environment:
            MYSQL_ROOT_PASSWORD: MYSQL_ROOT_PASSWORD
            MYSQL_DATABASE: MYSQL_DATABASE
            MYSQL_USER: MYSQL_USER
            MYSQL_PASSWORD: MYSQL_PASSWORD
        ports:
            - "9906:3306"
```
`Note` We have mapped a folder named `php` to the document root of the webserver so that we can easily tranfer files to the environment. We will also start the server as `nobody`, so you will have to make a folder named `uploads` and change its ownership to `nobody`. In the folder where you have cloned this repo:
```sh
mkdir -p php/uploads
chown -R nobody php/uploads
```
As well as these steps, the MySql credentials and the ports have been supplied here. The webserver will be available at http://127.0.0.1:8000

In order to make the containers work together, an extra step would be required. Inside the `php` folder create a text file named Dockerfile where you will put the following:
```
FROM php:8.0-apache
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli pdo pdo_mysql
RUN apt-get update && apt-get upgrade -y
```
Finally you can fire up the web system by `docker-compose up`.

## Step 2: NodeJS and the needed programs for JS coding
The whole thing could be done from within NodeJS but I opted for having q separate webserver and DB. Using NodeJS we would developt the codes and then prepare them for the web setup. 
The library we want to utilize is [Enigma](https://github.com/cubbit/enigma). It provides us with the tools to encrypt web streams and many other things. The library itself uses NodeJS run-time environment and TypeScript so in order to make the final code run in our browser, we would need to convert the codes to JavaScript. For this reason, we will install the library along with [Browserify](https://browserify.org) and [tsify](https://www.npmjs.com/package/tsify):
```
npm install @cubbit/enigma @cubbit/web-file-stream browserify tsify
```
## Step 3: Encrypting and decrypting in one go
We want to check if we are able to use the Enigma library well. As it was mentioned, most of the work is going to be done in the client side. The webserver and the DB will only serve as a place for storing our encrypted files but will not have any access to our keys.
We will design a basic web layout where the user can upload his/her file through a form. The file will be encrypted on-the-go and then will fully be decrypted again and will be offered to the user as a download link.
The heart of the procedure lies in the following code employing the Enigma library:
```ts
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
```
Save the code in a file e.g., `cubfunc_onego.ts` and then compile it to make it browser-ready. We want the function `encFile` to be accessible as a stand-alone one hence the `-s encFile` derivative.
```sh
PATH=$(npm bin):$PATH browserify  cubfunc_onego.ts -p [ tsify  ] -o cubfunc_onego.js -s encFile
```
The code will produce a JS file named `cubfunc_onego.js` which can be included as a script in our web page.
Now we setup a simple web page in which we reference our newly created JS file. In one go, we will get the file, encrypt it and then decrypt it and will give it back to the user.

Set up a simple page layout as `index.php` in the `php` folder with the following:
```html
<!DOCTYPE html>
<html>
    <head>
	<meta charset="UTF-8">
	<title>Your Encryption Vault
	</title>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="cubfunc_onego.js" ></script>
    </head>
    <body>
	<h1>Welcome to Your Encryption Vault</h1>
	<div id="updiv">

	    <form id="uploadForm">
		<input type="file" id="myFile" name="myFile" />
		<input type="submit" value="Upload" />
	    </form>

	</div>

	<script>
	 $(document).ready(function () {

	     var encF=$.Deferred();
	     var final_file;
	     function setFile(file) {
		 final_file=file;
		 encF.resolve(true);
	     }


	     $("#uploadForm").on('submit',(function(e) {
		 e.preventDefault();
		 var file_data = $('#myFile').prop('files')[0];   

		 encFile (file_data,setFile);

		 $.when(encF).done(function(){
		     var blob=new Blob([final_file] );
		     var link=document.createElement('a');
		     link.href=window.URL.createObjectURL(blob);
		     link.download="myFileName";
		     link.click();

		 });
	     }));

	 });

	</script>
    </body>
</html>
```
If you upload a file, it should give the same file back to you with the name `myFilename`. You should see a note about encrypting and decrypting in the console as well.



