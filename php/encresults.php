<!DOCTYPE html>
<html>
    <head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="home.css">
    </head>
    <body>
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

	    <div id="encfilereview">
		<div id="reviewfilepic"><img src="img/exfilebig-white.png"></div>
		<div id="reviewfilename" ></div>
	    </div>
	    <div class="uuidres">
		<div class="uuidresp1">Your File ID:</div>
		<div class="uuidresp2">
		    <div class="uuid-text" id="encuuid"></div>
		    <input type="button" class="copybuttons" value="Copy" id="copy-uuid-text">
		</div>
	    </div>
	    <div style="margin:140px auto auto auto;"></div>
	    <div class="uuidres">
		<div class="uuidresp1">Your Encryption Key:</div>
		<div class="uuidresp2">
		    <div class="uuid-text" id="enckey"></div>
		    <input type="button" class="copybuttons" value="Copy" id="copy-key-text">
		</div>
	    </div>
	</div>
	
	<script src="js/encresults.js">
	</script>
    </body>
</html>
