// Voxel data
var voxelSize;
var voxelData;

// Textures
// 0: Grass top
// 1: Grass side
// 2: Dirt
// 3: Stone
// 5: Sky bottom
// 8: Sky left
// 9: Sky front
// 10: Sky right
// 11: Sky back
// 13: Sky top
// Materials
// 0: Air
// 1: Grass
// 2: Dirt
// 3: Stone
// Order: Top, Side, Bottom
let materialTextureMap = [
	[0, 0, 0],	// This shouldn't be used. It's air.
	[0, 1, 2],
	[2, 2, 2],
	[3, 3, 3],
]

function toVoxelIndex(x, y, z) {
	return z + (y * voxelSize[0]) + (x * voxelSize[1] * voxelSize[2]) 
}

function inBounds(x, y, z) {
	return x >= 0 && x < voxelSize[0] && y >= 0 && y < voxelSize[1] && z >= 0 && z < voxelSize[2];
}

function getVoxel(x, y, z) {
	if (inBounds(x, y, z)) {
		return voxelData[toVoxelIndex(x, y, z)];
	} else {
		return 0;
	}
}

function generateVoxelsCPU() {
	let t1 = performance.now();
	
	let w = 256;
	let h = 64;
	voxelSize = [w, h, w];
	voxelData = [];
	
	let filled = 0;
	
	// Fill
	for (let x = 0; x < voxelSize[0]; x++) {
		for (let y = 0; y < voxelSize[1]; y++) {
			for (let z = 0; z < voxelSize[2]; z++) {
				// The main bit where we decide on fill (and material but that might be a later stage)
				let x1 = x - (voxelSize[0]/2);
				let y1 = y - (voxelSize[1]/2);
				let z1 = z - (voxelSize[2]/2);
				
				let f = perlin.Noise(x / 16, y / 16, z / 16) + (y1 / 64);
				
				// let s = (((x1**2) + (y1**2) + (z1**2))**0.5);
				// let f = s - (voxelSize[1] * 0.45);
				// let g = s - (voxelSize[1] * 0.4);
				// let h = (f > 0) || (y < voxelSize[1] * .25) || (y > voxelSize[1] * .75) ? 1 : 0;
				// h = h == 1 || g < 0 ? 1 : 0;
				/////////////
				
				// let f = x-16;
				
				if (f < 0.5) {
					filled++;
					voxelData[toVoxelIndex(x, y, z)] = Math.floor(Math.random() * (materialTextureMap.length - 1)) + 1;
				} else {
					voxelData[toVoxelIndex(x, y, z)] = 0;
				}
				
				// n++;
			}
		}
	}
	// console.log(voxelData);
	
	let t2 = performance.now();
	console.log("CPU calculated " + voxelData.length + " voxels (" + filled + " filled) in " + (t2 - t1) + "ms.");
}

function generateVoxelsGPU() {
	//TODO: this
	let t1 = performance.now();
	
	let t2 = performance.now();
	console.log("GPU calculated " + voxelData.length + " voxels in " + (t2 - t1) + "ms.");
}

function addQuad(v1, v2, v3, v4, f, textureIndex, l1, l2, l3, l4) {
	var n = points.length / 3;
	
	if (f) {
		points.push(v1[0]); points.push(v1[1]); points.push(v1[2])
		points.push(v2[0]); points.push(v2[1]); points.push(v2[2])
		points.push(v3[0]); points.push(v3[1]); points.push(v3[2])
		points.push(v4[0]); points.push(v4[1]); points.push(v4[2])
	} else {
		points.push(v4[0]); points.push(v4[1]); points.push(v4[2])
		points.push(v3[0]); points.push(v3[1]); points.push(v3[2])
		points.push(v2[0]); points.push(v2[1]); points.push(v2[2])
		points.push(v1[0]); points.push(v1[1]); points.push(v1[2])
	};
	
	let xoff = textureIndex % atlasWidth;
	let yoff = Math.floor(textureIndex / atlasWidth);
	// Kludge to fix texture leaking on edges.
	let off0 = 0.001;
	let off1 = 0.999;
	
	bary.push((off0 + xoff) / atlasWidth); bary.push((off0 + yoff) / atlasWidth); bary.push(l1);
	bary.push((off0 + xoff) / atlasWidth); bary.push((off1 + yoff) / atlasWidth); bary.push(l2);
	bary.push((off1 + xoff) / atlasWidth); bary.push((off1 + yoff) / atlasWidth); bary.push(l3);
	bary.push((off1 + xoff) / atlasWidth); bary.push((off0 + yoff) / atlasWidth); bary.push(l4);
		
	indices.push(n + 0);
	indices.push(n + 1);
	indices.push(n + 2);
	
	indices.push(n + 2);
	indices.push(n + 3);
	indices.push(n + 0);
}
	
// Difficult to parallelize because we don't know how many faces will be generated.
function generateMeshCPU() {
	let t1 = performance.now();
	
	for (let x = 0; x < voxelSize[0]; x++) {
		for (let y = 0; y < voxelSize[1]; y++) {
			for (let z = 0; z < voxelSize[2]; z++) {
				//Check plus on each axis
				let thisVoxel = getVoxel(x, y, z);
				let xVoxel = getVoxel(x+1, y, z);
				let yVoxel = getVoxel(x, y+1, z);
				let zVoxel = getVoxel(x, y, z+1);
				// let nxVoxel = getVoxel(x-1, y, z);
				// let nyVoxel = getVoxel(x, y-1, z);
				// let nzVoxel = getVoxel(x, y, z-1);
				
				// if (thisVoxel < 0.5 && xVoxel > 0.5 && yVoxel > 0.5 && zVoxel > 0.5 && nxVoxel > 0.5 && nyVoxel > 0.5 && nzVoxel > 0.5) {
					// continue;
				// }
				
				if (Math.min(1, zVoxel) != Math.min(1, thisVoxel)) {
					addQuad(
						[x, y, z+1],
						[x, y+1, z+1],
						[x+1, y+1, z+1],
						[x+1, y, z+1],
						1-thisVoxel > 0.5 ? 1 : 0,
						thisVoxel > 0.5 ? materialTextureMap[thisVoxel][1] : materialTextureMap[zVoxel][1],
						0.8, 0.8, 0.8, 0.8
					);
				}
				if (Math.min(1, yVoxel) != Math.min(1, thisVoxel)) {
					let vl = thisVoxel > 0.5 ? 1 : 0.4;
					addQuad(
						[x, y+1, z],
						[x, y+1, z+1],
						[x+1, y+1, z+1],
						[x+1, y+1, z],
						thisVoxel > 0.5 ? 1 : 0,
						thisVoxel > 0.5 ? materialTextureMap[thisVoxel][0] : materialTextureMap[yVoxel][2],
						vl, vl, vl, vl
					);
				}
				if (Math.min(1, xVoxel) != Math.min(1, thisVoxel)) {
					addQuad(
						[x+1, y, z],
						[x+1, y+1, z],
						[x+1, y+1, z+1],
						[x+1, y, z+1],
						thisVoxel > 0.5 ? 1 : 0,
						thisVoxel > 0.5 ? materialTextureMap[thisVoxel][1] : materialTextureMap[xVoxel][1],
						0.6, 0.6, 0.6, 0.6
					);
				}	
			}
		}
	}
	
	let t2 = performance.now();
	console.log("CPU calculated " + points.length + " vertices in " + (t2 - t1) + "ms.");
}

function generateMeshGPU() {
	//TODO: this
	let t1 = performance.now();
	
	let t2 = performance.now();
	console.log("GPU calculated " + points.length + " vertices in " + (t2 - t1) + "ms.");
}

function generateSkybox() {
	let s = 50000;
	let v = [
		[ s,  s,  s],	// 0 Top front left
		[ s,  s, -s],	// 1 Top front right
		[ s, -s, -s],	// 2 Bottom front right
		[ s, -s,  s],	// 3 Bottom front left
		[-s,  s,  s],	// 4 Top back left
		[-s,  s, -s],	// 5 Top back right
		[-s, -s, -s],	// 6 Bottom back right
		[-s, -s,  s],	// 7 Bottom back left
	];
	// Top
	addQuad(
		v[1], v[5], v[4], v[0],
		0, 13, 1, 1, 1, 1
	);
	// Bottom
	addQuad(
		v[7], v[3], v[2], v[6],
		1, 5, 1, 1, 1, 1
	);
	// Left
	addQuad(
		v[3], v[0], v[4], v[7],
		0, 8, 1, 1, 1, 1
	);
	// Right
	addQuad(
		v[2], v[1], v[5], v[6],
		1, 10, 1, 1, 1, 1
	);
	// Front
	addQuad(
		v[3], v[0], v[1], v[2],
		1, 9, 1, 1, 1, 1
	);
	// Back
	addQuad(
		v[7], v[4], v[5], v[6],
		0, 11, 1, 1, 1, 1
	);
}

function doAllMeshing() {
	generateSkybox();
	generateMeshCPU();
}

function radians(degrees) {
  return degrees * (Math.PI / 180);
}