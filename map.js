mapboxgl.accessToken = 'pk.eyJ1IjoibWFzY2ljbG8iLCJhIjoiY2ttcnp6eWNuMGQydTJvcGYzeGVsd2RqbSJ9.YqyHFex6gmdhgJoICN_V9A';
var map;
var evaluacionCategories = {
  'Ciclovía Reprobada':'red',
  'Ciclovía Aprobada':'darkgreen', 
  'Cruce Aprobado':'orange',
  'Cruce Reprobado':'lightgreen', 
};

var tipologiaCategories = {
  'Ciclovía sobre calzada':'red',
  'Ciclovía sobre platabanda':'blue',
  'Ciclovía sobre bandejón':'orange', 
  'Ciclovía sobre parque':'green',
  'Ciclovía sobre vereda':'indigo',
  'Ciclovereda':'violet',
};


$(document).ready(function(){
  var popup;
  map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/masciclo/ckpw5ezqw57xa17mej6wlk7r9', // style URL
    center: [-70.6518120833, -33.44807677931364], // starting position [lng, lat]
    zoom: 10 // starting zoom
  });
  
  map.on("load",()=>{
    console.log("map loading")
    // add map layers
    map.addSource('evaluacion', {
      type:'vector',
      url:'mapbox://masciclo.5wkgbrba'
    });

    map.addLayer({
      'id':'evaluacion',
      'source':'evaluacion',
      'source-layer':'evaluacion-drd8qy',
      'type':'line',
      'paint':{
        'line-width':2,
        'line-color':[
          'match',
          ['get', 'Evaluació'],
          'Ciclovía reprobada',
          'red',
          'Ciclovía aprobada',
          'darkgreen', 
          'Cruce aprobado',
          'orange',
          'Cruce reprobado',
          'lightgreen', 
          'transparent'
        ]
      },
      'layout':{
        'visibility':'none'
      }
    });

    map.addSource('tipologia', {
      type:'vector',
      url:'mapbox://masciclo.ds5x425g'
    });

    map.addLayer({
      'id':'tipologia',
      'source':'tipologia',
      'source-layer':'tipologia-a9tvmr',
      'type':'line',
      'paint':{
        'line-width':2,
        'line-color':[
          'match',
          ['get', 'Tipología'],
          'Ciclovía sobre calzada',
          'red',
          'Ciclovía sobre platabanda',
          'blue',
          'Ciclovía sobre bandejón',
          'orange', 
          'Ciclovía sobre parque',
          'green',
          'Ciclovía sobre vereda',
          'indigo',
          'Ciclovereda',
          'violet',
          'transparent'
        ]
      },
      'layout':{
        'visibility':'none'
      }
    });

    // Add the control to the map.
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      }),
      'top-left'
    );

    // Initial la
    setLayout($('#quality-ciclo-switch')[0].checked, 'quality-ciclo');
    setLayout($('#typology-ciclo-switch')[0].checked, 'typology-ciclo');
    setLayout($('#errors-ciclo-switch')[0].checked, 'errors-ciclo');
    
    
    $('#quality-ciclo-switch').on('change.bootstrapSwitch', function (e) {
      setLayout(e.target.checked, 'quality-ciclo')
    });
    
    $('#typology-ciclo-switch').on('change.bootstrapSwitch', function (e) {
      setLayout(e.target.checked, 'typology-ciclo')
    });
    
    $('#errors-ciclo-switch').on('change.bootstrapSwitch', function (e) {
      setLayout(e.target.checked, 'errors-ciclo')
      
    });

    console.log("map loaded");

    map.on('click', function(e) {
      console.log(e);

      // query the clicked features
      var features = map.queryRenderedFeatures(
        e.point,
        { layers: ['cruce-dlmdhg', 'ciclovia-5n33t9'] }
      );

      
      if(features[0]) {
        console.log(features);

        let feature = features[0];
        createPopup(feature, e.lngLat, feature.layer.id); 
      }

    });

    map.on('mouseover', 'cruce-dlmdhg', mouseOverEvent);
    map.on('mouseout', 'cruce-dlmdhg', mouseOutEvent);

    map.on('mouseover', 'ciclovia-5n33t9', mouseOverEvent);
    map.on('mouseout', 'ciclovia-5n33t9', mouseOutEvent);

    function mouseOverEvent() {
      map.getCanvas().style.cursor = 'pointer';
    }

    function mouseOutEvent() {
      map.getCanvas().style.cursor = '';
    }
  });

  function createPopup(feature, coord, layer) {
    let popupContent;

    if(layer == 'ciclovia-5n33t9') {
      popupContent = getCycloviaPopupContent(feature.properties);
    } else {
      popupContent = getCrucesPopupContent(feature.properties);
    }
    
    popup = new mapboxgl.Popup()
      .setLngLat(coord)
      .setHTML(popupContent)
      .addTo(map);
  }

  function getCycloviaPopupContent(feature) {
    let popupContent = "<div class='popup-content'>"+
      "<div class='popup-item'><div>Comuna</div><div>" + feature['COMUNA'] +"</div></div>" +
      "<div class='popup-item'><div>Evaluación de calidad</div><div>" + feature['Evaluació'] +"</div></div>" +
      "<div class='popup-item'><div>Direccionalidad</div><div>" + feature['Direcciona'] +"</div></div>"+
      "<div class='popup-item'><div>Tipología</div><div>" + feature['Tipología'] +"</div></div>"+
      "<div class='popup-item'><div>Tipología vía de emplazamiento</div><div>" + feature['Tipolog_1-'] +"</div></div>"+
      "<div class='popup-item'><div>Ancho Ciclovía</div><div>" + feature['Ancho_Cicl'] +"</div></div>"+
      "<div class='popup-item'><div>Segregada de peatones</div><div>" + feature['Segregada'] +"</div></div>"+
      "<div class='popup-item'><div>Segregación de calzada</div><div>" + feature['Segregaci'] +"</div></div>"+
      "<div class='popup-item'><div>Superficie</div><div>" + feature['Superficie'] +"</div></div>"+ 
      "<div class='popup-item'><div>Señalización pista</div><div>" + feature['Señalizac'] +"</div></div>"+
      "<div class='popup-item'><div>Características particulares</div><div>" + feature['Caracterí'] +"</div></div>"+
    "</div>";
    return popupContent;
  }

  function getCrucesPopupContent(feature) {
    let popupContent = "<div class='popup-content'>"+
      "<div class='popup-item'><div>Comuna</div><div>" + feature['COMUNA'] +"</div></div>" +
      "<div class='popup-item'><div>Evaluación de calidad</div><div>" + feature['Evaluació'] +"</div></div>" +
      "<div class='popup-item'><div>Direccionalidad</div><div>" + feature['Direcciona'] +"</div></div>" +
      "<div class='popup-item'><div>Tipología </div><div>" + feature['Tipología'] +"</div></div>" +
      "<div class='popup-item'><div>Tipología vía de emplazamiento</div><div>" + feature['Tipolog_1'] +"</div></div>" +
      "<div class='popup-item'><div>Tipología vía de intersectada</div><div>" + feature['Tipolog_12'] +"</div></div>" +
      "<div class='popup-item'><div>Demarcación cruce</div><div>" + feature['Demarcaci'] +"</div></div>" +
      "<div class='popup-item'><div>Pintura de color en el cruce</div><div>" + feature['Pintura_de'] +"</div></div>" +
      "<div class='popup-item'><div>Cartel ciclo-temático</div><div>" + feature['Cartel__pa'] +"</div></div>" +
      "<div class='popup-item'><div>Semáforo para ciclistas</div><div>" + feature['Semaforo_p'] +"</div></div>" +
    "</div>";

    return popupContent;    
  }

  function setLayout(checked, layout){
    if(checked){
      map.setLayoutProperty(layout, 'visibility', 'visible')
    }
    else{
      map.setLayoutProperty(layout, 'visibility', 'none')
    }

  }

  // toggle the side tab
  var infoWindow = $('#info-window');
  var toggleButton = $('#toggle-button');

  toggleButton.on("click", function(e) {
    infoWindow.toggleClass("closed");
  });

  let tipologiaCheckbox = $('#tipologia');
  let evaluacionCheckbox = $('#evaluacion');

  // toggle the collape and layer section
  evaluacionCheckbox.on("change", function(e) {
    let { id, checked }= e.target;

    // update the layer on the map
    setLayout(checked, id);

    // toggle the collapse section
    let collapseId = 'layer-' + id;
    toggleCollapse(collapseId, checked);


    toggleCollapse('layer-tipologia');
    setLayout(false, 'tipologia');
    tipologiaCheckbox.prop( "checked", false );
  });

  tipologiaCheckbox.on("change", function(e) {
    let { id, checked }= e.target;

    // update the layer on the map
    setLayout(checked, id);

    // toggle the collapse section
    let collapseId = 'layer-' + id;
    toggleCollapse(collapseId, checked);

    toggleCollapse('layer-evaluacion');
    setLayout(false, 'evaluacion');
    evaluacionCheckbox.prop( "checked", false );
  });

  function toggleCollapse(collapseId, isChecked=false) {
    let myCollapse = document.getElementById(collapseId);
    let bsCollapse = new bootstrap.Collapse(myCollapse, {toggle:false});

    if(isChecked) {
      bsCollapse.show();
    } else {
      bsCollapse.hide();
    }

  }

  // update legend
  function updateLegend(categories, legendId) {
    let html = '';
    for (const key in categories) {
      if (Object.hasOwnProperty.call(categories, key)) {
        const color = categories[key];
        html += `<div class="d-flex"><div class="feature-line" style="background-color:${color};"></div>${key}</div>`
      }
    }
 
    $('#' + legendId).html(html);
  }

  updateLegend(tipologiaCategories, 'layer-tipologia');
  updateLegend(evaluacionCategories, 'layer-evaluacion');
});

