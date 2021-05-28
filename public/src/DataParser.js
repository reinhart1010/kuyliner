var pois = [];
let deltalat = 0;
let emojilist = [
  {
    key: "opening_hours",
    value: "24/7",
    emoji: "<img src='https://img.shields.io/badge/24/7-262626'>",
    description: "Opens 24/7"
  },
  {
    key: "reservation",
    value: true,
    emoji: "&#x1F4D6;",
    description: "Reservation Available"
  },
  {
    key: "reservation",
    value: "recommended",
    emoji: "&#x1F535;&#x1F4D6;",
    description: "Reservation Recommended"
  },
  {
    key: "wheelchair",
    value: "yes",
    emoji: "&#x267F;",
    description: "Unrestricted Wheelchair Access"
  },
  {
    key: "wheelchair",
    value: "dedicated",
    emoji: "&#x267F;",
    description: "Dedicated Wheelchair Facilities"
  },
  {
    key: "toilets",
    value: "yes",
    emoji: "&#x1F6BB;",
    description: "Toilets Available"
  },
  {
    key: "internet_access",
    value: "wlan",
    emoji: "&#x1F4F6;",
    description: "Wi-Fi/WLAN Access Available"
  },
  {
    key: "internet_access",
    value: "terminal",
    emoji: "&#x1F5A5;",
    description: "Internet Access Available via Terminals"
  },
  {
    key: "smoking",
    value: "no",
    emoji: "&#x1F6AD;",
    description: "No Smoking Inside"
  },
  {
    key: "outdoor_seating",
    value: "yes",
    emoji: "&#x26F1;&#xFE0F;",
    description: "Outdoor Seating Available"
  },
  {
    key: "takeaway",
    value: true,
    emoji: "&#x1F961;",
    description: "Takeaway Available"
  },
  {
    key: "drive_through",
    value: "yes",
    emoji: "&#x1F697;",
    description: "Drive-Thru Available"
  },
  {
    key: "delivery",
    value: true,
    emoji: "&#x1F6F5;",
    description: "Local Delivery Available"
  },
  {
    key: "delivery:gofood",
    value: true,
    emoji: "<img src='https://img.shields.io/badge/GoFood-ed2736'>",
    description: "GoFood Delivery Available"
  },
  {
    key: "delivery:grabfood",
    value: true,
    emoji: "<img src='https://img.shields.io/badge/GrabFood-22b251'>",
    description: "GrabFood Delivery Available"
  }
];

function addToNearby(data){
  pois.push(data);
};

function getNearby(){
  document.getElementById("nearby").innerHTML = "";
  let i, bbox = map.getBounds();
  deltalat = map.getBounds()._northEast.lat - map.getBounds()._southWest.lat
  for (i = 0; i < pois.length; i++){
    let el = pois[i], lat, lon;
    el.type == "node" ? lat = el.lat : lat = el.center.lat;
    el.type == "node" ? lon = el.lon : lon = el.center.lon;
    if (lat >= bbox._southWest.lat && lat <= bbox._northEast.lat && lon >= bbox._southWest.lng && lon <= bbox._northEast.lng){
      document.getElementById("nearby").innerHTML += "<li onclick=\'parseRewrite(\"" + el.type + "\",\"" + el.id + "\")\'><h3><i class='bi " + getIcon(el.tags.amenity || el.tags.shop) + "' style='color: " + getColor(el.tags.name || el.tags["name:en"]) + "'></i> " + (el.tags.name || el.tags["name:en"]) + "</h3><p>" + decodeKeyValue(el.tags.amenity || el.tags.shop) + getEmoji(el, true) + "</p></li>";
    };
  }
}

function parseRewrite(type, id){
  window.scrollTo(0, 0);
  console.log(type + " " + id);
  let i, obj = {};
  for (i = 0; i < pois.length; i++) if (pois[i].type == type && pois[i].id == id) obj = pois[i];
  let name = obj.tags.name || obj.tags["name:en"],
      lat = obj.lat || obj.center.lat,
      lon = obj.lon || obj.center.lon;

  var lon1;
  (window.innerWidth > 1007) ? lon1 = lon - 392 / window.innerWidth * deltalat : lon1 = lon;
  marker.setLatLng(new L.LatLng(lat, lon));
  map.setView(new L.LatLng(lat, lon1),map.getZoom());

  let initstring =
    "<h2><i class='bi " + getIcon(obj.tags.amenity || obj.tags.shop) + "' style='color: " + getColor(obj.tags.name || obj.tags["name:en"]) + "'></i> " + name + "</h2>" +
    "<p><b>" + decodeKeyValue(obj.tags.amenity || obj.tags.shop) + "</b>" + formatValue(null, obj.tags.brand, " &#x2022; part of <b>", "</b> brand") + "</p>" +
    formatValue(null, obj.tags.operator, "<p>Operated by <b>", "</b></p>") +
    formatValue(null, formatOpeningHours(obj.tags.opening_hours, true), "<p>", "</p>")
  ;

  // Detect conditional GoFood and GrabFood opening hours
  initstring += "<ul>"
  if (exists(obj.tags["delivery:gofood"]) && obj.tags["delivery:gofood"] !== "no" && obj.tags["delivery:gofood"] !== "yes") initstring += formatValue(null, formatOpeningHours(obj.tags["delivery:gofood"], false), "<li>GoFood: ", "</li>");
  if (exists(obj.tags["delivery:grabfood"]) && obj.tags["delivery:grabfood"] !== "no" && obj.tags["delivery:grabfood"] !== "yes") initstring += formatValue(null, formatOpeningHours(obj.tags["delivery:grabfood"], false), "<li>GrabFood: ", "</li>");
  initstring += "</ul>"

  // Detect whether smoking is not allowed
  if (exists(obj.tags.smoking) && obj.tags.smoking === "no") initstring += "<p>&#x1F6AD; No Smoking Allowed</p>";

  initstring += formatValue(null, formatValue(null, obj.tags["addr:street"], null, " ") + formatValue(null, obj.tags["addr:housenumber"], "No.", " ") + formatValue(null, obj.tags["addr:city"], "<br>", " ") + formatValue(null, obj.tags["addr:postcode"], null, null), "<h3>Address</h3><p>", "</p>") +
    formatValue(null, obj.tags.description, "<p>", "</p>") +
    formatValue(null, obj.tags.notes, "<h3>Notes</h3><p>", "</p>")
  ;

  var data = {
    name: obj.tags.name || obj.tags["name:en"],
    lat: obj.lat || obj.center.lat,
    lon: obj.lon || obj.center.lon,
    zoom: 19,
    data: {
      osm: {
        type: obj.type,
        id: obj.id
      },
      facilities: [
        {key: "Air Conditioning", value: isYes(obj, "air_conditioning")},
        {key: "Baby Changing Table", value: isYes(obj, "changing_table")},
        {key: "&#x1F6F5; Delivery", value: isYes(obj, "delivery")},
        {key: "&#x1F6F5; Delivery via GoFood", value: isYes(obj, "delivery:gofood")},
        {key: "&#x1F6F5; Delivery via GrabFood", value: isYes(obj, "delivery:grabfood")},
        {key: "&#x1F697; Drive Through", value: isYes(obj, "drive_through")},
        {key: "&#x1F4F6; Internet Access", value: isYes(obj, "internet_access")},
        {key: "&#x26F1;&#xFE0F; Outdoor Seating", value: isYes(obj, "outdoor_seating")},
        {key: "&#x1F961; Take Away", value: isYes(obj, "takeaway")},
        {key: "&#x1F6BB; Toilets", value: isYes(obj, "toilets")},
        {key: "&#x267F; Wheelchair Access", value: isYes(obj, "wheelchair")},
        {key: "&#x267F; &#x1F6BB; Wheelchair-Accessible Toilets", value: isYes(obj, "toilets:wheelchair")}
      ],
      payments: [
        {key: "&#x1F4B5; Cash (Notes)", value: isYes(obj, "payment:cash") || isYes(obj, "payment:notes")},
        {key: "&#x1F4B5; Cash (Coins)", value: isYes(obj, "payment:cash") || isYes(obj, "payment:coins")},
        {key: "&#x1F4B3; Debit Cards", value: isYes(obj, "payment:gpn_debit") || isYes(obj, "payment:maestro") || isYes(obj, "payment:visa_debit") || isYes(obj, "payment:visa_electron")},
        {key: "&#x1F4B3; Credit Cards", value: isYes(obj, "payment:jcb") || isYes(obj, "payment:mastercard") || isYes(obj, "payment:unionpay") || isYes(obj, "payment:visa")},
        {key: "&#x1F4B3; BRI BRIZZI", value: isYes(obj, "payment:ep_brizzi") || isYes(obj, "payment:id_brizzi")},
        {key: "&#x1F4B3; BCA Flazz", value: isYes(obj, "payment:ep_flazz") || isYes(obj, "payment:id_flazz")},
        {key: "&#x1F4B3; Mandiri e-money", value: isYes(obj, "payment:ep_mandiri_emoney") || isYes(obj, "payment:id_mandiri_emoney")},
        {key: "&#x1F4B3; BNI TapCash", value: isYes(obj, "payment:ep_tapcash") || isYes(obj, "payment:id_tapcash")},
        {key: "&#x1F4F1; Cashbac", value: isYes(obj, "payment:cashbac") || isYes(obj, "payment:id_cashbac")},
        {key: "&#x1F4F1; DANA", value: isYes(obj, "payment:dana") || isYes(obj, "payment:id_dana") || isYes(obj, "payment:samsung_pay")},
        {key: "&#x1F4F1; GoPay", value: isYes(obj, "payment:gopay_id") || isYes(obj, "payment:id_gopay")},
        {key: "&#x1F4F1; i.saku", value: isYes(obj, "payment:isaku") || isYes(obj, "payment:id_isaku")},
        {key: "&#x1F4F1; LinkAja", value: isYes(obj, "payment:linkaja") || isYes(obj, "payment:id_linkaja") || isYes(obj, "payment:id_linkaja_scan")},
        {key: "&#x1F4F1; OVO", value: isYes(obj, "payment:ovo") || isYes(obj, "payment:id_ovo") || isYes(obj, "payment:grabpay")},
        {key: "&#x1F4F1; Sakuku", value: isYes(obj, "payment:sakuku") || isYes(obj, "payment:id_sakuku")},
        {key: "&#x1F4F1; YUKK", value: isYes(obj, "payment:yukk") || isYes(obj, "payment:yukk")},
        {key: "&#x1F4F1; GPN QRIS", value: isYes(obj, "gpn_qris")}
      ],
      about: [
        {key: "Wikidata", value: obj.tags["brand:wikidata"]},
        {key: "Phone", value: obj.tags["phone"]},
        {key: "Email", value: obj.tags["email"]},
        {key: "Website", value: obj.tags["brand:website"] || obj.tags["website"]}
      ],
      building: obj.tags["building"],
      level: obj.tags["level"],
      opening_hours: obj.tags["opening_hours"],
    },
    maps: [
      {
        name: "OpenStreetMap",
        icon: "src/images/maps/openstreetmap.png",
        mask: true,
        background: "#99b69d",
        color: "#000000",
        osmType: "way",
        osmId: "153306200",
        url: "https://www.openstreetmap.org/%osmtype/%osmid"
      },
      {
        name: "GoFood",
        icon: "src/images/maps/gofood.jpg",
        mask: false,
        background: "#ed2736",
        color: "#ffffff",
        exclusives: ["Android", "iOS"],
        url: obj.tags[obj, "delivery:gofood:ref"] || null
      },
      {
        name: "GrabFood",
        icon: "src/images/maps/grabfood.png",
        mask: false,
        background: "#22b251",
        color: "#ffffff",
        url: obj.tags[obj, "delivery:grabfood:ref"] || null
      },
      {
        name: "Win10 Maps",
        icon: "src/images/maps/win10maps.jpg",
        mask: false,
        background: "#0078d7",
        color: "#ffffff",
        exclusives: ["Windows"],
        url: "bingmaps:?collection=point.%lat_%lon_%name&lvl=%zoom"
      },
      {
        name: "Apple Maps",
        icon: "src/images/maps/applemaps.png",
        mask: true,
        background: "#313131",
        color: "#ffffff",
        exclusives: ["MacOS", "iOS"],
        url: "https://maps.apple.com/?ll=%lat,%lon&q=%name&sll=%lat,%lon&z=%zoom&t=s"
      },
      {
        name: "GNOME Maps",
        icon: "src/images/maps/gnomemaps.png",
        mask: true,
        background: "#8ff0a4",
        color: "#000000",
        exclusives: ["Linux"],
        url: "geo:%lat,%lon"
      },
      {
        name: "Google Maps",
        icon: "src/images/maps/googlemaps.png",
        mask: true,
        background: "#f1f1f1",
        color: "#000000",
        url: "https://maps.google.com/?ll=%lat,%lon&q=%name&sll=%lat,%lon&z=%zoom&t=s"
      },
      {
        name: "Waze",
        icon: "src/images/maps/waze.png",
        mask: false,
        background: "#62d2eb",
        color: "#486067",
        url: "https://waze.com/ul?q=%name&ll=%lat,%lon"
      },
      {
        name: "OsmAnd",
        icon: "src/images/maps/osmand.png",
        mask: false,
        background: "#f0f0f0",
        color: "#000000",
        exclusives: ["Android", "iOS"],
        url: "https://osmand.net/go.html?lat=%lat&lon=%lon&z=%zoom"
      },
      {
        name: "Bing Maps",
        icon: "src/images/maps/bing.png",
        mask: true,
        background: "#ffffff",
        color: "#00809d",
        exclusives: ["Linux", "MacOS", "Windows"],
        url: "https://www.bing.com/maps?where1=%name&cp=%lat~%lon&lvl=%zoom"
      },
      {
        name: "HERE WeGo",
        icon: "src/images/maps/herewego.jpg",
        mask: false,
        background: "#292d38",
        color: "#ffffff",
        url: "https://share.here.com/l/%lat,%lon,%name?&z=%zoom&p=yes"
      },
      {
        name: "More...",
        icon: "src/images/maps/more.png",
        mask: true,
        background: "#ffff00",
        color: "#ffffff",
        exclusives: ["Android", "Linux", "macOS", "Windows"],
        url: "geo:%lat,%lon?q=%lat,%lon(%name)"
      },
      {
        name: "More...",
        icon: "src/images/maps/more.png",
        mask: true,
        background: "#ffff00",
        color: "#ffffff",
        exclusives: ["iOS"],
        url: "maps://?q=%lat,%lon(%name)"
      }
    ]
  };
  initstring += detectFacilities(data);
  initstring += detectPayments(data);
  initstring += detectAbout(data);
  initstring += "<h4>Open With...</a><h4><div class='menutilecontainer'>";

  for (i = 0; i < data.maps.length; i++){
    let map = data.maps[i];
    let url = map.url;
    if (url !== null){
      url = decodeParams(url, data);
      if(map.exclusives && map.exclusives.length > 0){
        let j;
        for (j = 0; j < map.exclusives.length; j++){
          if (testUA(map.exclusives[j]) === true){
            initstring += appendList(map.name, url, map.icon, map.mask, map.color, map.background);
          }
        }
      } else {
        initstring += appendList(map.name, url, map.icon, map.mask, map.color, map.background);
      }
    }
  }

  initstring += "</div>";

  document.getElementById("details").innerHTML = initstring;
}

function decodeParams(string, data){
  return string.replace("%zoom", data.zoom)
  .replace("%osmtype", data.data.osm.type)
  .replace("%osmid", data.data.osm.id)
  .replace("%lat", data.lat)
  .replace("%lon", data.lon)
  .replace("%lat", data.lat) //allow duplicate latlong parameters
  .replace("%long", data.long)
  .replace("%name", encodeURIComponent(data.name))
  .replace("%20", "+");
}

function detectFacilities(data){
  let available = false;
  let result;
  let i, j = 0;
  for (i = 0; i < data.data.facilities.length; i++){
    if (data.data.facilities[i].value == true){
      if (j == 0){
        result = "<h3>Facilities</h3><ul>";
        j++
      };
      available = true;
      result += "<li>" + data.data.facilities[i].key + "</li>";
    }
  }
  if (available == true){
    result += "</ul>"
    return result;
  } else {
    return "";
  }
}

function detectPayments(data){
  let available = false;
  let result;
  let i, j = 0;
  for (i = 0; i < data.data.payments.length; i++){
    if (data.data.payments[i].value == true){
      if (j == 0){
        result = "<h3>Accepting Payments</h3><ul>";
        j++
      };
      available = true;
      result += "<li>" + data.data.payments[i].key + "</li>";
    }
  }
  if (available == true){
    result += "</ul>"
    return result;
  } else {
    return "";
  }
}

function detectAbout(data){
  let available = false;
  let result;
  let i, j = 0;
  for (i = 0; i < data.data.about.length; i++){
    if (data.data.about[i].value != null){
      if (j == 0){
        result = "<h3>Contact</h3><ul>";
        j++
      };
      available = true;
      result += "<li>" + data.data.about[i].key + ": " + formatValue(data.data.about[i].key, data.data.about[i].value) + "</li>";
    }
  }
  if (available == true){
    result += "</ul>"
    return result;
  } else {
    return "";
  }
}

function formatValue(key, value, prepend, append){
  var result = "";
  if (exists(value)){
    if (exists(prepend)) result += prepend;
    switch (key){
      case "Wikidata": result += "<a href='https://www.wikidata.org/wiki/" + value + "' target='_blank'>" + value + "</a>"; break;
      case "Phone": result += "<a href='tel:" + value + "' target='_blank'>" + value + "</a>"; break;
      case "Email": result += "<a href='mailto:" + value + "' target='_blank'>" + value + "</a>"; break;
      case "Website": result += "<a href='" + value + "' target='_blank'>" + value + "</a>"; break;
      default: result += value;
    if (exists(append))result += append;
    }
  } else {result = ""};
  return result;
}

function formatOpeningHours(value, inline){
  let res = "";
  if (exists(value)){
    oh = new opening_hours(value, null, {'locale': 'en'});
    (oh.getState()) ? res = "Open" : res = "Closed";
    if (inline === false){
      return "<b>" + res + "</b><br>opens " + oh.prettifyValue();
    } else {
      return "<b>" + res + "</b> &#x2022; opens " + oh.prettifyValue();
    }
  }
}

function exists(exp){
  return (exp !== null && exp !== undefined && exp !== "");
}

function parseOsmData(obj, col){
  var fillColor = col || "#ff0000";
  var initstring = "<h2 style='color:" + fillColor + "'>" + (obj.tags.name || obj.tags["name:en"]) + "</h2>";
  initstring += "<h3>" + decodeKeyValue(obj.tags.amenity || obj.tags.shop) + getEmoji(obj, true) + "</h3>";
  initstring += "<button onclick=\'closeAllPopups();parseRewrite(\"" + obj.type + "\",\"" + obj.id + "\");\'>Show Details...</button>";
  return initstring;
}

function decodeKeyValue(str){
  return str.replace("_", " ");
}

function getIcon(str){
  switch (str){
    case "cafe": return "bi-cup-straw";
    case "convenience": return "bi-basket-fill";
    case "supermarket": return "bi-cart-fill"
    default: return "bi-geo-fill";
  }
}

function getEmoji(obj, space){
  let result = "", data = obj.tags;
  if (space === true) result += " ";

  let i;
  for (i = 0; i < emojilist.length; i++){
    if((obj.tags[emojilist[i].key] === emojilist[i].value) || (obj.tags[emojilist[i].key] != null && obj.tags[emojilist[i].key] != "no") && emojilist[i].value == true){
      result += "<span title='" + emojilist[i].description + "' aria-label='" + emojilist[i].description + "'>" + emojilist[i].emoji + "</span>";
      if (i < emojilist.length - 1 || space == true) result += " ";
    }
  }
  return result;
}

function isYes(obj, tag){
  return (obj.tags[tag] && (obj.tags[tag] == "yes" || (tag == "takeaway" && obj.tags[tag] == "only") || ((tag == "toilets:wheelchair" || tag == "wheelchair") && obj.tags[tag] == "dedicated") || (tag == "internet_access" && obj.tags[tag] != "no"))) ? true : false;
}

function appendList(string, url, icon, masked, foreground, background){
  let mask = "";
  if (masked === true){mask = "masked";}
  return "<div class='menutile' style='color:" + foreground + ";background-color:" + background + "'><a href='" + url + "' target='_blank' style='color:" + foreground + "'><img src='" + icon + "' alt='" + string + "' class='" + mask + "'><br><p>" + string + "</p></a></div>";
}

function toggle(id, display){
  let object = document.getElementById(id);
  let state = display || "block";
  if (object.style.display === "none"){
    object.style.display = state;
  } else {
    object.style.display = "none";
  }
}

function testUA(string){
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macOSStrings = ['Macintosh', 'MacOS'];
  const iOSStrings = ['iPhone', 'iPad', 'iPod'];
  const WindowsStrings = ['Win32', 'Win64', 'Windows'];
  let os;
  if (macOSStrings.indexOf(platform) !== -1) {
    os = 'MacOS';
  } else if (iOSStrings.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (WindowsStrings.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }
  return os === string ? true : false;
}

function randomColor(){
  const colors = ["#008cff", "#0d48f7", "#8103c8", "#ac00a7", "#f23221", "#fb582e", "#f7bd0d", "#7cd140", "#00be55", "#008986", "#1aabfe", "#d88c24", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f39c12", "#d35400", "#c0392b"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getColor(string){
  var hash = new Hashes.MD5().hex(string);
  var h = Math.floor(parseInt("0x" + hash.substr(0,2)) / 256 * 360);
  var s = 75 + Math.floor(parseInt("0x" + hash.substr(2,2)) / 256 * 25);
  var l = 30 + Math.floor(parseInt("0x" + hash.substr(4,2))  / 256 * 20);

  return "hsl(" + h + "," + s + "%," + l + "%)";
}
