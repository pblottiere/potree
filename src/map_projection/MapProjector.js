
// http://www.spatialreference.org/

proj4.defs('EPSG:21781', "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs ");
proj4.defs('EPSG:26910', "+proj=utm +zone=10 +ellps=GRS80 +datum=NAD83 +units=m +no_defs ");

Potree.OLMapProjector = function(pointcloud){
	this.pointcloud = pointcloud;
	this.projection = pointcloud.geoProjection;
	this.activeNode = null;

	
	var pco = pointcloud.pcoGeometry;
	var pcoBB = pco.boundingBox;
	
	this.minimum = new THREE.Vector3().subVectors(pcoBB.min, pco.offset);
	this.maximum = new THREE.Vector3().subVectors(pcoBB.max, pco.offset);
	
	this.pProjection = proj4.defs(this.projection);
	this.pWebMercator = proj4.defs("EPSG:3857");
	
	this.mapContainer = document.createElement("div");
	document.body.appendChild(this.mapContainer); 
	this.mapContainer.style.width = "1px";
	this.mapContainer.style.height = "1px";
	
	
	this.initMap();
};

Potree.OLMapProjector.numNodesLoading = 0;

Potree.OLMapProjector.prototype.initMap = function(){
	var minWeb = proj4(this.pProjection, this.pWebMercator, [this.minimum.x, this.minimum.y]);
	var maxWeb = proj4(this.pProjection, this.pWebMercator, [this.maximum.x, this.maximum.y]);
	
	var extent = [minWeb[0], minWeb[1], maxWeb[0], maxWeb[1]];
	var center = [(maxWeb[0] + minWeb[0]) / 2, (maxWeb[1] + minWeb[1]) / 2];
			
	this.bingLayer = new ol.layer.Tile({
	  source: new ol.source.BingMaps({
		imagerySet: 'Aerial',
		key: 'AvkSi_2KgDu8JNeMVPEBGJHoHATta02IrypWlTdh5he7eq40PQko5Ujte2lRdUxw'
	  })
	})
				
	this.osmLayer = new ol.layer.Tile({
		source: new ol.source.OSM(),
	});
	
	this.activeLayer = this.osmLayer;
	
	var view = new ol.View({
		center: center,
		zoom: 16
	});
	
	this.map = new ol.Map({
		controls: [],
		layers: [this.activeLayer],
		target: this.mapContainer,
		view: view,
		renderer: "canvas"
	});
	
	var scope = this;
	this.osmLayer.on('postcompose', function(event) {
		console.log("postcompose");
		scope.handleRendered();
	});
	
	this.bingLayer.on('postcompose', function(event) {
		scope.handleRendered();
	});
	
	this.map.on('render', function(event) {
		console.log("render");
		scope.handleRendered();
	});
};

Potree.OLMapProjector.prototype.project = function(node){
	if(Potree.OLMapProjector.numNodesLoading > 2){
		return;
	}
	
	if(!(node instanceof THREE.PointCloud)){
		return;
	}
	
	if(this.activeNode){
		return;
	}else{
		this.activeNode = node;
	}
	
	Potree.OLMapProjector.numNodesLoading++;
	
	this.mapContainer.style.width = "128px";
	this.mapContainer.style.height = "128px";
	this.mapContainer.style.position = "absolute";
	this.mapContainer.style.top = "0px";
	this.mapContainer.style.left = "0px";
	
	
	//this.mapContainer.style.border = "1px solid black";
	
	//this.mapContainer.style.display = "none";
	this.map.updateSize();
	
	var pco = this.pointcloud.pcoGeometry;
	var pcoBB = pco.boundingBox;
	
	var min = new THREE.Vector3().subVectors(node.pcoGeometry.boundingBox.min, pco.offset);
	var max = new THREE.Vector3().subVectors(node.pcoGeometry.boundingBox.max, pco.offset);
	
	var minWeb = proj4(this.pProjection, this.pWebMercator, [min.x, min.y]);
	var maxWeb = proj4(this.pProjection, this.pWebMercator, [max.x, max.y]);
	
	var extent = [minWeb[0], minWeb[1], maxWeb[0], maxWeb[1]];
	var center = [(maxWeb[0] + minWeb[0]) / 2, (maxWeb[1] + minWeb[1]) / 2];
	var view = this.map.getView();
	var res = view.getResolutionForExtent(extent, this.map.getSize())
	view.setCenter(center);
	view.setResolution(res)
};

Potree.OLMapProjector.prototype.handleRendered = function(){
	if(!this.activeNode){
		return;
	}

	var canvas = this.mapContainer.getElementsByTagName("canvas")[0];
	var texture = new THREE.Texture( canvas );
	texture.needsUpdate = true;
	textureImage = texture.image;
	
	this.activeNode.geoTexture = texture;
	this.activeNode.material.decal = texture;
	
	
	Potree.OLMapProjector.numNodesLoading--;
};



