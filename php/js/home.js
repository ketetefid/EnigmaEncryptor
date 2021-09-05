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
