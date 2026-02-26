struct VertexOutput {
			  @builtin(position) aVertexPosition: vec4<f32>,
			  @location(0) bary: vec3<f32>,
  };

 struct UniformStruct {
	 theta : vec4<f32>
 };

 @group(0) @binding(0) var<uniform> uniformStruct : UniformStruct;

 @vertex
	fn vs_main(
			  @location(0) inPos: vec3<f32>,
@location(1) bary : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	// Compute the sines and cosines of each rotation
	// about each axis - must be converted into radians first
	var c = cos(  uniformStruct.theta );
	var s = sin(  uniformStruct.theta );

	// translation matrix
	var trans = mat4x4<f32> ( 1.0,  0.0,  0.0,  0.0,
					 0.0,  1.0,  0.0,  0.0,
					 0.0, 0.0,  1.0,  0.0,
					 0.0,  0.0, 0.5,  1.0 );
	// scale matrix
	var scale = mat4x4<f32> ( 1.0,  0.0,  0.0,  0.0,
					 0.0,  1.0,  0.0,  0.0,
					 0.0, 0.0,  1.0,  0.0,
					 0.0,  0.0,  0.0,  1.0 );
	// rotation matrices
	var rx = mat4x4<f32> ( 1.0,  0.0,  0.0,  0.0,
					 0.0,  c.x,  s.x,  0.0,
					 0.0, -s.x,  c.x,  0.0,
					 0.0,  0.0,  0.0,  1.0 );

	var ry = mat4x4<f32> ( c.y,  0.0, -s.y,  0.0,
					 0.0,  1.0,  0.0,  0.0,
					 s.y,  0.0,  c.y,  0.0,
					 0.0,  0.0,  0.0,  1.0 );

	var rz = mat4x4<f32> ( c.z,  s.z,  0.0,  0.0,
					-s.z,  c.z,  0.0,  0.0,
					 0.0,  0.0,  1.0,  0.0,
					 0.0,  0.0,  0.0,  1.0 );


	out.aVertexPosition =  trans * rz * ry * rx * scale * vec4<f32>(inPos.x, inPos.y, inPos.z, 1);
	out.bary = bary;
	return out;
   }

   @fragment
   fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
		var fragColor = vec4<f32> (0.5, 0.5, 0.5, 1.0 );
		// if on the edge, draw black, otherwsie, draw grey
		if (in.bary.x < 0.01 || in.bary.y < 0.01 || in.bary.z < 0.01) {
			fragColor = vec4 (1.0, 1.0, 1.0, 1.0);
		}
		return fragColor;
   }
