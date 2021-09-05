	 $(function () {

	     var finalfile;
	     var my_key;
	     var dec_F=$.Deferred();

	     function setFile2(file,key) {
		 //console.log(file);
		 finalfile=file;
		 my_key=key;
		 dec_F.resolve(true);
		 
	     }

	     function hex2buf (hexString) {
		 return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
	     }
	     
	     function buf2hex(buffer) { 
		 return [...new Uint8Array(buffer)]
		     .map(x => x.toString(16).padStart(2, '0'))
		     .join('');
	     }
	     
	     var dlpath;
	     var fname;
	     $("#getfile").click(function(e) {

		 //e.preventDefault();

		 var uuid = $("#uuid-ins-text").val();

		 var form_data = new FormData();
		 form_data.append("myuuid",uuid);

		 $.ajax({
		     url: "upload.php",
		     type: "POST",
		     data:  form_data,
		     contentType: false,
		     cache: false,
		     processData: false,
		     dataType : 'JSON',
		     success: function(fileinfo){
			 dlpath = fileinfo[0];
			 fname = fileinfo[3];
			 $("#uuid-decresults").html(uuid);
			 $("#name-decresults").html(fileinfo[3]);
			 $("#size-decresults").html(fileinfo[1]);
			 $("#type-decresults").html(fileinfo[2]);			 
			 $("#mainbody").remove();
			 $("#decfileresults").show();

		     },
		     error: function (err) {
			 $("#enteruuidinfo").html("No file with this ID was found.");
			 $("#enteruuidinfo").fadeOut(2000, function() {
			     $(this).html("Enter a correct ID:").fadeIn(100);
			 });
		     }
		     
		 });
	     });
	     
	     $("#dlfile").click(function(e) {
		 //e.preventDefault();
		 var key = $('#key-ins-text').val();

		 var xhr = new XMLHttpRequest();
		 xhr.open('GET', dlpath, true);
		 xhr.responseType = 'arraybuffer';
		 xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
		 
		 xhr.onload = function(e) {
		     
		     var uInt8Array = new Uint8Array(this.response); 
		     encFile(false,hex2buf(key),uInt8Array,setFile2);
		     $.when(dec_F).done(function(){
			 delete uInt8Array;
			 let blob=new Blob([finalfile] );
			 let link=document.createElement('a');
			 link.href=window.URL.createObjectURL(blob);
			 link.download=fname;
			 link.click();
		     });
		 };
		 xhr.send();
	     });
	 });
/*
	 $(function () {
	     $("#enctype").on('change', function() {
		 var isChecked = $(this).is(':checked');
		 if(isChecked) {

		     setTimeout(function(){ 
			 $("#base").load("decresults.php");
		     },500);

		 } else {

		     setTimeout(function(){
			 $("body").load("index.php");
		     },500);

		 }
	     });
	 });
*/
////////////////////decresults


	 $(function () {

	     $("#copy-uuid-text").click(function(e) {
		 navigator.clipboard.writeText($("#encuuid").text());
		 $("#copy-uuid-text").val("Copied!");
		 $("#copy-uuid-text").fadeOut(1500, function() {
		     $(this).val("Copy").fadeIn(100);
		 });
	     });

	     $("#copy-key-text").click(function(e) {
		 navigator.clipboard.writeText($("#enckey").text());
		 $("#copy-key-text").val("Copied!");
		 $("#copy-key-text").fadeOut(1500, function() {
		     $(this).val("Copy").fadeIn(100);
		 });
		 
	     });

	 });
/*
	 $(function () {
	     $("#enctype").on('change', function() {
		 var isChecked = $(this).is(':checked');
		 if(isChecked) {

		     setTimeout(function(){ 
			 $("#base").load("decresults.php");
		     },500);

		 } else {

		     setTimeout(function(){
			 window.location.reload();
			 //$("#base").load("enchome.php");
		     },500);

		 }
	     });
	 });
*/
//////////////////////////encresults
	 // functions for the UI
	 $(function () {


	     function buf2hex(buffer) { 
		 return [...new Uint8Array(buffer)]
		     .map(x => x.toString(16).padStart(2, '0'))
		     .join('');
	     }

	     var file_data;
	     var file_name;
	     var file_size;
	     var file_type;

	     function hex2buf (hexString) {
		 return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
	     }
	     
	     // Bytes conversion
	     function convertSize(size) {
		 var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		 if (size == 0) return '0 Byte';
		 var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
		 return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
	     }
	     

	     var encF=$.Deferred();
	     var final_file;
	     var mykey;

	     function setFile(file,key) {

		 final_file=file;
		 mykey=key;
		 encF.resolve(true);

	     }
	     
	     /* UI functions */
	     // Drag enter
	     $('#dropzone').on('dragenter', function (e) {
		 e.stopPropagation();
		 e.preventDefault();
		 $("#drophelptext").text("Drop it!");
	     });
	     // Drag over
	     $('#dropzone').on('dragover', function (e) {
		 e.stopPropagation();
		 e.preventDefault();
		 $("#drophelptext").text("Drop it!");
	     });
	     // Drag leave
	     $('#dropzone').on('dragleave', function (e) {
		 e.stopPropagation();
		 e.preventDefault();
		 $("#drophelptext").text("Bring it here!");
	     });

	     // Drop
	     $('#dropzone').on('drop', function (e) {
		 e.stopPropagation();
		 e.preventDefault();
		 $("#encB").prop('disabled',false);
		 //$("#drophelptext").text("Now encrypt and upload it!");
		 $("#drophelptext").remove();
		 $("#decB").remove();
		 $("#buttonspan").remove();
		 file_data = e.originalEvent.dataTransfer.files[0];
		 file_name = e.originalEvent.dataTransfer.files[0].name;
		 file_size = e.originalEvent.dataTransfer.files[0].size;
		 file_type = e.originalEvent.dataTransfer.files[0].type;
		 $("#droptextreplaced").show();
		 $("#droptextreplaced2").html(file_name).show();
		 $("#dropzoneinput").remove();
	     });
	     // Done select files

	     // Click browse
	     $('#dropzoneinput').click(function(){
		 $('#myFileD').trigger('click'); 
	     });

	     // file selected
	     $("#myFileD").change(function(){
		 file_data = $('#myFileD')[0].files[0];
		 file_name = $('#myFileD')[0].files[0].name;
		 file_size = $('#myFileD')[0].files[0].size;
		 file_type = $('#myFileD')[0].files[0].type;

		 //$("#drophelptext").text("Now encrypt and upload it!");
		 $("#encB").prop('disabled',false);
		 $("#drophelptext").remove();
		 $("#decB").remove();
		 $("#buttonspan").remove();
		 $("#droptextreplaced").show();
		 $("#droptextreplaced2").html(file_name).show();
		 $("#dropzoneinput").remove();

	     });

	     $('#encB').click(function(){
		 var form_data = new FormData();
		 var dummykey;
		 encFile (true,dummykey,file_data,setFile);

		 $.when(encF)
		  .done(function(){

		      var blob=new Blob([final_file]);

		      form_data.append('encfile', blob);
		      form_data.append('realname', file_name);
		      form_data.append('filesize', convertSize(file_size));
		      form_data.append('filetype', file_type);
		      
		  }).done(function(){
		      delete blob;
		      delete final_file;
		      delete mykey;
		      $.ajax({
			  url: "upload.php",
			  type: "POST",
			  data:  form_data,
			  contentType: false,
			  cache: false,
			  processData: false,
			  success: function(encdata){
			      $("#base").load("encresults.php", function() {
				  $("#reviewfilename").html(file_name);
				  $("#encuuid").html(encdata).show();
				  $("#enckey").html(buf2hex(mykey)).show();
			      });
			  }           
		      });
		  });
	     });

	 });
	 
	 $(function () {
	     $("#enctype").on('change', function() {
		 var isChecked = $(this).is(':checked');
		 if(isChecked) {

		     setTimeout(function(){ 
			 $("body").load("decresults.php");
		     },500);

		 } else {

		     setTimeout(function(){
			 window.location.reload();
			 //$("#base").load("enchome.php");
		     },500);

		 }
	     });
	     // default mode
	     $("#enctype").prop("checked",false);
	 });

	 // make the buttons disabled by default
	 $(function () {
	     $("#encB").prop('disabled',true);
	     $("#decB").prop('disabled',true);
	 });
///////////////////////////////index
