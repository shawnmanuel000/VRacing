import "./src/assets/style.css"
import { Viewer } from "./src/viewer.js"
import { Track } from "./src/track.js"

const track = new Track()
const viewer = new Viewer(track.boundaries);
run();

function run()
{
	viewer.render();
	requestAnimationFrame(run);
}
