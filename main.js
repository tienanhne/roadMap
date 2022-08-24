var map;
var lati = 0;
var longi = 0;
var infowindow;
var arrMarkers = [];

function timdiadiem(loai) {
    if (!loai || loai == '') return;
    var req = {
        location: {
            lat: lati,
            lng: longi,
        }, // trung tâm vùng tìm kiếm
        radius: '3000', //bán kính vùng tìm kiếm
        type: loai
    }
    var service = new google.maps.places.PlacesService(map) // dịch vụ tìm kiếm địa điểm
    service.nearbySearch(req, function (result, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK && result && result.length > 0) {
            for (var i in arrMarkers) // set lại map khi đã thay đổi vị trí tìm kiếm
                arrMarkers[i].setMap(null);
            arrMarkers = [];
            for (var i in result) {
                var place = result[i];
                console.log(place)
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                }
                var marker = new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    content: "<strong>" + place.name + "</strong>" + "<br/>" + place.vicinity + "<br/>",
                    position: place.geometry.location,
                    data: place
                });
                marker.addListener('click', function () {
                    infowindow.setContent(this.content);
                    infowindow.open(map, this)
                    timduong(this.data)
                    change(place.geometry.location)
                });
                arrMarkers.push(marker)
            }
        }
    });
}
var display;
function timduong(place) {
    var service = new google.maps.DirectionsService();
    if (display)display.setMap(null)
    display = new google.maps.DirectionsRenderer();
    display.setMap(map);
    var req = {
        origin: { lat: lati, lng: longi }, // vị trí bắt đầu
        destination: place.geometry.location, //  vị trí kết thúc
        travelMode: "DRIVING", // phương tiện di chuyển
        provideRouteAlternatives: true, // chỉ đường ngắn và phù hợp nhất
    }
    service.route(req, function (result, status) {
        if (status == "OK") {
            display.setDirections(result)
            document.getElementById('distances').innerHTML = result.routes[0].legs[0].distance.text
            document.getElementById('time').innerHTML = result.routes[0].legs[0].duration.text
            directionsDisplay.setMap(null);
        }
    })
}

var directionsDisplay;
function calcRoute() {
    let directionsService = new google.maps.DirectionsService();
    if(directionsDisplay) directionsDisplay.setMap(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    }

    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            document.getElementById('distances').innerHTML = result.routes[0].legs[0].distance.text
            document.getElementById('time').innerHTML = result.routes[0].legs[0].duration.text
            display.setMap(null)

        } else {
            directionsDisplay.setDirections({ routes: [] });
            map.setCenter({ lat: lati, lng: longi });
        }
    });

}





function initMap() {
    infowindow = new google.maps.InfoWindow();
    window.navigator.geolocation.getCurrentPosition(function (pop) { //lấy ra điểm trung tâm
        lati = parseFloat(pop.coords.latitude); // 7,8 lấy ra kinh độ , vĩ độ;
        longi = parseFloat(pop.coords.longitude);
        // document.querySelector('#currentPosition').innerHTML = (lati + ',' + longi)
        map = new google.maps.Map(document.getElementById("map"), { // mục đích để showmap
            center: { lat: lati, lng: longi }, // lấy được vị trí trung tâm
            zoom: 15,
        });
        var diemtrungtam = new google.maps.Marker({ // tạ0 ra điểm chấm mốc
            position: {
                lat: lati,
                lng: longi,
            },
            map: map,
            title: "Vị trí của bạn",
            mapTypeId: "roadmap",
        })
        change(lati, longi)
        // var autocomplete = new google.maps.places.Autocomplete(document.getElementById('auto_search'))
        // autocomplete.addListener('place_changed',function(){
        //     placess = autocomplete.getPlace();
        //     map.fitBounds(placess.geometry.viewport)
        //     diemtrungtam.setPosition(placess.geometry.location)

        // })
        var options = {
            types: ['(cities)']
        }
        var input1 = document.getElementById("from");
        var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
        
        var input2 = document.getElementById("to");
        var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

    })
}
window.initMap = initMap;


async function change(latis, longis) {
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latis}&lon=${longis}&appid=677bb5e89a8c0e450ebca93fc6296070`
    let data = await fetch(apiURL).then(response => response.json())
    console.log(data);
    var iconurl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    document.querySelector('#wicon').src = iconurl
    document.querySelector('.city').innerHTML = data.name
    document.querySelector('.status').innerHTML = data.weather[0].description;
}








