$(document).ready(function(){
	$('img').click(function(){
		if ($(this).hasClass('little')){
			$(this).addClass('middle').removeClass('little');
		}
		else{
			$(this).addClass('little').removeClass('middle');
		}
	});
});

