import "./src/assets/style.css"
import { Viewer } from "./src/envs/CarRacing/viewer.js"
import { Track } from "./src/envs/CarRacing/track.js"

const track = new Track()
const viewer = new Viewer(track.boundaries);
run();

function run()
{
	// console.log(viewer.getViewerAction())
	viewer.render();
	requestAnimationFrame(run);
}
