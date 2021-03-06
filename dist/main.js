"use strict";
class Gradient {
    constructor(gradients = [], maxNum = 10, colors = ['', ''], intervals = []) {
        const setColors = (props) => {
            if (props.length < 2) {
                throw new Error(`setGradient should have more than ${props.length} color`);
            }
            else {
                let increment = maxNum / (props.length - 1);
                let firstGradient = new GradientColor();
                let lower = 0;
                let upper = 0 + increment;
                firstGradient.setGradient(props[0], props[1]);
                firstGradient.setMidpoint(lower, upper);
                gradients = [firstGradient];
                intervals = [{
                        lower,
                        upper
                    }];
                for (let i = 1; i < props.length - 1; i++) {
                    let gradientColor = new GradientColor();
                    let lower = 0 + increment * i;
                    let upper = 0 + increment * (i + 1);
                    gradientColor.setGradient(props[i], props[i + 1]);
                    gradientColor.setMidpoint(lower, upper);
                    gradients[i] = gradientColor;
                    intervals[i] = {
                        lower,
                        upper
                    };
                }
                colors = props;
            }
        };
        this.setGradient = (...props) => {
            setColors(props);
            return this;
        };
        this.getArray = () => {
            let gradientArray = [];
            for (let j = 0; j < intervals.length; j++) {
                const interval = intervals[j];
                const start = interval.lower === 0 ? 1 : Math.ceil(interval.lower);
                const end = interval.upper === maxNum ? interval.upper + 1 : Math.ceil(interval.upper);
                for (let i = start; i < end; i++) {
                    gradientArray.push(gradients[j].getColor(i));
                }
            }
            return gradientArray;
        };
        this.getColor = (props) => {
            if (isNaN(props)) {
                throw new TypeError(`getColor should be a number`);
            }
            else if (props <= 0) {
                throw new TypeError(`getColor should be greater than ${props}`);
            }
            else {
                let segment = (maxNum - 0) / (gradients.length);
                let index = Math.min(Math.floor((Math.max(props, 0) - 0) / segment), gradients.length - 1);
                return gradients[index].getColor(props);
            }
        };
        this.setMidpoint = (maxNumber) => {
            if (!isNaN(maxNumber) && maxNumber >= 0) {
                maxNum = maxNumber;
                setColors(colors);
            }
            else if (maxNumber <= 0) {
                throw new RangeError(`midPoint should be greater than ${maxNumber}`);
            }
            else {
                throw new RangeError('midPoint should be a number');
            }
            return this;
        };
    }
}
class GradientColor {
    constructor(startColor = '', endColor = '', minNum = 0, maxNum = 10) {
        this.setGradient = (colorStart, colorEnd) => {
            startColor = getHexColor(colorStart);
            endColor = getHexColor(colorEnd);
        };
        this.setMidpoint = (minNumber, maxNumber) => {
            minNum = minNumber;
            maxNum = maxNumber;
        };
        this.getColor = props => {
            if (props) {
                return '#' + generateHex(props, startColor.substring(0, 2), endColor.substring(0, 2)) +
                    generateHex(props, startColor.substring(2, 4), endColor.substring(2, 4)) +
                    generateHex(props, startColor.substring(4, 6), endColor.substring(4, 6));
            }
        };
        const generateHex = (number, start, end) => {
            if (number < minNum) {
                number = minNum;
            }
            else if (number > maxNum) {
                number = maxNum;
            }
            let midPoint = maxNum - minNum;
            let startBase = parseInt(start, 16);
            let endBase = parseInt(end, 16);
            let average = (endBase - startBase) / midPoint;
            let finalBase = Math.round(average * (number - minNum) + startBase);
            let balancedFinalBase = finalBase < 16 ? "0" + finalBase.toString(16) : finalBase.toString(16);
            return balancedFinalBase;
        };
        const getHexColor = (props) => {
            return props.substring(props.length - 6, props.length);
        };
    }
}
let map;
const color1 = "#00FF00";
const color2 = "#FF0000";
const colorGradient = new Gradient();
colorGradient.setGradient(color1, color2);
colorGradient.setMidpoint(1440);
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 64.85, lng: -18.75 },
        zoom: 7,
    });
}
const Circles = [];
let min = 0;
let max = 8;
let EarthquakeData;
function DrawMap() {
    for (const earthquake of EarthquakeData.results) {
        if (earthquake.size >= min && earthquake.size <= max) {
            const diff = Math.floor((Date.now() / 1000) - (new Date(earthquake.timestamp).valueOf() / 1000));
            const minutes = Math.min(Math.floor(diff / 60), 1440); // 1440 = 24 * 60
            Circles.push(new google.maps.Circle({
                strokeColor: colorGradient.getColor(minutes),
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: colorGradient.getColor(minutes),
                fillOpacity: 0.35,
                map,
                center: { lng: earthquake.longitude, lat: earthquake.latitude },
                radius: earthquake.size * 200,
            }));
        }
    }
}
function ClearMap() {
    Circles.forEach((Circle) => {
        Circle.setMap(null);
    });
}
let debounce = Date.now();
function ReloadMap() {
    if (Date.now() - debounce > 30) {
        ClearMap();
        DrawMap();
    }
}
function RefreshEarthquake() {
    GetEarthquakeData().then(data => {
        EarthquakeData = data;
        ReloadMap();
    });
}
function SliderChange(SliderValue) {
    const data = SliderValue.split(",");
    min = parseFloat(data[0]);
    max = parseFloat(data[1]);
    ReloadMap();
}
RefreshEarthquake();
async function GetEarthquakeData() {
    //const request = await fetch("https://apis.is/earthquake/is");
    const request = await fetch("http://localhost:3100/earthquake/is");
    const data = await request.text();
    return JSON.parse(data);
}
