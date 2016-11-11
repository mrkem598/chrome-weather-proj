window.onload = function() {

    $('#expander').click(expandHours);

};
//Acesses API Keys from local JSON - hidden from Git
var mydata = JSON.parse(data);

//Forecaster
var forecaster = function(latitude, longitude, revGeolocate) {
    $.getJSON('https://api.darksky.net/forecast/' + mydata.forecastKey + '/' + latitude + ',' + longitude + "?callback=?", function(data) {
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
        $('#loading').hide();
        if (data.minutely) {
            $('#cur-sum').text(data.minutely.summary);
            $('#current-icon').html('<img src="../../icons/weather/' + icon() + '.svg">');
            $('#current-text').html('<h1>' + revGeolocate.results[2].address_components[0].short_name + " " + Math.round(data.currently.temperature) + '&deg;</h1>');

            //Rain in next hour?
            var goingToRain = false;
            for (var i = 0; i < data.minutely.data.length; i++) {
                if (data.minutely.data[0].precipProbability > 0.1) {
                    $('#rain-status').append("Raining now");
                    chrome.browserAction.setBadgeText({text:'R:N'});
                    goingToRain = true;
                    break;
                } else if (data.minutely.data[i].precipProbability > 0.1) {
                    $('#rain-status').append("Rain in " + Math.round((data.minutely.data[i].time - data.currently.time) / 60) + " minutes.");
                    goingToRain = true;
                    chrome.browserAction.setBadgeText({text:'R:' + Math.round((data.minutely.data[i].time - data.currently.time) / 60)});
                    break;
                }
            }
            if (goingToRain === false) {
                $('#rain-status').append("No rain in next hour.");
                var currentTemperatureBadgeText = Math.round(data.currently.temperature);
                console.log(currentTemperatureBadgeText + ''+ '°');
                chrome.browserAction.setBadgeText({text:Math.round(data.currently.temperature).toString()});
            }
        } else {
            $('#cur-sum').text(data.currently.summary);
            $('#current-icon').html('<img src="../../icons/weather/' + icon() + '.svg">');
            $('#current-text').html('<h1>' + revGeolocate.results[2].address_components[0].short_name + " " + Math.round(data.currently.temperature) + '&deg;</h1>');
            var currentTemperatureBadgeText = Math.round(data.currently.temperature);
            console.log(currentTemperatureBadgeText + ''+ '°');
            chrome.browserAction.setBadgeText({text:Math.round(data.currently.temperature).toString()});
        }

        //Hourly forecast
        //shows 24 hour expander
        $('#expander').css('visibility', 'visible');

        for (var j = 1; j < 25; j++) {
            var row = $('<tr>').appendTo('#hourly');
            var date = new Date(data.hourly.data[j].time * 1000);
            var day;
            switch (date.getDay()) {
                case 0:
                    day = "Sunday";
                    break;
                case 1:
                    day = "Monday";
                    break;
                case 2:
                    day = "Tuesday";
                    break;
                case 3:
                    day = "Wednesday";
                    break;
                case 4:
                    day = "Thursday";
                    break;
                case 5:
                    day = "Friday";
                    break;
                case 6:
                    day = "Saturday";
                    break;
            }
            var milHour = date.getHours();
            var hour;
            if (milHour === 0) {
                hour = 12 + " a.m.";
            } else if (milHour === 12) {
                hour = 12 + " p.m.";
            } else if (milHour > 12) {
                hour = (date.getHours() - 12) + " p.m.";
            } else {
                hour = date.getHours() + " a.m.";
            }
            row.append('<td>' + day + " " + hour + '</td>');
            row.append('<td>' + data.hourly.data[j].summary + '</td>');
            row.append('<td>' + Math.round(data.hourly.data[j].temperature) + '&deg;</td>');
            row.append('</tr>');
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


//Expand hours from 12 hours to 24
var expandHours = function() {
    $('#mainPopup').css('height', 'auto');
    $('#main-content').css('height', 'auto');
    $('#sizer').css('height', 'auto');
    $('#sizer').css('height', 'auto');
    $('#main-content').css('overflow', 'show');
    $('#expander').css('visibility', 'hidden');
};
