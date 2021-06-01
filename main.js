import "./src/assets/style.css"
import { Viewer } from "./src/envs/CarRacing/viewer.js"
import { Track } from "./src/envs/CarRacing/track.js"
import { CarDynamics } from "./src/envs/CarRacing/dynamics.js"

const dynamics = new CarDynamics()
const track = new Track()
const viewer = new Viewer(track.boundaries);
run();

var state = dynamics.reset([1.54, 2.28, Math.PI/2], 0.1).state

function run()
{
	let action = viewer.getViewerAction()
	state = dynamics.step(action).state
	viewer.render(state);
	requestAnimationFrame(run);
}
