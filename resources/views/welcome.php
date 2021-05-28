<!DOCTYPE html>
<html>

<head>
    <title>Food Navigator</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fork-awesome@1.1.7/css/fork-awesome.min.css" integrity="sha256-gsmEoJAws/Kd3CjuOQzLie5Q3yshhvmo7YNtBG7aaEY=" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.68.0/dist/L.Control.Locate.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">

    <link rel="stylesheet" href="src/OverPassLayer.css" />
    <link rel="stylesheet" href="src/custom.css" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.68.0/src/L.Control.Locate.min.js"></script>
    <script src="https://openingh.openstreetmap.de/opening_hours.js/opening_hours+deps.min.js"></script>
    <script src="src/OverPassLayer.js"></script>
    <script src="src/DataParser.js"></script>
    <script src="js/hashes.min.js"></script>

    <!-- Theme Color -->
    <meta name="theme-color" content="#ffffff">

    <!-- Search Engine -->
    <meta name="description" content="Powered by Leaflet.js and OpenStreetMap Overpass API.">
    <meta name="image" content="https://reinhart1010.github.io/foodnavigator/src/images/logo-og.jpg">

    <!-- Schema.org for Google -->
    <meta itemprop="name" content="Food Navigator">
    <meta itemprop="description" content="Powered by Leaflet.js and OpenStreetMap Overpass API.">
    <meta itemprop="image" content="https://reinhart1010.github.io/foodnavigator/src/images/logo-og.jpg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Food Navigator">
    <meta name="twitter:description" content="Powered by Leaflet.js and OpenStreetMap Overpass API.">
    <meta name="twitter:image:src" content="https://reinhart1010.github.io/foodnavigator/src/images/logo-og.jpg">

    <!-- Open Graph general (Discord, Facebook, LINE, Pinterest, Skype & Slack) -->
    <meta name="og:title" content="Food Navigator">
    <meta name="og:description" content="Powered by Leaflet.js and OpenStreetMap Overpass API.">
    <meta name="og:image" content="https://reinhart1010.github.io/foodnavigator/src/images/logo-og.jpg">
    <meta name="og:url" content="https://reinhart1010.github.io/foodnavigator/">
    <meta name="og:locale" content="en_US">
    <meta name="og:type" content="website">
</head>

<body>
  <div id="map"></div>
  <div class="panel">
    <div class="card" id="details">
      <h2>Welcome!</h2>
      <p>Click on one of the places to view its details.</p>
    </div>
    <div class="card">
      <h2>Visible Places</h2>
      <ul id="nearby">Loading...</ul>
    </div>
  </div>
  <script>
      var attr_osm = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
          attr_overpass = 'POI via <a href="https://www.overpass-api.de">Overpass API</a>';
      var osm = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: [attr_osm, attr_overpass].join(', ')
      });

      var map = new L.Map('map', {zoomControl: false}).addLayer(osm).setView(new L.LatLng(-6.20049,106.78517), 19);

      var opl = new L.OverPassLayer({
          debug: true,
          endPoint: 'https://lz4.overpass-api.de/api/',
          query: '(node["amenity"~"restaurant|fast_food|cafe|kiosk|food_court|ice_cream"]({{bbox}});way["amenity"~"restaurant|fast_food|cafe|kiosk|food_court|ice_cream"]({{bbox}});node["shop"~"pastry|bakery|tea|convenience|supermarket"]({{bbox}});way["shop"~"pastry|bakery|tea|convenience|supermarket"]({{bbox}}););out center;',
          minZoomIndicatorOptions: {
              position: 'topright',
              minZoomMessage: 'Current zoom level: CURRENTZOOM - All data at level: MINZOOMLEVEL'
          }
      });
      map.addLayer(opl);
      L.control.locate({position: 'topright'}).addTo(map);
      L.control.zoom({position:'topright'}).addTo(map);
      map.on('zoomend', function() {
        getNearby();
      });
      map.on('moveend', function() {
        getNearby();
      });
      var marker = new L.Marker([-1, -1]);
      marker.addTo(map);

      function closeAllPopups(){
        map.closePopup();
      }
  </script>
</body>

</html>
