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
