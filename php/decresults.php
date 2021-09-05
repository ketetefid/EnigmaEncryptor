<!DOCTYPE html>
<html>
    <head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="home.css">
	<style>
	 @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap');
	</style> 
    </head>
    <body>
	<div class="topnav">
	    <div class="logo"><img src="img/cubbit-logo.png" alt="Cubbit log">
	    </div>
	    <div id="iswitch">
 		<label class="switch" title="Encryption Mode">
		    <input type="checkbox" id="enctype" checked>
		    <span class="slider">
			<span id="encryptedchecked">Encrypt</span>
			<span id="decryptedchecked">Decrypt</span>
		    </span>
		</label>
	    </div>
	</div> 

	<div id="maintext">Cubbit Vault</div>
	<div id="mainbody">

	    <div id="decfilereview">
		<div id="enteruuidinfo" class="uuidresp1">Enter your file ID:</div>		
		<div id="uuidinsholder">
		    <input type="text" class="uuidins" id="uuid-ins-text">
		</div>
		<div id="getfileholder">
		    <input type="button" value="Get the file" id="getfile">
		</div>
	    </div>    

	</div>
	<div id="decfileresults" style="display: none;">
	    <div class="decresitems" id="decres-fileid">File ID:</div>
	    <div class="decresultbox" id="uuid-decresults"></div>
	    <div class="decresitems decres-vspace1" id="decres-filename">File name:</div>
	    <div class="decresultbox decres-vspace1" id="name-decresults"></div>
	    <div class="decresitems decres-vspace2"  id="decres-filesize">File size:</div>
	    <div class="decresultbox decres-vspace2" id="size-decresults"></div>
	    <div class="decresitems decres-vspace3"  id="decres-filetype">File type:</div>
	    <div class="decresultbox decres-vspace3" id="type-decresults"></div>

	    <div id="decgetkey">Insert your encryption key:</div>
	    <div id="isnskeyholder"><input type="text" id="key-ins-text"></div>
	    <div id="dlfileholder"><input type="button" value="Decrypt and download" id="dlfile"></div>
	</div>

	<div class="notepartholder">
	    <div class="notepart">The whole is never the sum of the parts - it is greater or lesser, depending on how well the individuals work together.</div>
	</div>

	<script src="js/decresults.js">
	</script>
    </body>
</html>
