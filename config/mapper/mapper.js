var NodeGeocoder = require('node-geocoder');
const maps_api_key = 'AIzaSyBTFcbros0cp5ZPj4Fg0eKvp8P1liXV0Ms';

const options = {
  provider: 'google',
  // Optional depending on the providers
  //fetch: customFetchImplementation,
  apiKey: maps_api_key, // Google
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

function successCallback(result) {
  console.log('<<<<<TAGGER>>>>');
  console.log('Location Found: ');
  console.log(result);
  console.log('<<<<<TAGGER>>>>');
  return result;
}

function failureCallback(error) {
  console.log('<<<<<TAGGER>>>>');
  console.error('Location not found.' + error);
  console.log('<<<<<TAGGER>>>>');
  return false;
}
