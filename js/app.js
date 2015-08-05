window.onload = function(){
	console.log('window loaded, bro');
	var mydata = JSON.parse(data);

	$.get('https://api.forecast.io/forecast/' + mydata.key + '/'+ geoloc.loc, function(data) {
		$('#mainPopup').append("loc " + data.minutely.summary);  
	});
};
console.log('loaded, bro');


var geoloc;

$.get("http://ipinfo.io", function(response) {
geoloc = response;
}, "jsonp").done(function(){
	$('<h1>').text(geoloc.city);
});
