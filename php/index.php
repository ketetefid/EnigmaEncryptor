<!DOCTYPE html>
<html>
    <head>
	<meta charset="UTF-8">
	<title>Your Encryption Vault
	</title>
	<link rel="stylesheet" href="home.css">
	<script src="js/jquery-3.6.0.min.js"></script>
	<script src="js/cubfuncs.js" ></script>
	<style>
	 @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap');
	</style> 
    </head>
    <body>
	<div id="base">
	    <div class="topnav">
		<div class="logo"><img src="img/cubbit-logo.png" alt="Cubbit log">
		</div>
		<div id="iswitch">
 		    <label class="switch" title="Encryption Mode">
			<input type="checkbox" id="enctype">
			<span class="slider">
			    <span id="encryptedchecked">Encrypt</span>
			    <span id="decryptedchecked">Decrypt</span>
			</span>
		    </label>
		</div>
	    </div> 

	    <div id="maintext">Cubbit Vault</div>
	    <div id="mainbody">
		<div id="bodytext">Advanced online file encryption and decryption. Secure any file type and maintain your privacy!</div>
		<div id="dropzoneback">
		    <div id="dropzone">
			<input type="file" id="myFileD" name="myFileD"/>
			<div id="droptextreplaced" hidden><img src="img/exfilebig.png"></div>
			<div id="droptextreplaced2" hidden></div>
			<div id="dropzoneinputholder">
			    <div id="dropzoneinput">
				<div id="fileholder"><img src="img/exfile.png" alt="Example File"></div>
				<div id="filetextholder">Choose a file!</div>
				<div id="divider"></div>
				<div id="thearrow"><img src="img/thearrow.png" alt="Select Arrow"></div>
			    </div>
			</div>

			<div id="drophelptext">Or drop it here</div>
		    </div>

		</div>

		<div id="buttonpart">
		    <input type="button" class="encbuttons" value="Encrypt and Upload" id="encB">
		    <span id="buttonspan" style="margin-left:24px;"></span>
		    <input type="button" class="encbuttons" value="Download and Decrypt" id="decB">
		</div>

	    </div>	
	</div>

	<div class="notepartholder">
	    <div class="notepart">The whole is never the sum of the parts - it is greater or lesser, depending on how well the individuals work together.</div>
	</div>

	<script src="js/home.js">
	</script>
    </body>
</html>
