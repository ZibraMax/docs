import * as THREE from "three";
import { multiply, transpose } from "./build/math.js";
class Element {
	constructor(coords, gdls) {
		this.coords = coords;
		this.gdls = gdls;
		this.res = 1;
	}
	get _xcenter() {
		let x = 0;
		let y = 0;
		let z = 0;
		let n = this.coords.length;
		for (let i = 0; i < n; i++) {
			let c = this.coords[i];
			x += c[0];
			y += c[1];
			z += c[2];
		}
		let center = [x / n, y / n, z / n];
		return center;
	}
	setUe(U, svs = true, displacements = false) {
		this.Ue = [];
		for (const v of this.gdls) {
			const u = [];
			for (const d of v) {
				u.push(U[d]);
			}
			this.Ue.push(u);
		}
		this.updateCoordinates(this.Ue, displacements);
	}

	T(_z) {
		let p = this.psi(_z);
		return [multiply([p], this.coords), p];
	}

	updateCoordinates(Ue, displacements) {
		this.X = [];
		this.XLines = [];
		this.U = [];
		this.ULines = [];
		this._U = [];
		this._ULines = [];
		let count = this._domain.length;
		for (let i = 0; i < count; i++) {
			const z = this._domain[i];
			let [XX, P] = this.T(z);
			const X = XX[0];
			const U = multiply(Ue, transpose([P]));
			const _U = [...U];
			for (let j = this.ndim; j < 3; j++) {
				X.push(0.0);
				_U.push(0.0);
			}
			this.X.push(X);
			this.U.push(U);
			this._U.push(_U);
		}
		for (let i = 0; i < this.line_domain.length; i++) {
			const z = this.line_domain[i];
			let [XX, P] = this.T(z);
			const XLines = XX[0];
			const ULines = multiply(Ue, transpose([P]));
			const _ULines = [...ULines];
			for (let j = this.ndim; j < 3; j++) {
				XLines.push(0.0);
				_ULines.push(0.0);
			}
			this.XLines.push(XLines);
			this._ULines.push(_ULines);
			this.ULines.push(ULines);
		}

		if (!displacements) {
			this._U = new Array(this._domain.length).fill([0.0, 0.0, 0.0]);
			this._ULines = new Array(this.line_domain.length).fill([
				0.0, 0.0, 0.0,
			]);
		}
	}
	changeCoords(norm, globalcoords) {
		let coords = [];

		for (const v of this.gdls[0]) {
			coords.push(globalcoords[v / 3]);
		}
		this.coords = coords;
		this.updateCoordinates(this.Ue);
		this.setGeometryCoords(1, norm);
	}
	setGeometryCoords(mult, norm) {
		if (!mult) {
			if (mult != 0) {
				mult = 1.0;
			}
		}
		if (!norm) {
			if (norm != 0) {
				norm = 1.0;
			}
		}

		const parent_geometry = this.geometry;
		const line_geometry = this.line_geometry;
		let count = this._domain.length;
		for (let i = 0; i < count; i++) {
			const X = this.X[i];
			let U = this._U[i];
			parent_geometry.attributes.position.setX(
				i,
				X[0] * norm + this.modifier[i][0] + U[0] * mult * norm
			);
			parent_geometry.attributes.position.setY(
				i,
				X[1] * norm + this.modifier[i][1] + U[1] * mult * norm
			);
			parent_geometry.attributes.position.setZ(
				i,
				X[2] * norm + this.modifier[i][2] + U[2] * mult * norm
			);
		}
		parent_geometry.attributes.position.needsUpdate = true;
		parent_geometry.computeVertexNormals();
		if (line_geometry) {
			count = this.line_domain.length;
			for (let i = 0; i < count; i++) {
				const X = this.XLines[i];
				let U = this._ULines[i];
				line_geometry.attributes.position.setX(
					i,
					X[0] * norm + this.line_modifier[i][0] + U[0] * mult * norm
				);
				line_geometry.attributes.position.setY(
					i,
					X[1] * norm + this.line_modifier[i][1] + U[1] * mult * norm
				);
				line_geometry.attributes.position.setZ(
					i,
					X[2] * norm + this.line_modifier[i][2] + U[2] * mult * norm
				);
			}
			line_geometry.attributes.position.needsUpdate = true;
			line_geometry.computeVertexNormals();
		}
	}
}
class Element3D extends Element {
	constructor(coords, gdls) {
		super(coords, gdls);
	}
	isInside(x) {
		return false;
	}
}
class Quadrilateral extends Element3D {
	constructor(coords, gdls, tama) {
		super(coords, gdls);
		this.tama = tama;
		this.type = "C1V";
		this.ndim = 2;

		const c = [];
		for (let i = 0; i < coords.length; i++) {
			const x = coords[i][0];
			const y = coords[i][1];
			const z = coords[i][2];
			c.push([x, y, z]);
		}
		this.coords_o = c;
		this.initGeometry();
	}
	transformation(geo) {
		this._domain = [];
		this.modifier = [];
		this.line_domain = [];
		this.line_modifier = [];
		const Z = [];
		for (let i = 0; i < geo.attributes.position.count; i++) {
			const x = geo.attributes.position.getX(i);
			const y = geo.attributes.position.getY(i);
			const z = geo.attributes.position.getZ(i);
			Z.push([x * 2, y * 2, 2 * z]);
			this._domain.push([x * 2, y * 2, z * 2]);
			this.modifier.push([0.0, 0.0, (this.tama / 20) * (z + 0.5) * 0]);
		}
		for (let i = 0; i < this.line_geometry.attributes.position.count; i++) {
			const x = this.line_geometry.attributes.position.getX(i);
			const y = this.line_geometry.attributes.position.getY(i);
			const z = this.line_geometry.attributes.position.getZ(i);
			this.line_domain.push([x * 2, y * 2, z * 2]);
			this.line_modifier.push([
				0.0,
				0.0,
				(this.tama / 20) * (z + 0.5) * 0,
			]);
		}

		return Z;
	}
	psi(z) {
		return [
			0.25 * (1.0 - z[0]) * (1.0 - z[1]),
			0.25 * (1.0 + z[0]) * (1.0 - z[1]),
			0.25 * (1.0 + z[0]) * (1.0 + z[1]),
			0.25 * (1.0 - z[0]) * (1.0 + z[1]),
		];
	}
	dpsi(z) {
		return [
			[0.25 * (z[1] - 1.0), 0.25 * (z[0] - 1.0)],
			[-0.25 * (z[1] - 1.0), -0.25 * (z[0] + 1.0)],
			[0.25 * (z[1] + 1.0), 0.25 * (1.0 + z[0])],
			[-0.25 * (1.0 + z[1]), 0.25 * (1.0 - z[0])],
		];
	}
	initGeometry() {
		this.geometry = new THREE.BoxGeometry(
			1,
			1,
			1,
			2 ** (this.res - 1),
			2 ** (this.res - 1),
			1
		);

		this.line_geometry = new THREE.EdgesGeometry(this.geometry);
		this.domain = this.transformation(this.geometry);
		this.colors = Array(this.modifier.length).fill(0.0);
		this.geometry.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(
				new Array(this.modifier.length * 3),
				3
			)
		);
	}
}

export { Element, Element3D, Quadrilateral };
