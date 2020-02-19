let __config = {};

$(document).ready(function(){
	_fetchConfigs();
});

function _fetchConfigs() {
	$.ajax("js/config.json", function(result) {
		console.log(result);
	});
}