import * as THREE from "three";
import { Quadrilateral } from "./Elements.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as BufferGeometryUtils from "./build/BufferGeometryUtils.js";
import { AxisGridHelper } from "./build/minigui.js";
import {
	max,
	min,
	transpose,
	multiplyScalar,
	squared_distance,
} from "./build/math.js";

const types = {
	QUAD: Quadrilateral,
};
function allowUpdate() {
	return new Promise((f) => {
		setTimeout(f, 0);
	});
}
import { mars } from "./mars.js";
const grafica1 = document.getElementById("grafica1");
const grafica2 = document.getElementById("grafica2");

const globalargs = {
	gamma1: 60,
	gamma2: 90,
	a: 24.5,
	b: 24.5,
	beta: 30,
	poisson: mars.poissonhl,
	k: mars.stiffnessx,
};

var style = getComputedStyle(document.body);
var TEXT_COLOR = style.getPropertyValue("--gui-text-color").trim();
var BACKGROUND_COLOR = style.getPropertyValue("--gui-background-color").trim();
var TITLE_BACKGROUND_COLOR = style
	.getPropertyValue("--gui-title-background-color")
	.trim();
var PLOT_GRID_COLOR = style.getPropertyValue("--plot-grid-color").trim();
var FONT_FAMILY = style.getPropertyValue("--font-family").trim();
var FOCUS_COLOR = style.getPropertyValue("--focus-color").trim();
var LINES_COLOR = style.getPropertyValue("--gui-text-color").trim();

class Viewer {
	constructor(container, axis = false, iz = 1.05) {
		this.container = container;
		let magnif = 1;

		let canvas = document.createElement("canvas");
		canvas.setAttribute("class", "box side-pane");
		canvas.setAttribute("willReadFrequently", "true");
		this.container.appendChild(canvas);
		this.canvas = canvas;
		this.initial_zoom = iz;
		this.axis = axis;
		this.rot = false;
		this.resolution = 1;
		this.nodes = [];
		this.nvn = -1;
		this.dictionary = [];
		this.step = 0;
		this.size = 0.0;
		this.elements = [];
		this.ndim = -1;

		// THREE JS
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
		});

		this.renderer.autoClear = false;
		this.delta = 0;
		this.interval = 1 / 60;
		this.clock = new THREE.Clock();
		this.bufferGeometries = [];
		this.bufferLines = [];
		this.model = new THREE.Object3D();
		this.magnif = magnif;
		this.mult = 1.0;
		this.max_disp = 0.0;
		this.draw_lines = true;
		this.show_model = true;

		this.gui = new GUI({ title: "Menu", container: this.container });
		this.gui.close();
		this.gui.show(false);
		this.loaded = false;
		this.settings();
	}
	settings() {
		THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
		this.scene = new THREE.Scene();
		const fov = 40;
		const aspect = window.innerWidth / window.innerHeight; // the canvas default
		const near = 0.01;
		const far = 200;
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.set(0, 0, 0);
		this.camera.lookAt(0, 0, 0);
		this.scene.add(this.camera);

		// Controls
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.target.set(0, 0, 0);
		this.controls.update();

		// Lights
		this.light2 = new THREE.AmbientLight(0xffffff, 0.0);
		const color = 0xffffff;
		const intensity = 0.8;
		this.light = new THREE.PointLight(color, intensity);
		this.camera.add(this.light);
		this.scene.add(this.light2);

		this.gh = new AxisGridHelper(this.scene, 0);
		this.gh.visible = true;
	}
	async createPatter() {
		this.parseJSON();
	}
	handleVisibilityChange(e) {
		if (document.visibilityState === "hidden") {
			this.clock.stop();
		} else {
			this.clock.start();
		}
	}
	update() {
		this.delta += this.clock.getDelta();
		if (this.delta > this.interval) {
			// The draw or time dependent code are here
			this.render(this.delta);

			this.delta = this.delta % this.interval;
		}
		this.animationFrameID = requestAnimationFrame(this.update.bind(this));
		this.refreshing = true;
		this.updateRefresh();
	}
	updateRefresh() {
		this.controls.enabled = this.refreshing;
	}
	resizeRendererToDisplaySize() {
		const canvas = this.renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = (canvas.clientWidth * pixelRatio) | 0;
		const height = (canvas.clientHeight * pixelRatio) | 0;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			this.renderer.setSize(width, height, false);
		}
		return needResize;
	}
	updateMeshCoords(a = false) {
		for (let i = 0; i < this.elements.length; i++) {
			const e = this.elements[i];
			if (a) {
				e.changeCoords(this.norm, this.nodes);
			} else {
				if (this.draw_lines) {
					e.setGeometryCoords(this.magnif * this.mult, this.norm);
				} else {
					e.setGeometryCoords(this.magnif * this.mult, this.norm);
				}
			}
		}
	}
	updateGeometry() {
		if (this.octreeMesh) {
			this.octreeMesh.material = this.line_material;
			this.octreeMesh.material.needsUpdate = true;
		}

		this.mergedGeometry.dispose();
		this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
			this.bufferGeometries,
			false
		);
		this.mesh.geometry = this.mergedGeometry;
		this.mesh.material = this.material;
		this.mesh.material.needsUpdate = true;

		if (this.draw_lines) {
			this.mergedLineGeometry.dispose();
			this.mergedLineGeometry = BufferGeometryUtils.mergeBufferGeometries(
				this.bufferLines,
				false
			);
			this.contour.geometry = this.mergedLineGeometry;
			this.contour.material = this.line_material;
			this.contour.material.needsUpdate = true;
		}
	}
	async render(time) {
		if (typeof time == "number") {
			time = time || 0;
		} else {
			time = 0.0;
		}
		this.mult += time;

		if (this.mult > 1) {
			this.mult = 0.0;
		} else if (this.mult < -1) {
			this.side = 1.0;
			this.mult = -1.0;
		}
		if (!this.animate) {
			this.mult = 1.0;
		}
		// Specific part of shit
		if (this.rot) {
			this.rotateModel();
		} else {
			if (this.animate) {
				globalargs["beta"] = this.mult * 180;
				rangebeta.value = globalargs["beta"];
				betaelement.value = rangebeta.value;
				await allowUpdate();
				this.updateCoords();
				//this.updatePlots();
			}
		}
		this.renderer.render(this.scene, this.camera);
		if (this.resizeRendererToDisplaySize()) {
			const canvas = this.renderer.domElement;
			const aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.aspect = aspect;
			this.camera.updateProjectionMatrix();
			this.zoomExtents();
		}
	}
	zoomExtents() {
		let vFoV = this.camera.getEffectiveFOV();
		let hFoV = this.camera.fov * this.camera.aspect;

		let FoV = Math.min(vFoV, hFoV);
		let FoV2 = FoV / 2;

		let dir = new THREE.Vector3();
		this.camera.getWorldDirection(dir);

		let bb = this.mesh.geometry.boundingBox;
		let bs = this.mesh.geometry.boundingSphere;
		let bsWorld = bs.center.clone();
		this.mesh.localToWorld(bsWorld);

		let th = (FoV2 * Math.PI) / 180.0;
		let sina = Math.sin(th);
		let R = bs.radius;
		let FL = R / sina;

		let cameraDir = new THREE.Vector3();
		this.camera.getWorldDirection(cameraDir);

		let cameraOffs = cameraDir.clone();
		cameraOffs.multiplyScalar(-FL * this.initial_zoom);
		let newCameraPos = bsWorld.clone().add(cameraOffs);

		this.camera.position.copy(newCameraPos);
		this.camera.lookAt(bsWorld);
		this.controls.target.copy(bsWorld);

		this.controls.update();
	}
	updateMaterial() {
		this.material = new THREE.MeshLambertMaterial({
			color: FOCUS_COLOR,
			emissive: FOCUS_COLOR,
			wireframe: this.wireframe,
			side: THREE.DoubleSide,
		});
		this.light2.intensity = 0.0;
		this.light.intensity = 1.0;
		this.line_material = new THREE.LineBasicMaterial({
			color: LINES_COLOR,
			linewidth: 3,
		});
	}
	async init(animate = false) {
		this.guiSettingsBasic();
		this.animate = animate;
		await this.createElements();
		this.createLines();

		this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
			this.bufferGeometries,
			true
		);
		await allowUpdate();
		this.updateMaterial();
		this.mergedLineGeometry = BufferGeometryUtils.mergeBufferGeometries(
			this.bufferLines,
			true
		);
		this.contour = new THREE.LineSegments(
			this.mergedLineGeometry,
			this.line_material
		);
		// this.model.add(this.contour);

		this.mesh = new THREE.Mesh(this.mergedGeometry, this.material);
		await allowUpdate();

		this.updateU();
		this.model.add(this.mesh);

		this.scene.add(this.model);
		//this.renderer.render(this.scene, this.camera);
		//this.zoomExtents();
		this.updateLines();
		if (!this.corriendo) {
			this.corriendo = true;
			this.animationFrameID = requestAnimationFrame(
				this.update.bind(this)
			);
			this.refreshing = true;
			this.updateRefresh();
		}
		this.renderer.render(this.scene, this.camera);
		this.zoomExtents();
		await allowUpdate();
	}
	updateLines() {
		if (this.draw_lines) {
			this.model.add(this.contour);
		} else {
			this.model.remove(this.contour);
		}
		this.updateGeometry();
	}

	setStep(step) {
		this.step = step;
		this.updateU();
		this.updateMeshCoords();
		this.updateGeometry();
	}
	updateCoords() {
		this.nodes = mars.coordinates(globalargs);
		this.updateMeshCoords(true);
		this.updateGeometry();
	}

	parseJSON() {
		let a = globalargs["a"];
		let b = globalargs["b"];

		this.norm = 1.0 / max([2 * a, 2 * b]);

		this.nodes = mars.coordinates(globalargs);
		this.nvn = 3;
		this.ndim = 3;

		this.dictionary = [];
		this.types = [];
		this.solutions_info = [];
		this.solutions = [];
		this.original_dict = [
			[0, 1, 4, 3],
			[1, 2, 5, 4],
			[3, 4, 7, 6],
			[4, 5, 8, 7],
		];
		this.dictionary.push(...this.original_dict);
		this.types = Array(this.nodes.length * this.nvn).fill("QUAD");

		this.loaded = true;

		const secon_coords = this.nodes[0].map((_, colIndex) =>
			this.nodes.map((row) => row[colIndex])
		);
		this.solutions = [Array(this.nodes.length * this.nvn).fill(0.0)];
		this.solutions_info = [{ info: "Not solved" }];

		let sizex = max(secon_coords[0].flat()) - min(secon_coords[0].flat());
		let sizey = max(secon_coords[1].flat()) - min(secon_coords[1].flat());
		let sizez = max(secon_coords[2].flat()) - min(secon_coords[2].flat());

		let centerx = (max(secon_coords[0]) + min(secon_coords[0])) / 2;
		let centery = (max(secon_coords[1]) + min(secon_coords[1])) / 2;
		let centerz = (max(secon_coords[2]) + min(secon_coords[2])) / 2;
		this.center = [
			centerx - sizex / 2,
			centery - sizey / 2,
			centerz - sizez / 2,
		];
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i][0] += (sizex / 2) * 0;
			this.nodes[i][1] += (sizey / 2) * 0;
			this.nodes[i][2] += (sizez / 2) * 0;
		}

		this.size = max(this.nodes.flat()) - min(this.nodes.flat());

		this.dimens = [sizex / 2, sizey / 2, sizez / 2];
		this._nodes = [];
		for (let kk = 0; kk < this.nodes.length; kk++) {
			this._nodes.push({ _xcenter: this.nodes[kk], id: kk });
		}
	}
	updateU() {
		this.U = this.solutions[this.step].flat();

		// this.updateDispSlider(); TODO fix this

		for (const e of this.elements) {
			e.setUe(this.U, false);
			if (this.solution_as_displacement) {
				e.variableAsDisplacement(this.variable_as_displacement);
			}
		}
		this.updateMeshCoords();
	}

	nextSolution() {
		this.step += 1 * (this.step < this.solutions.length - 1);
		this.updateSolution();
	}
	updateSolution() {
		this.updateU();
		this.updateGeometry();
	}
	async createElements() {
		this.bufferGeometries = [];
		this.elements = new Array(this.dictionary.length).fill(0.0);
		let times = 0;
		for (let i = 0; i < this.dictionary.length; i++) {
			const gdls = this.dictionary[i];
			const egdls = [];
			for (let i = 0; i < this.nvn; i++) {
				const a = [];
				for (const gdl of gdls) {
					a.push(gdl * this.nvn + i);
				}
				egdls.push(a);
			}
			const coords = [];
			for (const node of gdls) {
				coords.push(this.nodes[node]);
			}

			this.size;

			this.elements[i] = new types[this.types[i]](
				coords,
				egdls,
				this.size * this.norm
			);

			let d = 0;
			for (const c of coords) {
				let sx = c[0] - this.elements[i]._xcenter[0];
				let sy = c[1] - this.elements[i]._xcenter[1];
				let sz = c[2] - this.elements[i]._xcenter[2];
				d = Math.max(d, sx ** 2 + sy ** 2 + sz ** 2);
			}

			this.min_search_radius = Math.max(
				this.min_search_radius,
				2 * d ** 0.5
			);
			const colors = [];
			for (
				let j = 0;
				j < this.elements[i].geometry.attributes.position.count;
				++j
			) {
				colors.push(1, 1, 1);
			}
			this.elements[i].index = i;

			this.bufferGeometries.push(this.elements[i].geometry);
		}
	}
	createLines() {
		this.bufferLines = [];
		for (const e of this.elements) {
			this.bufferLines.push(e.line_geometry);
		}
	}
	guiSettingsBasic() {
		if (this.settingsFolder) {
			this.settingsFolder.destroy();
		}
		this.settingsFolder = this.gui.addFolder("Settings");
		this.settingsFolder.add(this.gh, "visible").listen().name("Axis");

		this.settingsFolder
			.add(this, "clickMode", [
				"Inspect element",
				"Delete element",
				"Detect nodes",
				"Detect region",
			])
			.listen()
			.name("Click mode");
		// this.settingsFolder
		// 	.add(this, "theme", themes, "Default")
		// 	.name("Theme")
		// 	.listen()
		// 	.onChange(this.updateTheme.bind(this));
		if (this.example_file_paths) {
			this.settingsFolder
				.add(this, "filename", this.example_file_paths)
				.name("Examples")
				.listen()
				.onChange(this.changeExample.bind(this));
		}
	}

	updatePlot1() {
		let ax = 0;
		let ay = 0;
		let bx = 2 * Math.PI;
		let by = 2 * Math.PI;
		let selected = globalargs["poisson"];
		let n = 30;
		let x = new Array(n);
		let y = new Array(n);
		let z = new Array(n);

		let hx = (bx - ax) / n;
		let hy = (by - ay) / n;

		for (let i = 0; i < n; i++) {
			x[i] = ax + hx * i;
			y[i] = ay + hy * i;
			z[i] = new Array(n);
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let args = { ...globalargs, gamma1: x[i], gamma2: y[j] };
				let value = selected(args);
				if (Math.abs(value) > 10) {
					value = NaN;
				}
				z[i][j] = value;
			}
		}
		var data = [
			{
				z: z,
				x: x,
				y: y,
				type: "contour",
			},
		];

		let layout = {
			plot_bgcolor: "rgba(0,0,0,0)",
			paper_bgcolor: "rgba(0,0,0,0)",
			title: "Poisson ratio",
			xaxis: {
				title: "γ1",
				tickformat: ".3f",
				gridcolor: "rgb(198,194,191)",
			},
			yaxis: {
				title: "γ2",
				tickformat: ".3f",
				gridcolor: "rgb(198,194,191)",
			},
			margin: {
				l: 70, // left margin
				r: 30, // right margin
				b: 50, // bottom margin
				t: 30, // top margin
				pad: 4, // padding between the plotting area and the margins
			},
		};
		Plotly.newPlot(grafica1, data, layout, { responsive: true });
	}
	updatePlot2() {
		let ax = 0;
		let ay = 0;
		let bx = 2 * Math.PI;
		let by = 2 * Math.PI;
		let selected = globalargs["k"];
		let n = 30;
		let x = new Array(n);
		let y = new Array(n);
		let z = new Array(n);

		let hx = (bx - ax) / n;
		let hy = (by - ay) / n;

		for (let i = 0; i < n; i++) {
			x[i] = ax + hx * i;
			y[i] = ay + hy * i;
			z[i] = new Array(n);
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let args = { ...globalargs, gamma1: x[i], gamma2: y[j] };
				let value = selected(args);
				z[i][j] = Math.log10(value);
			}
		}
		var data = [
			{
				z: z,
				x: x,
				y: y,
				type: "contour",
			},
		];

		let layout = {
			plot_bgcolor: "rgba(0,0,0,0)",
			paper_bgcolor: "rgba(0,0,0,0)",
			title: "Log10(Stiffness)",
			xaxis: {
				title: "γ1",
				tickformat: ".3f",
				gridcolor: "rgb(198,194,191)",
			},
			yaxis: {
				title: "γ2",
				tickformat: ".3f",
				gridcolor: "rgb(198,194,191)",
			},
			margin: {
				l: 70, // left margin
				r: 30, // right margin
				b: 50, // bottom margin
				t: 30, // top margin
				pad: 4, // padding between the plotting area and the margins
			},
		};
		Plotly.newPlot(grafica2, data, layout, { responsive: true });
	}

	updatePlots() {
		this.updatePlot1();
		this.updatePlot2();
	}
}
const aelement = document.getElementById("a");
const belement = document.getElementById("b");
const g1element = document.getElementById("g1");
const g2element = document.getElementById("g2");
const betaelement = document.getElementById("beta");
const poissonelement = document.getElementById("poisson_select");
const rangebeta = document.getElementById("range_beta");
const kelement = document.getElementById("k_select");
const container = document.getElementById("container");

const O = new Viewer(container, true);
await O.createPatter();
await O.init(false);
function todo() {
	globalargs["a"] = parseFloat(aelement.value);
	globalargs["b"] = parseFloat(belement.value);
	globalargs["gamma1"] = parseFloat(g1element.value);
	globalargs["gamma2"] = parseFloat(g2element.value);
	globalargs["beta"] = parseFloat(betaelement.value);
	if (poissonelement.value == "0") {
		globalargs["poisson"] = mars.poissonhl;
	} else if (poissonelement.value == "1") {
		globalargs["poisson"] = mars.poissonwl;
	} else {
		globalargs["poisson"] = mars.poissonhw;
	}

	if (kelement.value == "0") {
		globalargs["k"] = mars.stiffnessx;
	} else {
		globalargs["k"] = mars.stiffnessky;
	}
	O.updateCoords();
	O.updatePlots();
}
todo();
aelement.onchange = todo;
belement.onchange = todo;
g1element.onchange = todo;
g2element.onchange = todo;
betaelement.onchange = todo;
poissonelement.onchange = todo;
kelement.onchange = todo;
rangebeta.onmouseup = todo;
rangebeta.oninput = () => {
	betaelement.value = rangebeta.value;
};
function toogleAnimation() {
	O.animate = !O.animate;
	if (!O.animate) {
		O.updateCoords();
		O.updatePlots();
	}
}

document.getElementById("Animation").onclick = toogleAnimation;

console.log(O);
