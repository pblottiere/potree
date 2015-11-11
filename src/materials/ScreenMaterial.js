


Potree.ScreenMaterial = function(parameters){
	THREE.Material.call( this );

	parameters = parameters || {};
	
	var uniforms = {
		screenWidth: 	{ type: "f", 	value: 0 },
		screenHeight: 	{ type: "f", 	value: 0 },
		near: 			{ type: "f", 	value: 0 },
		far: 			{ type: "f", 	value: 0 },
		colorMap: 		{ type: "t", 	value: null },
		opacity:		{ type: "f",	value: 1.0}
	};
	
	this.setValues({
		uniforms: uniforms,
		vertexShader: Potree.Shaders["screen.vs"],
		fragmentShader: Potree.Shaders["screen.fs"],
	});
	
};


Potree.ScreenMaterial.prototype = new THREE.ShaderMaterial();














