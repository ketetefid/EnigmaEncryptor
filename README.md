# Client-side Encryption
One of the nicest concepts is how you can encrypt everything before it leaves your device. In this tutorial we are going to setup an environment and demonstrate how to achieve the goal.
# The goal
We want to have an encryption vault where we can upload a file. The file will be encrypted before it leaves the client. Upon the upload, the interface will give the user a UUID and an encryption key by which they would be able to retrieve the original file later. When a download is requested, the encrypted file will be downloaded and then would be encrypted on the user's device. This way, no sensitive information would be transferred and most of the work will be done client-side.
![](/php/img/demo.gif)
:point_right: If you would like to test the final product as a full implementation, you may clone this repository and set it up according to Step 1 below. The web app will be available at http://127.0.0.1:8000 where you can encrypt and upload your files, and download and decrypt them as well.

The other steps presented here will give you informatin on how one can develop such an app in more details.
## Step 1: Setting up the development environment
We would be utilizing Docker to setup an Apache-PHP webserver along with a MySql server for storing the uploaded entries. Also, a containerized version of ReactJS for UI development will be included. 
Navigate to the root folder of your ReactJS project and clone this repository without creating an extra folder:
```sh
git clone https://github.com/ketetefid/EnigmaEncryptor .
```

:point_right: `Note 1:` We have mapped a folder named `php` to the document root of the Apache webserver so that we can easily tranfer files to the environment. We will also start the server as `nobody`, so you will need to change its ownership to `nobody`:
```sh
chown -R nobody php/uploads
```
Now you can fire up the web system by `docker-compose up`. The apache-php webserver will be available at http://127.0.0.1:8000 and the ReactJS webserver will be accessible at http://127.0.0.1:3001.

:point_right: `Note 2:` If you want to interact with the Apache webserver from the ReactJS side and be able to send get/post requests and connect to the DB from there, you need to modify some files accordingly:
1. Add the following line of code to the beginning of `php/upload.php`.
```php
header('Access-Control-Allow-Origin: http://127.0.0.1:3001');
```
2. Replace all the urls in the js scripts/declarations for get/post requests with the complete form of `http://127.0.0.1:8000/upload.php`.
## Step 2: NodeJS and the needed programs for JS coding
 
Obviously we would need NodeJS. The libraries we want to utilize are developed by [Cubbit](https://github.com/cubbit/). The tools provide us with the ability to encrypt web streams and do many other things in the area of encryption. The libraries themselves use NodeJS run-time environment and TypeScript so in order to make the final code run in our browser, we would need to convert the codes to JavaScript. We will install the library along with [Browserify](https://browserify.org) and [tsify](https://www.npmjs.com/package/tsify) in our system. 
```
npm install @cubbit/enigma @cubbit/web-file-stream browserify tsify
```
The `engima` and `web-file-stream` libraries will also be used in the ReactJS app.
## Step 3: Encrypting and decrypting in one go
We want to check if we are able to use the Enigma library well. As it was mentioned, most of the work is going to be done in the client side. The webserver and the DB will only serve as a place for storing our encrypted files, and they will not have any access to our keys.
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

## Step 4: The DB implementation
The last step was done to help us get familiar with the procedure, as debugging with a full setup might become very time-consuming. Now that we have been able to make use of the Enigma library, we will construct a database where the information for the encrypted files will be stored.
When the user uploads a file, through a post request to our server, the encrypted file info will be placed in a table. In return, a unique ID about the uploaded file (which will be retrieved from the server) and the encryption key (which is extracted in the browser) will be given back to the user. This will enable him/her to request a download later by submitting the ID and the key. 
In the `php` folder, populate a file named `upload.php` with the following content:
```php
<?php

// The MySQL service named in the docker-compose.yml.
$host = 'db';

// Database use name
$user = 'MYSQL_USER';

//database user password
$pass = 'MYSQL_PASSWORD';

// database name
$mydatabase = 'MYSQL_DATABASE';
// check the mysql connection status

$conn = new mysqli($host, $user, $pass, $mydatabase);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$mytable="enc_filesDB";

// For resetting the table if you want
/*
   $sql = "DROP TABLE IF EXISTS $mytable";

   if ($conn->query($sql) !== TRUE) {
   echo "\nError deleting table: " . $conn->error;
   }
 */

// Creating the table
$sql = "
CREATE TABLE IF NOT EXISTS $mytable
  (
     id       INT NOT NULL auto_increment,
     uuid     TEXT NOT NULL,
     filename TEXT NOT NULL,
     size     TEXT NOT NULL,
     PRIMARY KEY (id)
  )  
";

if ($conn->query($sql) !== TRUE) {
    echo "\nError creating the table: " . $conn->error;
}
// An implementation when the user has submitted a file for upload 
if (isset($_POST['encfile'])) {

    $blob = $_POST['encfile'];
    $blobuid = bin2hex(random_bytes(16));
    $blobpath = './uploads/'.bin2hex(random_bytes(20)); // to force usage of the form
    file_put_contents ($blobpath,$blob);
    $blobmeta = stat($blobpath);
    $blobsize = $blobmeta['size'];

    $sql = "INSERT INTO $mytable (id,uuid,filename,size) VALUES (0,'$blobuid','$blobpath','$blobsize')";
    
    if ($conn->query($sql) !== TRUE) {
	echo "\nError inserting entries. " . $conn->error;
    }

    // Send the UUID back
    echo $blobuid;

}

// Another implementation when the user has submitted a file for upload 
if (isset($_FILES["encfile"])) {
    $blobuid = bin2hex(random_bytes(16));
    $blobpath = './uploads/'.bin2hex(random_bytes(20)); // to force usage of the form
    if (move_uploaded_file($_FILES["encfile"]["tmp_name"], $blobpath) !== TRUE) {
	echo "The blob was NOT uploaded successfully.";
    }
    
    $blobmeta = stat($blobpath);
    $blobsize = $_FILES["encfile"]["size"];

    $sql = "INSERT INTO $mytable (id,uuid,filename,size) VALUES (0,'$blobuid','$blobpath','$blobsize')";
    
    if ($conn->query($sql) !== TRUE) {
	echo "\nError inserting entries. " . $conn->error;
    }

    // Send the UUID back
    echo $blobuid;
}

if (isset($_POST['mykey']) and isset($_POST['myuuid'])) {

    $fuuid = $_POST['myuuid'];
    $deckey = $_POST['mykey'];

    // Bad practice because of injection
    //$sql = "SELECT filename FROM $mytable WHERE uuid = '".$fuuid."'";
    //$rs = $conn->query($sql);


    $sql = "SELECT filename FROM $mytable WHERE uuid = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s',$fuuid);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
	$thefilename=$row['filename'];
    }
    
    echo $thefilename;
}

// closing connection
$conn->close();
?>
```
As it is clear, the file includes information on how to connect to the DB. It creates a table with `id`, `uuid`, `filename` and `size` columns where the filename stores the path of the encrypted file. In the last two sections, the server accepts post requests when the user submits his/her encrypted file, and it will store the data in the table giving back the ID. In the last post check, it will retrieve the information form the DB when a user wants to download the uploaded file, by giving back the path to the hosted encrypted file. Again, this is only for storing information and the encryption/decryption is going to be done on the client side.

## Step 5: Uploading, encrypting, storing -> retrieving, decrypting, downloading

Now we want to expand our webpage so that upon uploading a file, it encrypts it and sends a request to the server to store the file and its data. Then, it will show the ID and the encryption key to the user. Later, when a user submits the key and ID, the page will fetch the encrypted file data from the DB and will receive the path to the encrypted file. The page will get it, decrypt it and will offer the download to the user.

At this point we will write two TS functions, one for encrypting and the other for decrypting. These will be included in our page in the script tag.

The encrypting function:
```js
import Enigma from '@cubbit/enigma';
import {WebFileStream} from '@cubbit/web-file-stream';
import {CipherGCM} from 'crypto';
import {Stream} from 'stream';


function encFile(file,cb) {

    Enigma.init().then(() =>
	{
	    const file_stream = WebFileStream.create_read_stream(file);
	    const aes = new Enigma.AES();
	    const iv = Enigma.Random.bytes(16);
	    aes.init({key:iv,key_bits:256,algorithm:Enigma.AES.Algorithm.GCM}).then(()=>{


		const aes_stream = aes.encrypt_stream(iv);
		aes_stream.once('finish', () => console.log('File encrypted.'));
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
			//console.log("the data+tag in the encrypt function=",enc_bufferwithtag);
			console.log("tag in the encrypt function=",tag);
			console.log("key in the encrypt function=",iv,"aes.key=",aes.key);
			//console.log("the data in the encrypt function=",enc_buffer);
			cb(enc_bufferwithtag,iv);
		    });
	    });

	});
}

module.exports = encFile;
```
And the function for decrypting:
```js
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
```
Now we will compile them and include the produced JS files in our webpage.  Of course, we can merge the two functions in one file if we wanted.
```sh
PATH=$(npm bin):$PATH browserify  cubfunc_enc.ts -p [ tsify ] -o cubfunc_enc.js -s encFile
PATH=$(npm bin):$PATH browserify  cubfunc_dec.ts -p [ tsify ] -o cubfunc_dec.js -s decFile
```
Our index.php will be adapted to do the fetching and calling the functions:
```html
<!DOCTYPE html>
<html>
    <head>
	<meta charset="UTF-8">
	<title>Your Encryption Vault
	</title>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="cubfunc_enc.js" ></script>
	<script src="cubfunc_dec.js" ></script>
    </head>
    <body>
	<h1>Welcome to Cubbit Encryption Service</h1>
	<div id="updiv">

	    <form id="uploadForm">
		<input type="file" id="myFile" name="myFile" />
		<input type="submit" value="Upload" />
	    </form>

	</div>
	<p id="encuuid"></p><p id="enckey"></p>
	<br><br>
	<div id="downdiv">
	    <form id="downloadForm">
		Enter the File UUID:<input type="text" id="myuuid" name="myuuid" required/>
		Enter the Key:<input type="text" id="myKey" name="myKey" required/>
		<input type="submit" value="Download" />
	    </form>
	    <iframe id="download_iframe" style="display:none;"></iframe>
	</div>

	<script>
	 function buf2hex(buffer) { 
	     return [...new Uint8Array(buffer)]
		 .map(x => x.toString(16).padStart(2, '0'))
		 .join('');
	 }

	 const hex2buf = hexString =>
	     new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
	 
	 $(document).ready(function () {

	     var encF=$.Deferred();
	     var decF=$.Deferred();
	     var final_file;
	     var mykey;
	     function setFile(file,key) {
		 //console.log(file);
		 final_file=file;
		 mykey=key;
		 encF.resolve(true);

	     }
	     var final_file2;
	     function setFile2(file,key) {
		 //console.log(file);
		 final_file2=file;
		 mykey=key;
		 decF.resolve(true);
	     }


	     $("#uploadForm").on('submit',(function(e) {
		 e.preventDefault();
		 var file_data = $('#myFile').prop('files')[0];   

		 var form_data = new FormData();
		 encFile (file_data,setFile);

		 $.when(encF)
		  .done(function(){

		      var blob=new Blob([final_file]);

		      form_data.append('encfile', blob);})
		  .done(function(){

		      $.ajax({
			  url: "upload2.php",
			  type: "POST",
			  data:  form_data,
			  contentType: false,
			  cache: false,
			  processData: false,
			  success: function(encdata){
			      $("#encuuid").html("Your UUID for this file is: "+encdata).show();
			      $("#enckey").html("Your encryption key for this file is: "+buf2hex(mykey)).show();
			  }           
		      });
		  });
	     }));

	     $("#downloadForm").on('submit',(function(e) {
		 e.preventDefault();

		 var uuid = $("#myuuid").val();
		 var key = $('#myKey').val();

		 var form_data = new FormData();
		 form_data.append("mykey", key);
		 form_data.append("myuuid",uuid);
		 $.ajax({
		     url: "upload2.php",
		     type: "POST",
		     data:  form_data,
		     contentType: false,
		     cache: false,
		     processData: false,
		     success: function(dpath){
			 var encfile;
			 //document.getElementById('download_iframe').src = dpath;
			 var xhr = new XMLHttpRequest();
			 xhr.open('GET', dpath, true);
			 xhr.responseType = 'arraybuffer';

			 xhr.onload = function(e) {
			     var uInt8Array = new Uint8Array(this.response); 

			     decFile(uInt8Array,hex2buf(key),setFile2);
			     $.when(decF).done(function(){
				 console.log("done");
				 var blob=new Blob([final_file2] );
				 var link=document.createElement('a');
				 link.href=window.URL.createObjectURL(blob);
				 link.download="myFileName";
				 link.click();
			     });

			 };

			 xhr.send();
			 console.log("the path to the encrypted file=",dpath);
		     }           
		 });
	     }));
	 });

	</script>
    </body>
</html>
```
Now our page is fully operating. It can encrypt and upload, and decrypt and download as well.

## Step 6: Polishing and beautification
Now that we have learned the fundamentals, we are able to further polish our web app. At this point, you can either go the traditional route of building websites, or use a modern tool like ReactJS. While the current UI was built from the ground up, it can be ported to ReactJS. Nonetheless, it is better to start developing a more component-based UI in ReactJS or other similar development frameworks.

## Step 7: Further security practices
The story of encryption does not end here. While there are several battle-tested algorithms that you can use and should use, on top of that, you have the option to implement your own encryption/decryption algorithm! Your own algorithm will not serve as the main encryption method, however, it has the ability to bring in more anonymity to the data. The strength lies in the fact that nobody knows what method you used for encryption, and you don't have to tell them either.

As an example, consider the following algorithm to encrypt a message:

Consider a random word as a key.
1. The message is split into chunks of the size of the key length.
2. Each chunk is reversed.
3. Each character is replaced with its ASCII code.
4. The code is shifted upward by n positions in the table of ASCII codes, where n is the sum of ASCII decimal codes of our key.
5. We limit the ASCII table to values between ASCII codes 32 (" ") and 125 ("}") included. If the upshift exceeds the alphabet's length, we would start from the beginning of the table.
6. After the operation, we would reverse the chunk again.

The code for this algorithm has been supplied in the file `textEncryptor.js` in this repository.
For example, consider the following message and key:
```js
Message="Nothing is impossible, the word itself says 'I'm possible'!"
Key="Anyt#!ng"
```
then the message will be encrypted to:
![](/php/img/enctestsample.png)

