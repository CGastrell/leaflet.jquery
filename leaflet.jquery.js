/*
 *
 * jQuery Boilerplate
 * ------------------
 * https://github.com/jquery-boilerplate/boilerplate/
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "leaflet",
        defaults = {
        propertyName: "value",
        center: [-34, -59],
        zoom:4
    };

    // The actual plugin constructor
    function Leaflet ( element, options ) {
        this.element = element;
        this.$el = $(element);
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.Lmap = undefined;
    }

    Leaflet.prototype = {
        init: function () {
          var _this = this;
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.settings).
            if ( typeof L === "undefined") {
              _this._cargarJS(function() {
                _this.initLeafletMap();
              });
            } else {
              _this.initLeafletMap();              
            }
        },
        _cargarJS: function( callback )
        {
          jQuery('head').append('<link href="http://cdn.leafletjs.com/leaflet-0.6.2/leaflet.css" rel="stylesheet" type="text/css" />');
          jQuery('head').append('<!--[if lte IE 8]>' + "\n" 
              +'<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.2/leaflet.ie.css" />' + "\n" 
              + '<![endif]-->');
          $.getScript('http://cdn.leafletjs.com/leaflet-0.6.2/leaflet.js', callback);
        },
        initLeafletMap: function()
        {
          var _this = this;
        
          _this.Lmap = L.map( _this.element, _this.settings);
          _this.$el.data('Lmap', _this.Lmap);
          //Lanzo evento de jQUery ready cuando esté listo Leaflet
          //Se dispara cuando termina de cargar o inmediatamente si ya está cargado
          _this.whenReady(function() {
            _this.$el.trigger('ready', _this.Lmap);
            console.log("ready");
          });
          L.control.scale().addTo(_this.Lmap);
          _this.layerControl = L.control.layers({
            "OpenStreetMap": _this.addOSMLayer()
          }).addTo(_this.Lmap);
          _this.Lmap.attributionControl.setPrefix('');
          
        },
        whenReady:function( callback, context )
        {
          var _this = this;
          if (_this.Lmap === undefined) {
            _this.$el.on('ready', function() {
              _this.Lmap.whenReady(callback, context);
            });
          } else {
            _this.Lmap.whenReady(callback, context);
          }
        },
        addOSMLayer: function()
        {
          var _this = this;
          var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          var osmAttrib='© OpenStreetMap contributors';
          var osm = new L.TileLayer(osmUrl, {attribution:  osmAttrib});
          _this.Lmap.addLayer(osm);
          return osm;
        },
        geoLocate: function( str, callback )
        {
          var _this = this;
          function go() {
            _this.Lmap.setCenter();
          }
          $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + str, function(data) {
            _this.fitGeoLocateResult(data[0]);
            console.log(data);
          }, _this);

        },
        fitGeoLocateResult: function( d ) {
            var _this = this,
              s = d.boundingbox[0],
              w = d.boundingbox[2],
              n = d.boundingbox[1],
              e = d.boundingbox[3],
              southwest = new L.LatLng(s,w),
              northeast = new L.LatLng(n,w),
              boundingbox = new L.LatLngBounds(southwest, northeast);
            _this.Lmap.fitBounds( boundingbox);
        },
        zoom: function(level) {
          this.Lmap.setZoom(level);
        },
        center: function(latLng) {
          this.Lmap.panTo(latLng);
        },
        addMarker: function (options) {
          var _this = this;
          var defaults = {lat:0,lng:0,html:null,title:null,icon:null};
          var o = $.extend({},options);
          var ll = new L.LatLng(o.lat,o.lng);
          var m = new L.Marker(ll,o).addTo(this.Lmap);
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName )  ) {
              $.data( this, "plugin_" + pluginName, new Leaflet( this, options ) );
              $.data( this, "plugin_" + pluginName ).init();                
            }
        });
    };

    $.fn[ 'geolocate' ] = function ( options ) {
        return this.each(function() {
            if (  $.data( this, "plugin_" + pluginName) === undefined ) {
                throw "You need to call $().leaflet() at least once on this selector.";
            } else {
              $(this).data().plugin_leaflet.whenReady(function() {
                this.geoLocate( options );
              }, $(this).data().plugin_leaflet);
              
            }
        });
    };
    $.fn[ 'center' ] = function(lat,lon)
    {
      if(!$.isNumeric(lat) || !$.isNumeric(lon)) return;
      var ll = new L.LatLng(lat,lon);
      return this.each(function(){
        var $this = $(this);
        var a = $this.data('plugin_leaflet');
        if(!a) return;
        a.center(ll);
      });
    }
    $.fn[ 'zoom' ] = function(zoomLevel)
    {
      return this.each(function(){
        var $this = $(this);
        var a = $this.data('plugin_leaflet');
        if (!a) return;
        a.zoom(parseInt(zoomLevel));
      });
    }
    $.fn[ 'addMarker' ] = function(opciones)
    {
      return this.each(function(){
        var o = $.extend({},opciones);
        var $this = $(this);
        var a = $this.data('plugin_leaflet');
        if(!a) return;
        a.addMarker(o);
      });
    };

})( jQuery, window, document ); 
