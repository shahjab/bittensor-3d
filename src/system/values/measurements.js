/**
 * Measurements from Wikipedia.
 * https://en.wikipedia.org/wiki/Solar_System
*/

const distanceFromSunOfMercury = 87910000 //km
const distanceFromSunOfVenus = 108200000 //km
const distanceFromSunOfEarth = 149600000 //km
const distanceFromSunOfMars = 227940000 //km
const distanceFromSunOfJupiter = 778330000 //km
const distanceFromSunOfSaturn = 1429400000 //km
const distanceFromSunOfUranus = 2870990000 //km
const distanceFromSunOfNeptune = 4504000000 //km

const diameterSun = 1391000 //km
const diameterMercury = 4880 //km
const diameterVenus = 12104 //km
const diameterEarth = 12756 //km
const diameterMars = 6794 //km
const diameterJupiter = 142984 //km
const diameterSaturn = 120536 //km
const diameterUranus = 51118 //km
const diameterNeptune = 49532 //km

const radiusSun = diameterSun / 2 //km
const radiusMercury = diameterMercury / 2 //km
const radiusVenus = diameterVenus / 2 //km
const radiusEarth = diameterEarth / 2 //km
const radiusMars = diameterMars / 2 //km
const radiusJupiter = diameterJupiter / 2 //km
const radiusSaturn = diameterSaturn / 2 //km
const radiusUranus = diameterUranus / 2 //km
const radiusNeptune = diameterNeptune / 2 //km

/**
 * Relative sizes for reference in 3-D Canvas
*/

const relativeConstant = 20;

const relativeConstantForPlanetSize = relativeConstant ** 2;

const relativeConstantForDistance = relativeConstant * 0.01;

export const sizeSun = (radiusSun / radiusSun) * relativeConstant;
export const sizeMercury = (radiusMercury / radiusSun) * relativeConstantForPlanetSize;
export const sizeVenus = (radiusVenus / radiusSun) * relativeConstantForPlanetSize;
export const sizeEarth = (radiusEarth / radiusSun) * relativeConstantForPlanetSize;
export const sizeMars = (radiusMars / radiusSun) * relativeConstantForPlanetSize;
export const sizeJupiter = (radiusJupiter / radiusSun) * relativeConstantForPlanetSize / 2; //Otherwise looks as big as the sun
export const sizeSaturn = (radiusSaturn / radiusSun) * relativeConstantForPlanetSize / 2; //Otherwise looks as big as the sun
export const sizeUranus = (radiusUranus / radiusSun) * relativeConstantForPlanetSize;
export const sizeNeptune = (radiusNeptune / radiusSun) * relativeConstantForPlanetSize;

export const distSunMercury = (distanceFromSunOfMercury / radiusSun) * relativeConstantForDistance;
export const distSunVenus = (distanceFromSunOfVenus / radiusSun) * relativeConstantForDistance;
export const distSunEarth = (distanceFromSunOfEarth / radiusSun) * relativeConstantForDistance;
export const distSunMars = (distanceFromSunOfMars / radiusSun) * relativeConstantForDistance;
export const distSunJupiter = (distanceFromSunOfJupiter / radiusSun) * relativeConstantForDistance / 2.2; //Otherwise too for away for the presentation
export const distSunSaturn = (distanceFromSunOfSaturn / radiusSun) * relativeConstantForDistance / 2.5; //Otherwise too for away for the presentation
export const distSunUranus = (distanceFromSunOfUranus / radiusSun) * relativeConstantForDistance / 3.8; //Otherwise too for away for the presentation
export const distSunNeptune = (distanceFromSunOfNeptune / radiusSun) * relativeConstantForDistance / 5; //Otherwise too for away for the presentation

/**
 * Data from: https://spaceplace.nasa.gov/years-on-other-planets/en/
 * Orbiting speeds
*/

const yearForMercury = 88 // days
const yearForVenus = 225 // days
const yearForEarth = 365 // days
const yearForMars = 687 // days
const yearForJupiter = 4333 // days
const yearForSaturn = 10759 // days
const yearForUranus = 30687 // days
const yearForNeptune = 60190 // days

export const speedMercury = (1 / (yearForMercury / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedVenus = (1 / (yearForVenus / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedEarth = (1 / (yearForEarth / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedMars = (1 / (yearForMars / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedJupiter = (1 / (yearForJupiter / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedSaturn = (1 / (yearForSaturn / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedUranus = (1 / (yearForUranus / yearForEarth)) / (1 / (yearForMercury / yearForEarth))
export const speedNeptune = (1 / (yearForNeptune / yearForEarth)) / (1 / (yearForMercury / yearForEarth))