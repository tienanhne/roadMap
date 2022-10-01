var map;
var lati = 0;
var longi = 0;
var infowindow;
var arrMarkers = [];
var arrMarker = [];
var placeDisplay;
var display;
var directionsDisplay;
var theme;
var temp;
var kilometer;
var timerun;

var buttonLoca = document.getElementById('show-location')
buttonLoca.addEventListener('click', swapper, false);
function swapper() {
    document.querySelector('.direction').style.display = "block";
    document.querySelector('.directions').style.display = "none";
};
var buttonLocas = document.getElementById('hide-location')
buttonLocas.addEventListener('click', swappers, false);
function swappers() {
    document.querySelector('.direction').style.display = "none";
    document.querySelector('.directions').style.display = "block";
};
var searchs = document.querySelector('.search-box');
var closebox = document.querySelector('.close-box');
var inputs = document.querySelector('.search');

searchs.onclick = function () {
    inputs.classList.add('active')
}
closebox.onclick = function () {
    inputs.classList.remove('active')
    document.querySelector('.stores-list-container').style.opacity = 0;
}
var showmenu = document.querySelector('.showmenu');
var menushow = document.querySelector('.menushow');
var hidemenu = document.querySelector('.hidemenu');
showmenu.addEventListener("click", function(){
    menushow.style.display = "block";
    showmenu.style.display = "none";
    hidemenu.style.display = "block";
})
hidemenu.addEventListener("click", function(){
    menushow.style.display = "none";
    showmenu.style.display = "block";
    hidemenu.style.display = "none"
})
function timdiadiem(loai) {
    if (!loai || loai == '') return;
    var req = {
        location: {
            lat: lati,
            lng: longi,
        }, // trung tâm vùng tìm kiếm
        radius: '3000', //bán kính vùng tìm kiếm
        type: loai,
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
        if (status == google.maps.DirectionsStatus.OK) {
            display.setDirections(result);
            directionsDisplay.setMap(null);
            placeDisplay.setMap(null);
        }
    })
}
function calcRoute() {
    const travelModes = document.getElementById("mode").value;
    let directionsService = new google.maps.DirectionsService();
    if (directionsDisplay) directionsDisplay.setMap(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    var request = {
        origin: { lat: lati, lng: longi },
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode[travelModes],
    }
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            placeDisplay.setMap(null);
            display.setMap(null);

        } else {
            directionsDisplay.setDirections({ routes: [] });
            map.setCenter({ lat: lati, lng: longi });
        }
    });
}
function calcRoutes() {
    const travelModes = document.getElementById("modes").value;
    let directionsService = new google.maps.DirectionsService();
    if (directionsDisplay) directionsDisplay.setMap(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    var request = {
        origin: document.getElementById("tu").value,
        destination: document.getElementById("den").value,
        travelMode: google.maps.TravelMode[travelModes],
    }
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            console.log(result)
            directionsDisplay.setDirections(result);
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
        map = new google.maps.Map(document.getElementById("map"), { // mục đích để showmap
            center: { lat: lati, lng: longi }, // lấy được vị trí trung tâm
            zoom: 16,
        });
        var diemtrungtam = new google.maps.Marker({ // tạ0 ra điểm chấm mốc
            position: {
                lat: lati,
                lng: longi,
            },
            map: map,
            animation: google.maps.Animation.DROP,
            title: "Vị trí của bạn",
            mapTypeId: "roadmap",
        })
        map.addListener("click", function (event) {
            document.querySelector('.tabs-content').style.transform = "translateX(-100%)"
        });
        change(lati, longi)
        var options = {
            componentRestrictions: { 'country': ['vn'] },
            fields: ['geometry', 'name'],
            types: ['establishment']
        }
        var input2 = document.getElementById("to");
        var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
        var input3 = document.getElementById("tu");
        var autocomplete2 = new google.maps.places.Autocomplete(input3, options);
        var input4 = document.getElementById("den");
        var autocomplete2 = new google.maps.places.Autocomplete(input4, options);

    })
}
window.initMap = initMap;
async function change(latis, longis) {
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latis}&lon=${longis}&appid=677bb5e89a8c0e450ebca93fc6296070`
    let data = await fetch(apiURL).then(response => response.json())
    var iconurl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    document.querySelector('#wicon').src = iconurl
    if (data.name == "Tinh GJong Nai") {
        data.name = "Tỉnh Đồng Nai"
    };
    theme = data.weather[0].description;
    temp = String(Math.round(data.main.temp - 273.15));
    document.querySelector('.city').innerHTML = data.name
    document.querySelector('.status').innerHTML = theme;
    
}
var imagess = "data:image/jpeg;base64,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";
async function loacation() {
    console.log("day la nhiet do" + temp)
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    var raw = `{\r\n    \"image\": \"${imagess}\",  		\r\n    \"color\": \"GREEN\",  		\r\n    \"weather\": \"${theme}\",	\r\n    \"temperature\":\"${temp}\",		\r\n    \"day_or_night\": \"NIGHT\", 	\r\n    \"day_of_birth\": \"23/2\"  	\r\n}`;
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    var data = await fetch("http://14.225.210.47:4999/predict", requestOptions).then(response => response.json()).catch(error => console.log('error', error));
    var foundStores = [];
    var zipCode = document.getElementById('zip-code-input').value.toLowerCase();
    if (zipCode) {
        let searchdata = data.filter(value => {
            if (value.Name.toLowerCase().includes(zipCode)) {
                foundStores.push(value);
            }
        })
    } else {
        foundStores = data;
    }
    document.querySelector('.stores-list-container').style.opacity = 1;
    clearLocations();
    displayStores(foundStores);
    showStoresMarkers(foundStores);
    setOnClickListener();
}
var listdiadiem = document.querySelector('.select-place');
var modeldiadiem = document.querySelector('.model-play');
var closes = document.querySelector('.close-boxs');
closes.addEventListener('click', hideModal)
listdiadiem.addEventListener('click', function () {
    modeldiadiem.style.display = "block"
})
let modalshow = document.querySelector(".model-select")
function hideModal() {
    modeldiadiem.style.display = "none";
}
modeldiadiem.addEventListener('click', hideModal)

modalshow.addEventListener('click', function (event) {
    event.stopPropagation()
})

function clearLocations() {
    infowindow.close();
    for (var i = 0; i < arrMarker.length; i++) {
        arrMarker[i].setMap(null);
    }

    arrMarker.length = 0;
}
var danhsach = new Array();
function selectPlace(id, name, local) {
    let split_kilo = kilometer.replace(/[^0-9 && '.']/g, '');
    let split_time = timerun.replace(/[^0-9]/g, '');
    var ds = new Array(id,name,local,split_kilo,split_time);
    for(let i = 0; i < danhsach.length; i++){
        if(danhsach[i][1] == name){
            return;
        }
    }
    danhsach.push(ds);
    console.log(danhsach);
    showPlace();
    sessionStorage.setItem("danhsach",JSON.stringify(danhsach));
}
function totalTime(){
    var danhsach = document.getElementById('mylist');
    var tr = danhsach.children;
    var tong = 0;
    var tongtime = 0;
    var hours;
    var minutes;
    for(let i = 0; i < tr.length; i++){
        var td = tr[i].getElementsByTagName("td");
        var km = td[3].innerText;
        var time = td[4].innerText;
        tong = tong + Number(km);
        tongtime = tongtime + Number(time);
        hours = Math.floor(tongtime / 60);          
        minutes = tongtime % 60;
    }
    document.getElementById("kilometer").innerHTML = Math.round(tong);
    document.getElementById("timerun").innerHTML = hours;
    document.getElementById("timephut").innerHTML = minutes;
}
function showPlace(){
    var addcontents = "";
    for(let i = 0; i < danhsach.length; i++){
        
        addcontents +=  `<tr> 
        <td><span class="id">${danhsach[i][0]}</span></td>
        <td style="display: flex; align-items: center;"><span class="title">${danhsach[i][1]}</span></td>
        <td><span class="local">${danhsach[i][2]}</span></td>
        <td><span class="kilometer">${danhsach[i][3]}</span></td>
        <td><span class="timerun">${danhsach[i][4]}</span></td>
        <td style="cursor: pointer;"><button class="deleteds" onclick="xoalist(this)">Xóa</button></td>
        </tr>  
        `
    }
    document.getElementById("mylist").innerHTML = addcontents;
    totalTime();
    
}
function xoalist(x) {
    var tr = x.parentElement.parentElement;
    var tensp = tr.children[1].innerText;
   
    tr.remove();
    for(let i =0; danhsach.length;i++){
        console.log(danhsach[i][1])
        if(danhsach[i][1] == tensp){
            danhsach.splice(i,1);
        }
        totalTime();
    }
    console.log(danhsach);
}
function showPlacePart2(){
    var session = sessionStorage.getItem("danhsach");
    var danhsach = JSON.parse(session);
    var addcontents = "";
    for(let i = 0; i < danhsach.length; i++){
        
        addcontents +=  `<tr> 
        <td><span class="id">${danhsach[i][0]}</span></td>
        <td style="display: flex; align-items: center;"><span class="title">${danhsach[i][1]}</span></td>
        <td><span class="local">${danhsach[i][2]}</span></td>
        <td style="cursor: pointer;"><button class="deleteds" onclick="xoalist(this)">Xóa</button></td>
        </tr>  
        `
    }
    document.getElementById("mylist").innerHTML = addcontents;
}
showPlacePart2()
function displayStores(data) {
    var storesHtml = '';
    for (var [index, store] of data.entries()) {
        var address = store.Name;
        var phone = store.ADDRESS;
        storesHtml +=
            `
            <div class="store-container">
                <div class="store-container-background">
                  <div class="store-info-container">
                    <div class="store-address"><span>${address}</span></div>
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
    storeElements.forEach(function (element, index) {
        element.addEventListener('click', function () {
            new google.maps.event.trigger(arrMarker[index], "click");
        })
    })
}

function createMarker(store, latlng, name, address, index, image, pluscode) {
    var html2 = `
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
    var tabsMenu = `
        <div class="tabs-image">
            <img src="${image}" alt="">
        </div>
        <div class="tabs-address">
            <span>${name}</span>
            <br>
            <span>#${store.ID}</span>
        </div>
        <div class="tabs-app">
                <div class="tab-app-item">
                    <div class="tab-app-com">
                        <a href = "${pluscode}" class="button-app">
                            <span class="bx bx-save icon-app"></span>
                            <div class="name-app">Mở rộng</div>
                        </a>
                    </div>
                </div>
                <div class="tab-app-item">
                    <div class="tab-app-com">
                        <a a href="tel:0583507915" class="button-app">
                            <span class="bx bxs-phone icon-app"></span>
                            <div class="name-app">Điện thoại</div>
                        </a>
                    </div>
                </div>
                <div class="tab-app-item">
                    <div class="tab-app-com">
                        <a class="button-app">
                            <span class="bx bx-share-alt icon-app"></span>
                            <div class="name-app">Chia sẻ</div>
                        </a>
                    </div>
                </div>
                <div class="tab-app-item">
                    <div class="tab-app-com">
                        <a class="button-app" onclick="selectPlace(${index},\`${address}\`,\`${name}\`)">
                            <span class="bx bx-message-rounded-add icon-app"></span>
                            <div class="name-app">Chọn</div>
                        </a>
                    </div>
                </div>
            </div>
            <div class="line"></div>
            <div class="show-address">
                <div class="address-item-list">
                    <div class="address-item">
                        <i class='bx bx-map'></i>
                        <span class="address-name">${address}</span>
                    </div>
                    <div class="address-item">
                        <i class='bx bx-run'></i>
                        <span class="kilomet"> </span>
                        <span class="time-five"> </span>
                    </div>
                    <div class="address-item">
                        <i class='bx bx-map-pin' ></i>
                        <span class="address-name">${pluscode}</span>
                    </div>
                    <div class="address-item">
                    <i class='bx bx-phone'></i>
                        <span class="address-name">+84583507915</span>
                    </div>
                </div>
            </div
    `
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: index.toString(),
        icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    });
    marker.addListener('mouseover', function () {
        infowindow.setContent(html2);
        infowindow.open(map, marker);
    });
    marker.addListener('mouseout', function () {
        infowindow.close();
    });
    marker.addListener('click', function () {
        run_place(latlng);
        change(store.lat, store.long);
        document.querySelector('.tabs-content').style.transform = "translateX(0)"
        document.querySelector('.tabs-content').innerHTML = tabsMenu;
    });
    arrMarker.push(marker);


}
function showStoresMarkers(stores) {
    var bounds = new google.maps.LatLngBounds();
    for (var [index, store] of stores.entries()) {
        var latlng = new google.maps.LatLng(store.lat, store.long);
        var name = store.Name;
        var address = store.ADDRESS;
        var image = store.IMG2;
        var pluscode = store.ADDRESS_LINK;
        bounds.extend(latlng);
        createMarker(store, latlng, name, address, index + 1, image, pluscode);
    }
    map.fitBounds(bounds);
}

function run_place(latlng) {
    var placeService = new google.maps.DirectionsService();
    if (placeDisplay) placeDisplay.setMap(null);
    placeDisplay = new google.maps.DirectionsRenderer();
    placeDisplay.setMap(map);
    var req = {
        origin: { lat: lati, lng: longi },
        destination: latlng,
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
    }
    placeService.route(req, function (result, status) {
        if (status == "OK") {
            placeDisplay.setDirections(result);
            kilometer = result.routes[0].legs[0].distance.text;
            timerun = result.routes[0].legs[0].duration.text
            document.querySelector('.kilomet').innerHTML = kilometer;
            document.querySelector('.time-five').innerHTML = timerun;
            directionsDisplay.setMap(null);
            display.setMap(null);
        }
    })
}








