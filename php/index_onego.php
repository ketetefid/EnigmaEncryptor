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
