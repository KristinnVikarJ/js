interface Result {
    timestamp: Date;
    latitude: number;
    longitude: number;
    depth: number;
    size: number;
    quality: number;
    humanReadableLocation: string;
}

interface EarthquakeResult {
    results: Result[];
}

async function GetEarthquakeData(): Promise<EarthquakeResult> {
    //const request = await fetch("https://apis.is/earthquake/is");
    const request = await fetch("http://localhost:3100/earthquake/is");
    const data = await request.text();
    return JSON.parse(data);
}