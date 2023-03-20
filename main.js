const map = new ol.Map({
  layers: [],
  target: "map",
  view: new ol.View({
    // center: ol.proj.transform([-74, 40], "EPSG:4617", "EPSG:4326"),
    center: ol.proj.fromLonLat([29.382269692080797, 27.82503961612639]),
    zoom: 5,
  }),
});
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  layerName: "OSM",
});
const stadiamap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
  }),
  layerName: "Stad",
  visible: false,
});

// console.log(OSM);
const group = new ol.layer.Group({
  layers: [osm, stadiamap],
});

const swither = document.querySelectorAll("input");
swither.forEach((swith) => {
  swith.addEventListener("click", (e) => {
    const name = e.target.id;
    group.getLayers().forEach((LL) => {
      if (name === LL.get("layerName")) {
        LL.setVisible(true);
      } else {
        LL.setVisible(false);
      }
    });
  });
});

const vectorLayer = new ol.layer.Vector({
  // background: "#1a2b39",
  source: new ol.source.Vector({
    url: "https://geowebservices.stanford.edu/geoserver/wfs?request=getFeature&outputformat=application/json&typeName=druid:vn895fq9113",
    format: new ol.format.GeoJSON(),
  }),
  style: new ol.style.Style({
    fill: new ol.style.Fill({ color: "#84ace0" }),
    stroke: new ol.style.Stroke({ color: "#34eb7a", width: 1 }),
  }),
});
// const NYCstre = new ol.layer.Tile({
source: new ol.source.TileWMS({
  url: "http://localhost:5005/geoserver/Egypt/nyc_streets/ows",
  params: { LAYERS: "nyc_streets", TILED: true },
  serverType: "geoserver",
  // Countries have transparency, so do not fade tiles:
  transition: 0,
});
// const NYCstat = new ol.layer.Tile({
//   source: new ol.source.TileWMS({
//     url: "http://localhost:5005/geoserver/Egypt/nyc_subway_stations/ows",
//     params: { LAYERS: "nyc_subway_stations", TILED: true },
//     serverType: "geoserver",
//     // Countries have transparency, so do not fade tiles:
//     transition: 0,
//   }),
// });
let drawB = document.getElementById("Mes");
let Mestype = document.getElementById("selector");
let drawtype = "Point";
let DrawIsOn = false;
let DrawInteraction;
const drowLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
});

drawB.addEventListener("click", (e) => {
  if (!DrawIsOn) {
    DrawInteraction = NewInteraction(drawtype);
    map.addInteraction(DrawInteraction);

    drawB.style.backgroundColor = "rgb(19, 148, 64)";
    DrawIsOn = true;
  } else {
    map.removeInteraction(DrawInteraction);
    drawB.style.backgroundColor = "rgb(247, 252, 249)";
    DrawIsOn = false;
  }
});
Mestype.addEventListener("change", (e) => {
  drawtype = e.target.value;
  if (DrawIsOn) {
    map.removeInteraction(DrawInteraction);
    DrawInteraction = NewInteraction(drawtype);
    map.addInteraction(DrawInteraction);
  }
});

const popup = new ol.Overlay({
  element: document.getElementById("popup"),
});
let output;
const formatLength = function (line) {
  if (line > 100) {
    output = Math.round((line / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(line * 100) / 100 + " " + "m";
  }
  return output;
};

const formatArea = function (polygon) {
  let output;
  if (polygon > 10000) {
    output =
      Math.round((polygon / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
  } else {
    output = Math.round(polygon * 100) / 100 + " " + "m<sup>2</sup>";
  }
  return output;
};

let Pcoord;
function NewInteraction(drawtype) {
  let newinter = new ol.interaction.Draw({
    type: drawtype,
    source: drowLayer.getSource(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(0, 0, 0, 0.5)",
        lineDash: [10, 10],
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0.7)",
        }),
        fill: new ol.style.Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
      }),
    }),
  });
  newinter.on("drawend", function (e) {
    if (e.feature.getGeometry() instanceof ol.geom.Point) {
      Pcoord = e.feature.getGeometry().flatCoordinates;
      // console.log(Pcoord);
      Pcoord = [parseInt(Pcoord[0]), parseInt(Pcoord[1])];
      const content = `<p>Coordinates: ${Pcoord}</p>`;
      popup.setPosition(Pcoord);
      popup.getElement().innerHTML = content;
    } else if (e.feature.getGeometry() instanceof ol.geom.LineString) {
      // console.log(e.feature.getGeometry().getLastCoordinate());
      output = formatLength(e.feature.getGeometry().getLength());
      popup.setPosition(e.feature.getGeometry().getLastCoordinate());
      popup.getElement().innerHTML = output;
    } else {
      output = formatArea(e.feature.getGeometry().getArea());
      popup.setPosition(
        e.feature.getGeometry().getInteriorPoint().getCoordinates()
      );
      popup.getElement().innerHTML = output;
    }
  });
  return newinter;
}


map.addLayer(osm);
map.addLayer(stadiamap);
// map.addLayer(NYCneig);
map.addOverlay(popup);
map.addLayer(vectorLayer);
map.addLayer(drowLayer);
