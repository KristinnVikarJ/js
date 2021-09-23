let map: google.maps.Map;

const color1 = "#00FF00";
const color2 = "#FF0000";

const colorGradient = new Gradient();
colorGradient.setGradient(color1, color2);
colorGradient.setMidpoint(1440);

function initMap(){  
    map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center: { lat: 64.85, lng: -18.75 },
        zoom: 7,
    });
}

function RefreshEarthquake() {
    GetEarthquakeData().then(EarthquakeData => {
        for (const earthquake of EarthquakeData.results) {
            const diff = Math.floor((Date.now()/1000) - (new Date(earthquake.timestamp).valueOf()/1000));
            const minutes = Math.min(Math.floor(diff/60), 1440); // 1440 = 24 * 60

            new google.maps.Circle({
                strokeColor: colorGradient.getColor(minutes),
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: colorGradient.getColor(minutes),
                fillOpacity: 0.35,
                map,
                center: {lng: earthquake.longitude, lat: earthquake.latitude},
                radius: earthquake.size * 200,
            });
        }
    });
}

RefreshEarthquake();