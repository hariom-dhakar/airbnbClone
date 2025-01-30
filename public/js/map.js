mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: coordinates,
  zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker({
  color: "#FF5733",
})
  .setLngLat(coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h5>exact location will be provided after booking</h5>`))
  .addTo(map);
