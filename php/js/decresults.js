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
    
    $("#dlfile").click(function() {
	//e.preventDefault();
	var key = $('#key-ins-text').val();

	var xhr = new XMLHttpRequest();
	xhr.open('GET', dlpath, true);
	xhr.responseType = 'arraybuffer';
	xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
	
	xhr.onload = function() {
	    
	    var uInt8Array = new Uint8Array(xhr.response); 
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
