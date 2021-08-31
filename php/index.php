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
			  url: "upload.php",
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
		     url: "upload.php",
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
