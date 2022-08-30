window.onload = function () {

}
var map;
var lati = 0;
var longi = 0;
var infowindow;
var arrMarkers = [];
var arrMarker = [];

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
                });
                arrMarkers.push(marker);
            }
        }
    });
}
var display;
function timduong(place) {
    var service = new google.maps.DirectionsService();
    if (display) display.setMap(null)
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
            placeDisplay.setMap(null);
            directionsDisplay.setMap(null);
        }
    })
}

var directionsDisplay;
function calcRoute() {
    let directionsService = new google.maps.DirectionsService();
    if (directionsDisplay) directionsDisplay.setMap(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.DRIVING,
    }
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            console.log("🚀 ~ file: main.js ~ line 90 ~ result", result)
            document.getElementById('distances').innerHTML = result.routes[0].legs[0].distance.text
            document.getElementById('time').innerHTML = result.routes[0].legs[0].duration.text
            placeDisplay.setMap(null);
            display.setMap(null);
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
            icon: "02.png",
            title: "Vị trí của bạn",
            mapTypeId: "roadmap",
        })
        searchStores();
        change(lati, longi)

        var options = {
            componentRestrictions: { 'country': ['vn'] },
            fields: ['geometry', 'name'],
            types: ['establishment']
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
    var iconurl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    document.querySelector('#wicon').src = iconurl
    document.querySelector('.city').innerHTML = data.name
    document.querySelector('.status').innerHTML = data.weather[0].description;
}





function searchStores() {
    var foundStores = [];
    var zipCode = document.getElementById('zip-code-input').value;
    if (zipCode) {
        for (var store of stores) {
            var postal = store.results[0].address_components[1].long_name;
            console.log("🚀 ~ file: main.js ~ line 166 ~ searchStores ~ postal", postal)
            if (postal == zipCode) {
                foundStores.push(store);
            }
        }
    } else {
        foundStores = stores;
    }
    clearLocations();
    displayStores(foundStores);
    showStoresMarkers(foundStores);
    setOnClickListener();
}

function clearLocations() {
    infowindow.close();
    for (var i = 0; i < arrMarker.length; i++) {
        arrMarker[i].setMap(null);
    }
    arrMarker.length = 0;
}
function displayStores() {
    var storesHtml = '';
    for (var [index, store] of stores.entries()) {
        var address = store.results[0].address_components[0].long_name;
        var phone = store.results[0].address_components[1].short_name;
        storesHtml += `
              <div class="store-container">
                <div class="store-container-background">
                  <div class="store-info-container">
                    <div class="store-address">
                      <span>${address}</span>
                    </div>
                    <div class="store-phone-number">${phone}</div>
                  </div>
                  <div class="store-number-container">
                    <div class="store-number">
                      ${index + 1}
                    </div>
                  </div>
                </div>
              </div>
      `
        document.querySelector('.stores-list').innerHTML = storesHtml;
    }
}
function setOnClickListener() {
    var storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach(function(element, index){
      element.addEventListener('click', function(){
        new google.maps.event.trigger(arrMarker[index], "click");
      })
    })
}
function createMarker(latlng, name, address,index) {
    var html = `
        <div class="store-info-window">
          <div class="store-info-name">
            ${name}
          </div>
          <div class="store-info-address">
            <div class="circle">
            <i class='bx bx-map-pin'></i>
            </div>
            ${address}
          </div>
        </div>
    `
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: index.toString(),
    });
    marker.addListener('click', function () {
        infowindow.setContent(html);
        infowindow.open(map, marker);
        run_place(latlng)
    });
    arrMarker.push(marker);
}
function showStoresMarkers(stores) {
    var bounds = new google.maps.LatLngBounds();
    for (var [index, store] of stores.entries()) {
        var latlng = new google.maps.LatLng(
            store.results[0].geometry.location.lat,
            store.results[0].geometry.location.lng);
        var name = store.results[0].address_components[0].long_name;
        var address = store.results[0].formatted_address;
        bounds.extend(latlng);
        createMarker(latlng, name, address, index + 1)
    }
    map.fitBounds(bounds);
}
console.log(stores)

var placeDisplay;
function run_place(latlng){
    var placeService = new google.maps.DirectionsService();
    if(placeDisplay) placeDisplay.setMap(null);
    placeDisplay = new google.maps.DirectionsRenderer();
    placeDisplay.setMap(map);
    var req = {
        origin: { lat: lati, lng: longi },
        destination: latlng,
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
    }
    placeService.route(req, function(result, status){
        if(status == "OK"){
            placeDisplay.setDirections(result);
            display.setMap(null);
            directionsDisplay.setMap(null);
        }
    })
}
