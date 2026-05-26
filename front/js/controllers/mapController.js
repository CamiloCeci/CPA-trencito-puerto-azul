var map = L.map('mapa').setView([10.620619, -66.744524], 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy: <a href="http://www.openstreetmap.org/copyright"<OpenStreetMap</a> contributors'
}).addTo(map);

var marker = L.marker([10.620619, -66.744524]).addTo(map);

marker.bindPopup("<b>Club Puerto Azul<b/>").openPopup();
