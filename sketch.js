// Major US cities east coast to west coast (16 cities)
const CITIES = [
  { name: 'Boston', lat: 42.3601, lon: -71.0589 },
  { name: 'New York City', lat: 40.7128, lon: -74.0060 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { name: 'Washington DC', lat: 38.9072, lon: -77.0369 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Atlanta', lat: 33.7490, lon: -84.3880 },
  { name: 'Nashville', lat: 36.1627, lon: -86.7816 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 }
];

const CITY_SWITCH_SECONDS = 5;

let cities = [];
let currentCityIndex = 0;
let lastCitySwitchTime = 0;

// Pixel size for the cat
const PIXEL_SIZE = 12; // Smaller cat
const CAT_WIDTH = 20; // wider for tail
const CAT_HEIGHT = 24; // taller for body

// Animation
let blinkTimer = 0;
let isBlinking = false;
let wobbleAngle = 0;

// Pixel clouds
let clouds = [];
const NUM_CLOUDS = 5;
const CLOUD_PIXEL = 12;

function setup() {
  createCanvas(800, 800);
  colorMode(RGB, 255);
  noStroke();
  noSmooth(); // Pixelated game style
  
  cities = CITIES.map(city => ({
    ...city,
    temperature: 20,
    windSpeed: 5,
    weatherCode: 0,
    weatherCondition: 'sunny',
    weatherLoaded: false
  }));
  
  // Create pixel clouds with fixed, stable properties
  for (let i = 0; i < NUM_CLOUDS; i++) {
    clouds.push({
      x: (i * 150) % width, // Evenly spaced initial x positions
      y: 80 + (i * 40), // Fixed y positions, evenly spaced
      type: i % 3, // Fixed type based on index for consistency
      speed: 0.5, // Fixed speed for all clouds - completely stable
      initialY: 80 + (i * 40) // Store initial y position
    });
  }
  
  lastCitySwitchTime = millis();
  fetchWeather();
  setInterval(fetchWeather, 5 * 60 * 1000);
}

// Draw a pixel cloud
function drawPixelCloud(x, y, type, temperature, isStormy = false) {
  // Cloud color based on temperature (darker when stormy)
  let cloudColor, shadowColor;
  if (temperature < 0) {
    cloudColor = isStormy ? [150, 160, 180] : [200, 210, 230];
    shadowColor = isStormy ? [100, 110, 130] : [160, 175, 200];
  } else if (temperature < 15) {
    cloudColor = isStormy ? [180, 190, 210] : [230, 235, 245];
    shadowColor = isStormy ? [140, 150, 170] : [190, 200, 220];
  } else if (temperature < 25) {
    cloudColor = [255, 255, 255];
    shadowColor = [220, 225, 235];
  } else {
    cloudColor = [255, 250, 240];
    shadowColor = [240, 220, 200];
  }
  
  push();
  translate(x, y);
  noStroke();
  
  const p = CLOUD_PIXEL;
  
  // Round fluffy clouds using ellipses
  if (type === 0) {
    // Small round puffy cloud
    // Shadow
    fill(shadowColor);
    ellipse(2.5 * p, 2.2 * p, 5 * p, 2.5 * p);
    // Main puffs
    fill(cloudColor);
    ellipse(1.5 * p, 1.5 * p, 3 * p, 2.5 * p);
    ellipse(3 * p, 1 * p, 3.5 * p, 3 * p);
    ellipse(4.5 * p, 1.5 * p, 3 * p, 2.5 * p);
    ellipse(3 * p, 1.8 * p, 4 * p, 2 * p);
  } else if (type === 1) {
    // Medium round cloud
    // Shadow
    fill(shadowColor);
    ellipse(4 * p, 2.5 * p, 8 * p, 3 * p);
    // Main puffs
    fill(cloudColor);
    ellipse(1.5 * p, 1.8 * p, 3 * p, 2.5 * p);
    ellipse(3.5 * p, 1 * p, 4 * p, 3 * p);
    ellipse(5.5 * p, 0.8 * p, 3.5 * p, 3 * p);
    ellipse(7 * p, 1.5 * p, 3 * p, 2.5 * p);
    ellipse(4 * p, 2 * p, 6 * p, 2.5 * p);
  } else {
    // Big fluffy round cloud
    // Shadow
    fill(shadowColor);
    ellipse(5 * p, 3 * p, 10 * p, 3.5 * p);
    // Main puffs - multiple overlapping circles for fluffy look
    fill(cloudColor);
    ellipse(1.5 * p, 2 * p, 3.5 * p, 3 * p);
    ellipse(3.5 * p, 1 * p, 4 * p, 3.5 * p);
    ellipse(5.5 * p, 0.5 * p, 4.5 * p, 3.5 * p);
    ellipse(7.5 * p, 1 * p, 4 * p, 3 * p);
    ellipse(9 * p, 1.8 * p, 3 * p, 2.5 * p);
    ellipse(5 * p, 2 * p, 7 * p, 3 * p);
    ellipse(3 * p, 2.2 * p, 4 * p, 2.5 * p);
    ellipse(7 * p, 2.2 * p, 4 * p, 2.5 * p);
  }
  
  pop();
}

// Parse weather code to condition
function getWeatherCondition(weatherCode) {
  // WMO Weather codes
  if (weatherCode === 0) return 'sunny';
  if (weatherCode >= 1 && weatherCode <= 3) return 'cloudy';
  if (weatherCode >= 45 && weatherCode <= 48) return 'cloudy'; // Fog
  if (weatherCode >= 51 && weatherCode <= 67) return 'rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
  if (weatherCode >= 80 && weatherCode <= 99) return 'rainy';
  return 'cloudy'; // Default
}

function fetchWeather() {
  const promises = cities.map(city => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,wind_speed_10m,weather_code`;
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        const weatherCode = data.current.weather_code;
        const condition = getWeatherCondition(weatherCode);
        return {
          ...city,
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: weatherCode,
          weatherCondition: condition,
          weatherLoaded: true
        };
      })
      .catch(() => ({ ...city, weatherLoaded: false }));
  });
  
  Promise.all(promises).then(results => {
    results.forEach((data, i) => {
      cities[i].temperature = data.temperature;
      cities[i].windSpeed = data.windSpeed;
      cities[i].weatherCode = data.weatherCode;
      cities[i].weatherCondition = data.weatherCondition;
      cities[i].weatherLoaded = data.weatherLoaded;
    });
    console.log('Weather updated for all cities');
  });
}

// Draw city landmark/icon in pixelated style
function drawCityLandmark(landmark, x, y, scale = 1) {
  const p = PIXEL_SIZE * scale;
  push();
  translate(x, y);
  noStroke();
  
  switch(landmark) {
    case 'historic': // Boston - Historic building (Old State House style)
      fill(180, 160, 140);
      rect(0, p, 4 * p, 5 * p);
      fill(200, 180, 160);
      rect(p, 2 * p, 2 * p, 2 * p);
      fill(150, 130, 110);
      triangle(0, p, 2 * p, 0, 4 * p, p);
      // Columns
      fill(220, 200, 180);
      rect(0.5 * p, 3 * p, p * 0.3, 2 * p);
      rect(3.2 * p, 3 * p, p * 0.3, 2 * p);
      // Clock/ornament at top
      fill(200, 200, 200);
      ellipse(2 * p, 0.5 * p, p * 0.8, p * 0.8);
      break;
      
    case 'statue': // New York - Statue of Liberty
      fill(200, 200, 200);
      rect(p, 0, 2 * p, 5 * p);
      fill(255, 255, 200);
      ellipse(2 * p, -p, 3 * p, 3 * p);
      // Crown spikes
      fill(255, 255, 200);
      for (let i = 0; i < 7; i++) {
        const angle = (i * TWO_PI / 7) - HALF_PI;
        const spikeX = 2 * p + cos(angle) * (1.5 * p);
        const spikeY = -p + sin(angle) * (1.5 * p);
        triangle(spikeX, spikeY, spikeX - 2, spikeY - 3, spikeX + 2, spikeY - 3);
      }
      fill(150, 150, 150);
      rect(0, 5 * p, 4 * p, p);
      break;
      
    case 'libertybell': // Philadelphia - Liberty Bell
      fill(200, 180, 100);
      ellipse(2 * p, 2 * p, 3 * p, 4 * p);
      fill(150, 130, 80);
      rect(2 * p, 0, p, p);
      fill(100, 80, 50);
      rect(1.5 * p, 4 * p, 2 * p, p);
      break;
      
    case 'capitol': // Washington DC - Capitol Building
      fill(255, 255, 255);
      rect(0, 2 * p, 5 * p, 4 * p);
      fill(200, 200, 200);
      triangle(0, 2 * p, 2.5 * p, 0, 5 * p, 2 * p);
      fill(150, 150, 150);
      rect(2 * p, 2 * p, p, 2 * p);
      break;
      
    case 'artdeco': // Miami - Art Deco building
      fill(255, 200, 150);
      rect(0, p, 4 * p, 5 * p);
      fill(200, 150, 100);
      for (let i = 0; i < 3; i++) {
        rect(i * 1.5 * p, p, p, p);
      }
      fill(255, 255, 255);
      rect(0, 0, 4 * p, p);
      break;
      
    case 'peachtree': // Atlanta - Peachtree Tower
      fill(150, 150, 150);
      rect(p, 0, 2 * p, 6 * p);
      fill(200, 200, 200);
      rect(0, p, 4 * p, p);
      rect(0, 3 * p, 4 * p, p);
      break;
      
    case 'guitar': // Nashville - Guitar
      fill(150, 100, 50);
      ellipse(2 * p, 2 * p, 3 * p, 4 * p);
      fill(100, 70, 40);
      rect(2 * p, 0, p, 2 * p);
      fill(200, 200, 200);
      ellipse(2 * p, 2.5 * p, p, p);
      break;
      
    case 'willistower': // Chicago - Willis Tower
      fill(100, 100, 120);
      rect(p, 0, 2 * p, 7 * p);
      fill(80, 80, 100);
      rect(0, p, 4 * p, p);
      rect(0, 3 * p, 4 * p, p);
      rect(0, 5 * p, 4 * p, p);
      break;
      
    case 'cowboys': // Dallas - Star
      fill(255, 255, 0);
      beginShape();
      for (let i = 0; i < 10; i++) {
        const angle = (i * TWO_PI / 10) - HALF_PI;
        const r = (i % 2 === 0) ? 2 * p : p;
        vertex(2 * p + cos(angle) * r, 2 * p + sin(angle) * r);
      }
      endShape(CLOSE);
      break;
      
    case 'rocket': // Houston - Rocket/Space
      fill(200, 200, 200);
      rect(2 * p, 0, p, 4 * p);
      fill(255, 200, 0);
      triangle(2 * p, 4 * p, 2.5 * p, 5 * p, 3 * p, 4 * p);
      fill(150, 150, 200);
      ellipse(2.5 * p, p, p, p);
      break;
      
    case 'mountains': // Denver - Mountains
      fill(150, 180, 150);
      triangle(0, 3 * p, p, p, 2 * p, 3 * p);
      triangle(p, 3 * p, 2 * p, 0, 3 * p, 3 * p);
      fill(200, 220, 200);
      triangle(0, 3 * p, p, 2 * p, 2 * p, 3 * p);
      break;
      
    case 'cactus': // Phoenix - Cactus
      fill(100, 150, 100);
      rect(2 * p, p, p, 4 * p);
      rect(p, 2 * p, p, 2 * p);
      rect(3 * p, 3 * p, p, 2 * p);
      fill(150, 200, 150);
      ellipse(2.5 * p, 2 * p, p, p);
      break;
      
    case 'casino': // Las Vegas - Casino/Dice
      fill(255, 255, 255);
      rect(0, 0, 3 * p, 3 * p);
      fill(0, 0, 0);
      ellipse(p, p, p * 0.3, p * 0.3);
      ellipse(2 * p, 2 * p, p * 0.3, p * 0.3);
      fill(255, 0, 0);
      rect(0, 3 * p, 3 * p, p);
      break;
      
    case 'hollywood': // Los Angeles - Hollywood Sign
      fill(255, 255, 255);
      // H
      rect(0, 2 * p, p * 0.6, 2 * p);
      rect(0, 3 * p, p * 0.6, p * 0.3);
      rect(p * 0.6, 2 * p, p * 0.6, 2 * p);
      // O
      rect(p * 1.2, 2 * p, p * 0.6, p * 0.3);
      rect(p * 1.2, 2 * p, p * 0.2, 2 * p);
      rect(p * 1.6, 2 * p, p * 0.2, 2 * p);
      rect(p * 1.2, 3.7 * p, p * 0.6, p * 0.3);
      // L
      rect(p * 1.9, 2 * p, p * 0.2, 2 * p);
      rect(p * 1.9, 3.7 * p, p * 0.6, p * 0.3);
      // L
      rect(p * 2.6, 2 * p, p * 0.2, 2 * p);
      rect(p * 2.6, 3.7 * p, p * 0.6, p * 0.3);
      // Y
      rect(p * 3.3, 2 * p, p * 0.2, p);
      rect(p * 3.7, 2 * p, p * 0.2, p);
      rect(p * 3.5, 3 * p, p * 0.2, p * 0.7);
      // W
      rect(p * 4, 2 * p, p * 0.2, 2 * p);
      rect(p * 4.4, 3 * p, p * 0.2, p);
      rect(p * 4.8, 2 * p, p * 0.2, 2 * p);
      // O
      rect(p * 5.1, 2 * p, p * 0.6, p * 0.3);
      rect(p * 5.1, 2 * p, p * 0.2, 2 * p);
      rect(p * 5.5, 2 * p, p * 0.2, 2 * p);
      rect(p * 5.1, 3.7 * p, p * 0.6, p * 0.3);
      // O
      rect(p * 5.8, 2 * p, p * 0.6, p * 0.3);
      rect(p * 5.8, 2 * p, p * 0.2, 2 * p);
      rect(p * 6.2, 2 * p, p * 0.2, 2 * p);
      rect(p * 5.8, 3.7 * p, p * 0.6, p * 0.3);
      // D
      rect(p * 6.5, 2 * p, p * 0.2, 2 * p);
      rect(p * 6.5, 2 * p, p * 0.5, p * 0.3);
      rect(p * 6.9, 2 * p, p * 0.2, 2 * p);
      rect(p * 6.5, 3.7 * p, p * 0.5, p * 0.3);
      break;
      
    case 'goldengate': // San Francisco - Golden Gate Bridge
      fill(200, 150, 100); // Golden color
      rect(0, 3 * p, 5 * p, p);
      fill(150, 100, 50);
      triangle(0, 3 * p, 2.5 * p, p, 5 * p, 3 * p);
      // Support towers
      fill(200, 150, 100);
      rect(0.5 * p, 2 * p, p * 0.3, p);
      rect(4.2 * p, 2 * p, p * 0.3, p);
      // Cables
      stroke(200, 200, 200);
      strokeWeight(2);
      for (let i = 1; i < 5; i++) {
        line(i * p, 3 * p, i * p, 2 * p);
      }
      // Main suspension cables
      line(0.65 * p, 2.5 * p, 2.5 * p, p);
      line(4.35 * p, 2.5 * p, 2.5 * p, p);
      noStroke();
      break;
      
    case 'spaceneedle': // Seattle - Space Needle
      fill(200, 200, 200);
      rect(2 * p, 0, p, 5 * p);
      fill(150, 150, 150);
      triangle(2 * p, 0, 2.5 * p, -p, 3 * p, 0);
      // Observation deck
      fill(200, 200, 200);
      ellipse(2.5 * p, 2 * p, 2 * p, p);
      fill(100, 100, 100);
      rect(2 * p, 2 * p, p, p * 0.3);
      // Base
      fill(100, 100, 100);
      rect(1.5 * p, 5 * p, 2 * p, p);
      // Legs
      fill(150, 150, 150);
      triangle(1.5 * p, 5 * p, 2 * p, 4 * p, 2.5 * p, 5 * p);
      triangle(2.5 * p, 5 * p, 3 * p, 4 * p, 3.5 * p, 5 * p);
      break;
  }
  
  pop();
}

// Draw state flag in pixelated style
function drawStateFlag(flag, x, y, width = 60, height = 40) {
  push();
  translate(x, y);
  noStroke();
  
  switch(flag) {
    case 'massachusetts': // MA - Blue with white tree and star
      fill(0, 50, 150);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // Tree symbol (simplified)
      rect(width * 0.3, height * 0.2, width * 0.4, height * 0.6);
      // Star
      fill(255, 255, 0);
      ellipse(width * 0.7, height * 0.3, width * 0.15, width * 0.15);
      break;
      
    case 'newyork': // NY - Blue with state seal (simplified)
      fill(0, 50, 150);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // Simplified seal - circle
      ellipse(width * 0.5, height * 0.5, width * 0.6, height * 0.7);
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.4, height * 0.5);
      break;
      
    case 'pennsylvania': // PA - Blue with state coat of arms
      fill(0, 50, 150);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // Horses (simplified)
      rect(width * 0.2, height * 0.3, width * 0.15, height * 0.4);
      rect(width * 0.65, height * 0.3, width * 0.15, height * 0.4);
      // Shield in center
      fill(200, 0, 0);
      rect(width * 0.4, height * 0.35, width * 0.2, height * 0.3);
      break;
      
    case 'dc': // DC - Three red stars on white bars
      fill(255, 255, 255);
      rect(0, 0, width, height);
      fill(200, 0, 0);
      rect(0, height * 0.33, width, height * 0.1);
      rect(0, height * 0.67, width, height * 0.1);
      fill(200, 0, 0);
      // Three stars
      for (let i = 0; i < 3; i++) {
        ellipse(width * (0.25 + i * 0.25), height * 0.5, width * 0.1, width * 0.1);
      }
      break;
      
    case 'florida': // FL - Red X on white, state seal
      fill(255, 255, 255);
      rect(0, 0, width, height);
      fill(200, 0, 0);
      stroke(200, 0, 0);
      strokeWeight(3);
      line(0, 0, width, height);
      line(width, 0, 0, height);
      noStroke();
      // State seal circle
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.4, height * 0.5);
      break;
      
    case 'georgia': // GA - Blue with state seal
      fill(0, 50, 150);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // Circle seal
      ellipse(width * 0.5, height * 0.5, width * 0.5, height * 0.6);
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.3, height * 0.4);
      break;
      
    case 'tennessee': // TN - Red, white, blue with circle
      fill(200, 0, 0);
      rect(0, 0, width, height * 0.33);
      fill(255, 255, 255);
      rect(0, height * 0.33, width, height * 0.33);
      fill(0, 50, 150);
      rect(0, height * 0.67, width, height * 0.33);
      // Blue circle
      fill(0, 50, 150);
      ellipse(width * 0.25, height * 0.5, width * 0.2, width * 0.2);
      fill(255, 255, 255);
      ellipse(width * 0.25, height * 0.5, width * 0.1, width * 0.1);
      break;
      
    case 'illinois': // IL - White with state seal
      fill(255, 255, 255);
      rect(0, 0, width, height);
      fill(0, 50, 150);
      // State seal circle
      ellipse(width * 0.5, height * 0.5, width * 0.5, height * 0.6);
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.3, height * 0.4);
      break;
      
    case 'texas': // TX - Blue, white, red with star
      fill(0, 50, 150);
      rect(0, 0, width * 0.33, height);
      fill(255, 255, 255);
      rect(width * 0.33, 0, width * 0.33, height);
      fill(200, 0, 0);
      rect(width * 0.67, 0, width * 0.33, height);
      // White star on blue
      fill(255, 255, 255);
      beginShape();
      for (let i = 0; i < 5; i++) {
        const angle = (i * TWO_PI / 5) - HALF_PI;
        const r = (i % 2 === 0) ? width * 0.1 : width * 0.05;
        vertex(width * 0.165 + cos(angle) * r, height * 0.5 + sin(angle) * r);
      }
      endShape(CLOSE);
      break;
      
    case 'colorado': // CO - Blue, white, blue with C and circle
      fill(0, 50, 150);
      rect(0, 0, width, height * 0.33);
      fill(255, 255, 255);
      rect(0, height * 0.33, width, height * 0.33);
      fill(0, 50, 150);
      rect(0, height * 0.67, width, height * 0.33);
      // Red C
      fill(200, 0, 0);
      noFill();
      stroke(200, 0, 0);
      strokeWeight(4);
      arc(width * 0.3, height * 0.5, width * 0.3, height * 0.5, 0, PI + HALF_PI);
      noStroke();
      // Yellow circle
      fill(255, 255, 0);
      ellipse(width * 0.3, height * 0.5, width * 0.15, height * 0.2);
      break;
      
    case 'arizona': // AZ - Red and yellow rays with star
      // Red and yellow rays
      for (let i = 0; i < 6; i++) {
        fill(i % 2 === 0 ? [200, 0, 0] : [255, 200, 0]);
        triangle(0, height * (i / 6), width, height * (i / 6), width * 0.5, height * 0.5);
      }
      // Blue bottom half
      fill(0, 50, 150);
      rect(0, height * 0.5, width, height * 0.5);
      // Star
      fill(255, 255, 255);
      beginShape();
      for (let i = 0; i < 5; i++) {
        const angle = (i * TWO_PI / 5) - HALF_PI;
        const r = (i % 2 === 0) ? width * 0.08 : width * 0.04;
        vertex(width * 0.5 + cos(angle) * r, height * 0.75 + sin(angle) * r);
      }
      endShape(CLOSE);
      break;
      
    case 'nevada': // NV - Blue with state name and stars
      fill(0, 50, 150);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // Text area (simplified as rectangle)
      rect(width * 0.1, height * 0.3, width * 0.8, height * 0.4);
      // Stars
      fill(255, 255, 0);
      for (let i = 0; i < 2; i++) {
        ellipse(width * (0.2 + i * 0.6), height * 0.2, width * 0.08, width * 0.08);
      }
      break;
      
    case 'california': // CA - Bear flag
      fill(255, 255, 255);
      rect(0, 0, width, height);
      fill(200, 0, 0);
      // Red stripe at bottom
      rect(0, height * 0.8, width, height * 0.2);
      // Bear (simplified)
      fill(150, 100, 50);
      ellipse(width * 0.3, height * 0.5, width * 0.25, height * 0.4);
      // Star
      fill(200, 0, 0);
      beginShape();
      for (let i = 0; i < 5; i++) {
        const angle = (i * TWO_PI / 5) - HALF_PI;
        const r = (i % 2 === 0) ? width * 0.08 : width * 0.04;
        vertex(width * 0.7 + cos(angle) * r, height * 0.3 + sin(angle) * r);
      }
      endShape(CLOSE);
      break;
      
    case 'washington': // WA - Green with state seal
      fill(0, 100, 50);
      rect(0, 0, width, height);
      fill(255, 255, 255);
      // State seal circle
      ellipse(width * 0.5, height * 0.5, width * 0.5, height * 0.6);
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.3, height * 0.4);
      // Portrait (simplified)
      fill(200, 150, 100);
      ellipse(width * 0.5, height * 0.5, width * 0.15, height * 0.2);
      break;
  }
  
  pop();
}

// Draw a single pixel
function drawPixel(x, y, col) {
  // Sharp pixelated game style - crisp rectangles
  fill(col);
  noStroke();
  rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

// Get cat colors based on temperature
function getCatColors(temperature) {
  // Base yellow cat color, tinted by temperature
  let baseYellow, darkYellow, pink, cheekColor;
  
  if (temperature < -10) {
    // Frozen solid: icy blue-white
    baseYellow = [180, 200, 255];
    darkYellow = [120, 150, 220];
    pink = [150, 170, 200];
    cheekColor = [140, 160, 200];
  } else if (temperature < 0) {
    // Freezing: blue tint
    baseYellow = [200, 210, 230];
    darkYellow = [150, 160, 180];
    pink = [180, 150, 170];
    cheekColor = [170, 180, 210];
  } else if (temperature < 15) {
    // Cool: normal yellow
    baseYellow = [255, 220, 100];
    darkYellow = [230, 180, 60];
    pink = [255, 180, 180];
    cheekColor = [255, 180, 150];
  } else if (temperature < 25) {
    // Mild: warm yellow
    baseYellow = [255, 210, 80];
    darkYellow = [240, 170, 50];
    pink = [255, 160, 160];
    cheekColor = [255, 160, 130];
  } else {
    // Hot: orange tint
    baseYellow = [255, 190, 70];
    darkYellow = [250, 150, 40];
    pink = [255, 140, 140];
    cheekColor = [255, 130, 100];
  }
  
  return { baseYellow, darkYellow, pink, cheekColor };
}

// Get expression based on weather
function getExpression(temperature, windSpeed) {
  // Extremely cold = frozen solid!
  if (temperature < -10) return 'frozen';
  // Cold AND windy = being blown away!
  if (temperature < 10 && windSpeed > 20) return 'blownAway';
  if (temperature < 0) return 'freezing';
  if (temperature < 10) return 'cold';
  if (temperature > 35) return 'hot';
  if (temperature > 28) return 'warm';
  if (windSpeed > 30) return 'windy';
  return 'happy';
}

function drawCat(offsetX, offsetY, temperature, windSpeed, weatherCondition = 'sunny') {
  const colors = getCatColors(temperature);
  const expression = getExpression(temperature, windSpeed);
  
  // More dramatic wobble based on expression
  let wobbleSpeed = 0.1;
  let wobbleAmount = map(windSpeed, 0, 50, 0, 0.1);
  let shakeX = 0;
  let shakeY = 0;
  
  if (expression === 'frozen') {
    // Completely frozen - no movement at all
    wobbleSpeed = 0;
    wobbleAmount = 0;
    shakeX = 0;
    shakeY = 0;
  } else if (expression === 'blownAway') {
    // Intense shaking and tilting when blown away
    wobbleSpeed = 0.4;
    wobbleAmount = 0.25;
    shakeX = sin(frameCount * 0.5) * 8 + windSpeed * 0.2;
    shakeY = cos(frameCount * 0.7) * 4;
  } else if (expression === 'freezing') {
    // Shivering
    shakeX = sin(frameCount * 0.8) * 3;
    shakeY = cos(frameCount * 0.9) * 2;
  } else if (expression === 'cold') {
    // Slight shiver
    shakeX = sin(frameCount * 0.5) * 1.5;
  }
  
  wobbleAngle = sin(frameCount * wobbleSpeed) * wobbleAmount;
  
  // Tail wag animation - frozen = no movement
  let tailSpeed, tailWag;
  if (expression === 'frozen') {
    tailSpeed = 0;
    tailWag = 0; // Completely frozen, no movement
  } else if (expression === 'blownAway') {
    tailSpeed = 0.4;
    tailWag = sin(frameCount * tailSpeed) * 4;
  } else {
    tailSpeed = 0.15;
    tailWag = sin(frameCount * tailSpeed) * 2;
  }
  
  push();
  translate(offsetX + (CAT_WIDTH * PIXEL_SIZE) / 2 + shakeX, offsetY + (CAT_HEIGHT * PIXEL_SIZE) / 2 + shakeY);
  rotate(wobbleAngle);
  translate(-(CAT_WIDTH * PIXEL_SIZE) / 2, -(CAT_HEIGHT * PIXEL_SIZE) / 2);
  
  const c = colors;
  const eyeColor = [40, 40, 40];
  const whiteColor = [255, 255, 255];
  
  // === TAIL (behind body) ===
  // Curled tail on right side, animated
  const tailBaseY = 16;
  drawPixel(16, tailBaseY + floor(tailWag * 0.3), c.baseYellow);
  drawPixel(17, tailBaseY - 1 + floor(tailWag * 0.5), c.baseYellow);
  drawPixel(18, tailBaseY - 2 + floor(tailWag * 0.7), c.baseYellow);
  drawPixel(18, tailBaseY - 3 + floor(tailWag), c.baseYellow);
  drawPixel(17, tailBaseY - 4 + floor(tailWag), c.darkYellow);
  drawPixel(16, tailBaseY - 4 + floor(tailWag * 0.8), c.darkYellow);
  
  // === BODY ===
  // Body (rows 14-21)
  for (let y = 14; y <= 21; y++) {
    let startX, endX;
    if (y === 14) { startX = 3; endX = 12; }
    else if (y === 15) { startX = 2; endX = 13; }
    else if (y >= 16 && y <= 19) { startX = 2; endX = 14; }
    else if (y === 20) { startX = 2; endX = 13; }
    else if (y === 21) { startX = 3; endX = 12; }
    
    for (let x = startX; x <= endX; x++) {
      drawPixel(x, y, c.baseYellow);
    }
  }
  
  // Body shading
  drawPixel(2, 16, c.darkYellow);
  drawPixel(2, 17, c.darkYellow);
  drawPixel(14, 16, c.darkYellow);
  drawPixel(14, 17, c.darkYellow);
  
  // === CLOTHING BASED ON WEATHER ===
  const isWarm = temperature > 20; // Hotter than 20°C = beach time!
  const isCold = temperature < 15;
  
  if (isWarm) {
    // === BEACH WEAR ===
    // Bikini top (pink/red)
    const bikiniColor = [255, 100, 150];
    drawPixel(6, 15, bikiniColor);
    drawPixel(7, 15, bikiniColor);
    drawPixel(8, 15, bikiniColor);
    drawPixel(9, 15, bikiniColor);
    drawPixel(7, 16, bikiniColor);
    drawPixel(8, 16, bikiniColor);
    
    // Bikini bottom
    drawPixel(5, 20, bikiniColor);
    drawPixel(6, 20, bikiniColor);
    drawPixel(7, 20, bikiniColor);
    drawPixel(8, 20, bikiniColor);
    drawPixel(9, 20, bikiniColor);
    drawPixel(10, 20, bikiniColor);
    drawPixel(6, 21, bikiniColor);
    drawPixel(7, 21, bikiniColor);
    drawPixel(8, 21, bikiniColor);
    drawPixel(9, 21, bikiniColor);
    
    
  } else if (isCold) {
    // === RED SCARF ===
    const scarfColor = [200, 50, 50];
    const scarfPattern = [150, 30, 30];
    // Scarf around neck
    drawPixel(4, 13, scarfColor);
    drawPixel(5, 13, scarfColor);
    drawPixel(6, 13, scarfColor);
    drawPixel(7, 13, scarfColor);
    drawPixel(8, 13, scarfColor);
    drawPixel(9, 13, scarfColor);
    drawPixel(10, 13, scarfColor);
    drawPixel(11, 13, scarfColor);
    // Scarf hanging down
    drawPixel(5, 14, scarfColor);
    drawPixel(6, 14, scarfPattern);
    drawPixel(7, 14, scarfColor);
    drawPixel(8, 14, scarfPattern);
    drawPixel(9, 14, scarfColor);
    drawPixel(10, 14, scarfPattern);
    drawPixel(5, 15, scarfColor);
    drawPixel(6, 15, scarfColor);
    drawPixel(9, 15, scarfColor);
    drawPixel(10, 15, scarfColor);
  }
  
  // === FRONT PAWS ===
  // Left paw
  drawPixel(3, 22, c.baseYellow);
  drawPixel(4, 22, c.baseYellow);
  drawPixel(5, 22, c.baseYellow);
  drawPixel(3, 23, c.darkYellow);
  drawPixel(4, 23, c.darkYellow);
  drawPixel(5, 23, c.darkYellow);
  
  // Right paw
  drawPixel(10, 22, c.baseYellow);
  drawPixel(11, 22, c.baseYellow);
  drawPixel(12, 22, c.baseYellow);
  drawPixel(10, 23, c.darkYellow);
  drawPixel(11, 23, c.darkYellow);
  drawPixel(12, 23, c.darkYellow);
  
  // Paw pads (pink)
  drawPixel(4, 23, c.pink);
  if (!isWarm) {
    drawPixel(11, 23, c.pink); // Only draw right paw pad if not holding coconut
  }
  
  // === COCONUT JUICE FOR WARM WEATHER ===
  if (isWarm) {
    const coconutColor = [200, 150, 100];
    const strawColor = [255, 200, 100];
    // Coconut cup in right paw (replaces paw pad)
    drawPixel(11, 22, coconutColor);
    drawPixel(12, 22, coconutColor);
    drawPixel(11, 23, coconutColor);
    drawPixel(12, 23, coconutColor);
    // Straw sticking up
    drawPixel(12, 21, strawColor);
    drawPixel(12, 20, strawColor);
    drawPixel(12, 19, strawColor);
  }
  
  // === HEAD ===
  // Left ear
  drawPixel(3, 0, c.darkYellow);
  drawPixel(4, 0, c.darkYellow);
  drawPixel(2, 1, c.darkYellow);
  drawPixel(3, 1, c.baseYellow);
  drawPixel(4, 1, c.baseYellow);
  drawPixel(5, 1, c.darkYellow);
  drawPixel(3, 2, c.baseYellow);
  drawPixel(4, 2, c.baseYellow);
  
  // Right ear
  drawPixel(11, 0, c.darkYellow);
  drawPixel(12, 0, c.darkYellow);
  drawPixel(10, 1, c.darkYellow);
  drawPixel(11, 1, c.baseYellow);
  drawPixel(12, 1, c.baseYellow);
  drawPixel(13, 1, c.darkYellow);
  drawPixel(11, 2, c.baseYellow);
  drawPixel(12, 2, c.baseYellow);
  
  // Inner ear (pink)
  drawPixel(3, 1, c.pink);
  drawPixel(4, 1, c.pink);
  drawPixel(11, 1, c.pink);
  drawPixel(12, 1, c.pink);
  
  // Head shape (rows 2-13)
  for (let y = 2; y <= 13; y++) {
    let startX, endX;
    if (y === 2) { startX = 5; endX = 10; }
    else if (y === 3) { startX = 3; endX = 12; }
    else if (y === 4) { startX = 2; endX = 13; }
    else if (y >= 5 && y <= 11) { startX = 1; endX = 14; }
    else if (y === 12) { startX = 2; endX = 13; }
    else if (y === 13) { startX = 3; endX = 12; }
    
    for (let x = startX; x <= endX; x++) {
      drawPixel(x, y, c.baseYellow);
    }
  }
  
  // Head outline (darker)
  for (let x = 5; x <= 10; x++) drawPixel(x, 2, c.darkYellow);
  drawPixel(3, 3, c.darkYellow);
  drawPixel(4, 3, c.darkYellow);
  drawPixel(11, 3, c.darkYellow);
  drawPixel(12, 3, c.darkYellow);
  
  // === BLINKING ===
  blinkTimer++;
  if (blinkTimer > 180 && !isBlinking) {
    isBlinking = true;
    blinkTimer = 0;
  }
  if (isBlinking && blinkTimer > 10) {
    isBlinking = false;
    blinkTimer = 0;
  }
  
  // === EYES ===
  if (expression === 'frozen') {
    // Frozen solid - wide frozen eyes with ice crystals
    const iceColor = [180, 220, 255];
    drawPixel(3, 5, iceColor);
    drawPixel(4, 5, iceColor);
    drawPixel(5, 5, iceColor);
    drawPixel(6, 5, iceColor);
    drawPixel(3, 6, iceColor);
    drawPixel(4, 6, iceColor);
    drawPixel(5, 6, iceColor);
    drawPixel(6, 6, iceColor);
    // Pupils frozen
    drawPixel(4, 5, [100, 150, 200]);
    drawPixel(5, 5, [100, 150, 200]);
    drawPixel(4, 6, [100, 150, 200]);
    drawPixel(5, 6, [100, 150, 200]);
    // Right eye
    drawPixel(9, 5, iceColor);
    drawPixel(10, 5, iceColor);
    drawPixel(11, 5, iceColor);
    drawPixel(12, 5, iceColor);
    drawPixel(9, 6, iceColor);
    drawPixel(10, 6, iceColor);
    drawPixel(11, 6, iceColor);
    drawPixel(12, 6, iceColor);
    drawPixel(10, 5, [100, 150, 200]);
    drawPixel(11, 5, [100, 150, 200]);
    drawPixel(10, 6, [100, 150, 200]);
    drawPixel(11, 6, [100, 150, 200]);
  } else if (expression === 'blownAway') {
    // Panicked wide eyes with tears
    drawPixel(3, 5, whiteColor);
    drawPixel(4, 5, whiteColor);
    drawPixel(5, 5, whiteColor);
    drawPixel(6, 5, whiteColor);
    drawPixel(3, 6, whiteColor);
    drawPixel(4, 6, whiteColor);
    drawPixel(5, 6, whiteColor);
    drawPixel(6, 6, whiteColor);
    drawPixel(4, 5, eyeColor);
    drawPixel(5, 5, eyeColor);
    drawPixel(4, 6, eyeColor);
    drawPixel(5, 6, eyeColor);
    // Tears
    if (frameCount % 20 < 15) {
      drawPixel(3, 7, [150, 200, 255]);
      drawPixel(3, 8, [150, 200, 255]);
    }
    // Right eye
    drawPixel(9, 5, whiteColor);
    drawPixel(10, 5, whiteColor);
    drawPixel(11, 5, whiteColor);
    drawPixel(12, 5, whiteColor);
    drawPixel(9, 6, whiteColor);
    drawPixel(10, 6, whiteColor);
    drawPixel(11, 6, whiteColor);
    drawPixel(12, 6, whiteColor);
    drawPixel(10, 5, eyeColor);
    drawPixel(11, 5, eyeColor);
    drawPixel(10, 6, eyeColor);
    drawPixel(11, 6, eyeColor);
  } else if (isBlinking || expression === 'freezing') {
    // Tightly shut freezing eyes
    drawPixel(3, 6, eyeColor);
    drawPixel(4, 6, eyeColor);
    drawPixel(5, 6, eyeColor);
    drawPixel(6, 6, eyeColor);
    drawPixel(9, 6, eyeColor);
    drawPixel(10, 6, eyeColor);
    drawPixel(11, 6, eyeColor);
    drawPixel(12, 6, eyeColor);
    // Icicles
    if (expression === 'freezing' && frameCount % 15 < 10) {
      drawPixel(4, 7, [180, 220, 255]);
      drawPixel(11, 7, [180, 220, 255]);
    }
  } else if (expression === 'cold') {
    // Worried eyes
    drawPixel(4, 5, whiteColor);
    drawPixel(5, 5, whiteColor);
    drawPixel(4, 6, whiteColor);
    drawPixel(5, 6, whiteColor);
    drawPixel(5, 6, eyeColor);
    drawPixel(10, 5, whiteColor);
    drawPixel(11, 5, whiteColor);
    drawPixel(10, 6, whiteColor);
    drawPixel(11, 6, whiteColor);
    drawPixel(10, 6, eyeColor);
    // Eyebrows worried
    drawPixel(3, 4, eyeColor);
    drawPixel(12, 4, eyeColor);
  } else if (expression === 'hot') {
    // Droopy tired eyes
    drawPixel(4, 5, whiteColor);
    drawPixel(5, 5, whiteColor);
    drawPixel(4, 6, eyeColor);
    drawPixel(5, 6, eyeColor);
    drawPixel(10, 5, whiteColor);
    drawPixel(11, 5, whiteColor);
    drawPixel(10, 6, eyeColor);
    drawPixel(11, 6, eyeColor);
  } else if (expression === 'windy') {
    // Squinting against wind
    drawPixel(4, 6, eyeColor);
    drawPixel(5, 6, eyeColor);
    drawPixel(10, 6, eyeColor);
    drawPixel(11, 6, eyeColor);
    drawPixel(4, 7, eyeColor);
    drawPixel(11, 7, eyeColor);
  } else {
    // Normal happy eyes
    drawPixel(4, 5, whiteColor);
    drawPixel(5, 5, whiteColor);
    drawPixel(4, 6, whiteColor);
    drawPixel(5, 6, whiteColor);
    drawPixel(5, 6, eyeColor);
    drawPixel(5, 5, eyeColor);
    drawPixel(10, 5, whiteColor);
    drawPixel(11, 5, whiteColor);
    drawPixel(10, 6, whiteColor);
    drawPixel(11, 6, whiteColor);
    drawPixel(10, 6, eyeColor);
    drawPixel(10, 5, eyeColor);
  }
  
  // === ACCESSORIES FOR WARM WEATHER (after eyes) ===
  if (isWarm && !isBlinking) {
    // Sunglasses (cool style) - drawn after eyes
    const sunglassColor = [50, 50, 50];
    const lensColor = [100, 150, 200];
    // Left lens
    drawPixel(3, 4, sunglassColor);
    drawPixel(4, 4, sunglassColor);
    drawPixel(5, 4, sunglassColor);
    drawPixel(6, 4, sunglassColor);
    drawPixel(3, 5, lensColor);
    drawPixel(4, 5, lensColor);
    drawPixel(5, 5, lensColor);
    drawPixel(6, 5, lensColor);
    // Bridge
    drawPixel(7, 4, sunglassColor);
    drawPixel(7, 5, sunglassColor);
    // Right lens
    drawPixel(8, 4, sunglassColor);
    drawPixel(9, 4, sunglassColor);
    drawPixel(10, 4, sunglassColor);
    drawPixel(11, 4, sunglassColor);
    drawPixel(8, 5, lensColor);
    drawPixel(9, 5, lensColor);
    drawPixel(10, 5, lensColor);
    drawPixel(11, 5, lensColor);
    // Arms
    drawPixel(2, 4, sunglassColor);
    drawPixel(12, 4, sunglassColor);
  }
  
  // === CHEEKS ===
  drawPixel(2, 8, c.cheekColor);
  drawPixel(3, 8, c.cheekColor);
  drawPixel(2, 9, c.cheekColor);
  drawPixel(12, 8, c.cheekColor);
  drawPixel(13, 8, c.cheekColor);
  drawPixel(13, 9, c.cheekColor);
  
  // === NOSE ===
  drawPixel(7, 8, c.pink);
  drawPixel(8, 8, c.pink);
  
  // === MOUTH ===
  if (expression === 'frozen') {
    // Frozen solid - mouth frozen shut with ice
    const iceColor = [180, 220, 255];
    drawPixel(6, 10, iceColor);
    drawPixel(7, 10, iceColor);
    drawPixel(8, 10, iceColor);
    drawPixel(9, 10, iceColor);
    drawPixel(6, 11, iceColor);
    drawPixel(7, 11, iceColor);
    drawPixel(8, 11, iceColor);
    drawPixel(9, 11, iceColor);
    // Ice crack lines
    drawPixel(7, 10, [100, 150, 200]);
    drawPixel(8, 10, [100, 150, 200]);
  } else if (expression === 'blownAway') {
    // Screaming/yelling mouth - wide open
    drawPixel(5, 10, eyeColor);
    drawPixel(6, 10, eyeColor);
    drawPixel(9, 10, eyeColor);
    drawPixel(10, 10, eyeColor);
    drawPixel(5, 11, eyeColor);
    drawPixel(10, 11, eyeColor);
    drawPixel(5, 12, eyeColor);
    drawPixel(6, 12, eyeColor);
    drawPixel(9, 12, eyeColor);
    drawPixel(10, 12, eyeColor);
    // Inside mouth
    drawPixel(6, 11, [80, 40, 40]);
    drawPixel(7, 11, [80, 40, 40]);
    drawPixel(8, 11, [80, 40, 40]);
    drawPixel(9, 11, [80, 40, 40]);
    drawPixel(7, 12, [80, 40, 40]);
    drawPixel(8, 12, [80, 40, 40]);
  } else if (expression === 'freezing') {
    // Chattering teeth - wavy frozen mouth
    const chatter = frameCount % 10 < 5 ? 0 : 1;
    drawPixel(5, 10 + chatter, eyeColor);
    drawPixel(6, 11, eyeColor);
    drawPixel(7, 10 + chatter, eyeColor);
    drawPixel(8, 11, eyeColor);
    drawPixel(9, 10 + chatter, eyeColor);
    drawPixel(10, 11, eyeColor);
  } else if (expression === 'cold') {
    // Worried frown
    drawPixel(5, 11, eyeColor);
    drawPixel(6, 10, eyeColor);
    drawPixel(7, 10, eyeColor);
    drawPixel(8, 10, eyeColor);
    drawPixel(9, 10, eyeColor);
    drawPixel(10, 11, eyeColor);
  } else if (expression === 'hot') {
    // Panting with tongue out
    drawPixel(6, 10, eyeColor);
    drawPixel(9, 10, eyeColor);
    drawPixel(6, 11, eyeColor);
    drawPixel(7, 11, [255, 150, 150]);
    drawPixel(8, 11, [255, 150, 150]);
    drawPixel(9, 11, eyeColor);
    drawPixel(7, 12, [255, 130, 130]);
    drawPixel(8, 12, [255, 130, 130]);
  } else if (expression === 'windy') {
    // Surprised O mouth
    drawPixel(7, 10, eyeColor);
    drawPixel(8, 10, eyeColor);
    drawPixel(6, 11, eyeColor);
    drawPixel(9, 11, eyeColor);
    drawPixel(7, 11, c.pink);
    drawPixel(8, 11, c.pink);
  } else {
    // Happy smile :3
    drawPixel(5, 10, eyeColor);
    drawPixel(6, 11, eyeColor);
    drawPixel(7, 10, eyeColor);
    drawPixel(8, 10, eyeColor);
    drawPixel(9, 11, eyeColor);
    drawPixel(10, 10, eyeColor);
  }
  
  // === WHISKERS ===
  drawPixel(0, 8, c.darkYellow);
  drawPixel(0, 9, c.darkYellow);
  drawPixel(15, 8, c.darkYellow);
  drawPixel(15, 9, c.darkYellow);
  
  // === WEATHER EFFECTS ===
  if (expression === 'frozen') {
    // Frozen solid - ice crystals all around
    const iceColor = [200, 230, 255];
    const iceBright = [255, 255, 255];
    
    // Ice crystals around cat
    for (let i = 0; i < 8; i++) {
      const angle = (frameCount * 0.02 + i * PI / 4);
      const dist = 8 + sin(frameCount * 0.1 + i) * 2;
      const ix = 7.5 + cos(angle) * dist;
      const iy = 12 + sin(angle) * dist;
      
      // Ice crystal shape
      drawPixel(floor(ix), floor(iy), iceBright);
      drawPixel(floor(ix) + 1, floor(iy), iceColor);
      drawPixel(floor(ix) - 1, floor(iy), iceColor);
      drawPixel(floor(ix), floor(iy) + 1, iceColor);
      drawPixel(floor(ix), floor(iy) - 1, iceColor);
    }
    
    // Ice covering on body
    if (frameCount % 30 < 20) {
      drawPixel(5, 16, iceColor);
      drawPixel(10, 16, iceColor);
      drawPixel(7, 18, iceColor);
      drawPixel(8, 18, iceColor);
    }
    
    // Frost on whiskers
    drawPixel(0, 8, iceColor);
    drawPixel(0, 9, iceColor);
    drawPixel(15, 8, iceColor);
    drawPixel(15, 9, iceColor);
    
    // Ice on tail
    drawPixel(16, 16, iceColor);
    drawPixel(17, 15, iceColor);
  } else if (expression === 'blownAway') {
    // Intense wind lines flying past
    const windOffset = frameCount % 20;
    for (let i = 0; i < 5; i++) {
      const wx = -3 + (windOffset + i * 4) % 25;
      const wy = 3 + i * 5;
      drawPixel(wx, wy, [180, 220, 255]);
      drawPixel(wx + 1, wy, [200, 230, 255]);
      drawPixel(wx + 2, wy, [220, 240, 255]);
    }
    // Flying fur/hair
    if (frameCount % 8 < 4) {
      drawPixel(-2, 2, c.baseYellow);
      drawPixel(-3, 3, c.baseYellow);
      drawPixel(-2, 8, c.darkYellow);
    }
    // Snowflakes/debris
    for (let i = 0; i < 3; i++) {
      const sx = (frameCount * 2 + i * 30) % 25 - 5;
      const sy = (frameCount + i * 20) % 20 + 2;
      drawPixel(sx, sy, [255, 255, 255]);
    }
  } else if (expression === 'freezing') {
    // Shiver lines and icicles
    if (frameCount % 6 < 3) {
      drawPixel(-2, 4, [200, 220, 255]);
      drawPixel(-2, 6, [200, 220, 255]);
      drawPixel(-2, 8, [200, 220, 255]);
      drawPixel(17, 5, [200, 220, 255]);
      drawPixel(17, 7, [200, 220, 255]);
      drawPixel(17, 9, [200, 220, 255]);
    }
    // Snowflakes
    const snowX = (frameCount * 0.5) % 20;
    drawPixel(snowX, 1, [255, 255, 255]);
    drawPixel(snowX + 7, 3, [255, 255, 255]);
  } else if (expression === 'cold') {
    // Light shiver lines
    if (frameCount % 10 < 5) {
      drawPixel(-1, 5, [200, 220, 255]);
      drawPixel(-1, 7, [200, 220, 255]);
      drawPixel(16, 6, [200, 220, 255]);
      drawPixel(16, 8, [200, 220, 255]);
    }
  }
  
  if (expression === 'hot') {
    // Multiple sweat drops
    if (frameCount % 30 < 20) {
      drawPixel(0, 4, [150, 200, 255]);
      drawPixel(15, 5, [150, 200, 255]);
    }
    if (frameCount % 25 < 15) {
      drawPixel(1, 6, [150, 200, 255]);
      drawPixel(14, 4, [150, 200, 255]);
    }
  }
  
  // Rainy weather effects - water droplets on cat
  if (weatherCondition === 'rainy') {
    // Water droplets on body
    for (let i = 0; i < 5; i++) {
      const dropX = (frameCount * 0.3 + i * 15) % 20;
      const dropY = (frameCount * 0.5 + i * 8) % 24;
      if (dropY > 8 && dropY < 20) { // On body area
        drawPixel(dropX, dropY, [150, 180, 220]);
      }
    }
    // Wet/darker fur effect
    if (frameCount % 40 < 20) {
      // Slightly darker pixels to simulate wet fur
      for (let i = 0; i < 3; i++) {
        const wetX = 5 + i * 5;
        const wetY = 10 + i * 2;
        const originalColor = c.baseYellow;
        const wetColor = [
          originalColor[0] * 0.7,
          originalColor[1] * 0.7,
          originalColor[2] * 0.7
        ];
        drawPixel(wetX, wetY, wetColor);
      }
    }
  }
  
  pop();
}

function draw() {
  // Switch city
  if (millis() - lastCitySwitchTime >= CITY_SWITCH_SECONDS * 1000) {
    currentCityIndex = (currentCityIndex + 1) % cities.length;
    lastCitySwitchTime = millis();
  }
  
  const city = cities[currentCityIndex];
  
  // Background based on temperature and weather condition
  const isWarm = city.temperature > 20; // Hotter than 20°C = beach!
  const isCold = city.temperature < 15;
  const isFrozen = city.temperature < -10;
  const weatherCondition = city.weatherCondition || 'sunny';
  
  let bgColor;
  // Weather condition overrides temperature for sky color
  if (weatherCondition === 'snow' || isFrozen) {
    bgColor = [30, 40, 60]; // Very dark grey-blue for snow
  } else if (weatherCondition === 'rainy') {
    bgColor = [60, 70, 90]; // Dark grey for rain
  } else if (weatherCondition === 'cloudy') {
    bgColor = [100, 110, 130]; // Grey sky
  } else if (weatherCondition === 'sunny' && isWarm) {
    bgColor = [200, 220, 255]; // Bright beach sky
  } else if (weatherCondition === 'sunny') {
    bgColor = [135, 200, 250]; // Nice bright blue
  } else if (city.temperature < 0) {
    bgColor = [40, 50, 70]; // Cold dark blue
  } else if (city.temperature < 15) {
    bgColor = [70, 130, 180]; // Cool blue
  } else {
    bgColor = [135, 200, 250]; // Nice sky blue
  }
  background(bgColor);
  
  // === WEATHER CONDITION EFFECTS ===
  if (weatherCondition === 'snow' || isFrozen) {
    // Snow falling vertically
    noStroke();
    fill(255, 255, 255, 200);
    const snowCount = weatherCondition === 'snow' ? 50 : 30;
    for (let i = 0; i < snowCount; i++) {
      // X position stays relatively fixed (only slight variation)
      const snowX = (i * (width / snowCount) + sin(frameCount * 0.01 + i) * 5) % width;
      // Y position moves down vertically
      const snowY = (frameCount * 1.5 + i * (height / snowCount)) % height;
      ellipse(snowX, snowY, 3, 3);
      // Some larger snowflakes
      if (i % 5 === 0) {
        ellipse(snowX + sin(frameCount * 0.02 + i) * 3, snowY + 5, 5, 5);
      }
    }
    
    // Snow on ground
    fill(255, 255, 255, 180);
    rect(0, height - 30, width, 30);
    
    // Ice crystals on ground
    fill(200, 230, 255, 150);
    for (let i = 0; i < 15; i++) {
      const iceX = (i * 60 + frameCount * 0.2) % width;
      const iceY = height - 20 + sin(iceX * 0.1) * 5;
      ellipse(iceX, iceY, 8, 8);
    }
  } else if (weatherCondition === 'rainy') {
    // Rain drops falling
    noStroke();
    fill(150, 180, 220, 180);
    for (let i = 0; i < 100; i++) {
      const rainX = (frameCount * 2 + i * 15) % width;
      const rainY = (frameCount * 8 + i * 25) % height;
      rect(rainX, rainY, 2, 15);
    }
    
    // Puddles on ground
    fill(80, 100, 130, 120);
    for (let i = 0; i < 5; i++) {
      const puddleX = (i * 180 + frameCount * 0.1) % width;
      ellipse(puddleX, height - 15, 40, 8);
    }
    
    // Umbrella for cat (if not frozen)
    if (!isFrozen && !isCold) {
      push();
      translate((width - CAT_WIDTH * PIXEL_SIZE) / 2 + CAT_WIDTH * PIXEL_SIZE / 2, height - CAT_HEIGHT * PIXEL_SIZE - 40);
      const umbrellaColor = [100, 150, 200];
      fill(umbrellaColor);
      triangle(-30, -50, 0, -80, 30, -50);
      fill([80, 80, 80]);
      rect(-2, -50, 4, 50);
      pop();
    }
  } else if (weatherCondition === 'cloudy') {
    // More clouds and darker - use fixed positions to prevent shivering
    // (clouds are already drawn, but we can add more)
    for (let i = 0; i < 3; i++) {
      const extraCloudX = (frameCount * 0.3 + i * 250) % (width + 200) - 100;
      const extraCloudY = 100 + i * 60; // Fixed y position
      const extraCloudType = (i % 3); // Fixed type based on index
      drawPixelCloud(extraCloudX, extraCloudY, extraCloudType, city.temperature, true);
    }
  } else if (weatherCondition === 'sunny') {
    // Bright sun (if not already drawn for beach)
    if (!isWarm) {
      fill(255, 255, 150);
      ellipse(width - 80, 80, 60, 60);
      fill(255, 255, 200);
      ellipse(width - 80, 80, 40, 40);
      // Sun rays
      stroke(255, 255, 150, 150);
      strokeWeight(3);
      for (let i = 0; i < 8; i++) {
        const angle = (i * PI / 4);
        const x1 = width - 80 + cos(angle) * 40;
        const y1 = 80 + sin(angle) * 40;
        const x2 = width - 80 + cos(angle) * 55;
        const y2 = 80 + sin(angle) * 55;
        line(x1, y1, x2, y2);
      }
      noStroke();
    }
  }
  
  // === BEACH SCENE FOR WARM WEATHER ===
  if (isWarm) {
    // Sand/beach ground
    const sandColor = [240, 220, 180];
    const sandDark = [220, 200, 160];
    noStroke();
    fill(sandColor);
    rect(0, height - 150, width, 150);
    
    // Sand texture
    fill(sandDark);
    for (let i = 0; i < 20; i++) {
      ellipse(random(width), height - 100 + random(50), 30, 15);
    }
    
    // Ocean water
    const waterColor = [100, 180, 255];
    fill(waterColor);
    rect(0, height - 200, width, 50);
    
    // Wave lines
    stroke(80, 160, 240);
    strokeWeight(2);
    for (let i = 0; i < 3; i++) {
      const waveY = height - 180 + i * 15;
      beginShape();
      for (let x = 0; x <= width; x += 20) {
        vertex(x, waveY + sin(x * 0.05 + frameCount * 0.1) * 5);
      }
      endShape();
    }
    noStroke();
    
    // Palm tree (left side)
    const treeColor = [100, 150, 80];
    const trunkColor = [150, 100, 50];
    fill(trunkColor);
    rect(50, height - 300, 20, 100);
    // Palm leaves
    fill(treeColor);
    ellipse(60, height - 300, 80, 40);
    ellipse(40, height - 320, 60, 30);
    ellipse(80, height - 320, 60, 30);
    ellipse(50, height - 340, 50, 25);
    ellipse(70, height - 340, 50, 25);
    
    // Sun
    fill(255, 255, 150);
    ellipse(width - 80, 80, 60, 60);
    fill(255, 255, 200);
    ellipse(width - 80, 80, 40, 40);
    
    // Beach umbrella (right side)
    const umbrellaColor = [255, 100, 100];
    fill(umbrellaColor);
    triangle(width - 150, height - 250, width - 100, height - 280, width - 50, height - 250);
    fill([200, 200, 200]);
    rect(width - 100, height - 250, 3, 50);
  }
  
  // Update and draw pixel clouds - completely stable movement
  // Use consistent speed multiplier for all clouds
  const cloudSpeed = 1.0; // Fixed speed multiplier
  
  // Clouds also get darker/stormier when cold and windy or cloudy
  const isStormy = city.temperature < 10 && city.windSpeed > 20;
  const isCloudyWeather = weatherCondition === 'cloudy' || weatherCondition === 'rainy';
  
  // Draw fewer clouds when sunny, more when cloudy
  const cloudsToShow = weatherCondition === 'sunny' ? clouds.slice(0, 2) : clouds;
  
  for (let cloud of cloudsToShow) {
    // Always lock y position to initialY - prevents any vertical movement
    cloud.y = cloud.initialY;
    
    // Move cloud horizontally only with fixed speed
    cloud.x += cloud.speed * cloudSpeed;
    
    // Wrap around - reset x position but keep y position locked
    if (cloud.x > width + 100) {
      cloud.x = -100;
      // y position remains locked to initialY
      cloud.y = cloud.initialY;
    }
    
    // Draw cloud (darker when cloudy/rainy)
    drawPixelCloud(cloud.x, cloud.y, cloud.type, city.temperature, isStormy || isCloudyWeather);
  }
  
  // Draw the cat at bottom of screen
  const catOffsetX = (width - CAT_WIDTH * PIXEL_SIZE) / 2;
  const catOffsetY = height - CAT_HEIGHT * PIXEL_SIZE - 40; // Bottom of screen
  
  drawCat(catOffsetX, catOffsetY, city.temperature, city.windSpeed, weatherCondition);
  
  // Display weather info
  fill(255);
  stroke(0);
  strokeWeight(2);
  textFont('Bitcount Single');
  textSize(28);
  textAlign(CENTER, TOP);
  text(city.name, width / 2, 30);
  
  noStroke();
  textSize(20);
  if (city.weatherLoaded) {
    let tempF = city.temperature * 9/5 + 32;
    text(`${city.temperature.toFixed(1)}C / ${tempF.toFixed(1)}F`, width / 2, 65);
    text(`Wind: ${city.windSpeed.toFixed(1)} km/h`, width / 2, 92);
    // Weather condition
    const conditionText = weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1);
    text(conditionText, width / 2, 119);
  } else {
    text('Loading weather...', width / 2, 65);
  }
}
