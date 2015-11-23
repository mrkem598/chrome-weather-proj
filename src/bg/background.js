// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });
console.log('background script loaded');
//Acesses API Keys from local JSON - hidden from Git
var mydata = JSON.parse(data);

//Forecaster
var forecaster = function(latitude, longitude, revGeolocate) {
    $.getJSON('https://api.forecast.io/forecast/' + mydata.forecastKey + '/' + latitude + ',' + longitude + "?callback=?", function(data) {
        //Current data + neighborhood
        var icon = function() {
            //Icon selector
            if (data.currently.icon == "clear-day" || data.currently.icon == "clear-night" || data.currently.icon == "cloudy" || data.currently.icon == "wind" || data.currently.icon == "partly-cloudy-day" || data.currently.icon == "partly-cloudy-night") {
                return data.currently.icon;
            } else {
                if (data.currently.time > data.daily.data[0].sunsetTime && data.currently.time < data.daily.data[1].sunriseTime) {
                    console.log('nighttime');
                    return data.currently.icon + '-' + 'night';
                } else {
                    console.log('daytime');
                    return data.currently.icon + '-' + 'day';
                }

            }
        };
        chrome.browserAction.setIcon({path:'../../icons/weather/' + icon() + '.svg' });


        //Rain in next hour?
        var goingToRain = false;
        for (var i = 0; i < data.minutely.data.length; i++) {
            if (data.minutely.data[0].precipProbability > 0.1) {
                goingToRain = true;
                break;
            } else if (data.minutely.data[i].precipProbability > 0.1) {
                goingToRain = true;
                break;
            }
        }
        if (goingToRain === false) {
        		chrome.browserAction.setBadgeText({text:Math.round(data.currently.temperature).toString() + '°'});
        } else if (goingToRain){
        	chrome.browserAction.setBadgeText({text:'R:' + ((data.minutely.data[i].time - data.currently.time) / 60)});
        	chrome.notifications.create("It's Going to Rain!", {
			        type: 'basic',
			        iconUrl: '../../icons/weather/rain.svg',
			        title: 'Its about to start Raining!',
			        message: 'It will start raining in: '+(data.minutely.data[i].time - data.currently.time) / 60 +' minutes!'
			     }, function(notificationId) {});
			        }
    });
    console.log('forecast just happened');
};

//Geolocator
var loc = function(position) {
    console.log(position);
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + mydata.googleGeoKey, function(revGeolocate) {
        forecaster(latitude, longitude, revGeolocate);
    });
};

var locErr = function(err) {
    console.log('Error with geolocation: ' + err);
};

var locOptions = {
    enableHighAccuracy: false,
    maximumAge: (1000 * 60)
};

navigator.geolocation.getCurrentPosition(loc);

//Clearing previous alarms - most likely unnecessary
chrome.alarms.clearAll(function(x){
	console.log('was cleared: ' + x);
});


//alarm and listener
chrome.alarms.create({ periodInMinutes: 10});
chrome.alarms.onAlarm.addListener(function( alarm ) {
  navigator.geolocation.getCurrentPosition(loc);
});
