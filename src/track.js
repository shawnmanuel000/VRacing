import curveTrack from "./assets/models/curve.csv"

class Track
{
	constructor()
	{
		const points = []
		const lines = curveTrack.split('\n')
		for (let i = 0; i < lines.length; i++) {
			if(lines[i] === "") continue;
			const fields = lines[i].split(',')
			const vals = fields.map(parseFloat)
			points.push(vals)
		}
		this.trackname = "curve"
		this.track = nj.array(points)
		this.boundaries = compute_boundaries(this.track, 15)
		// this.lines = fetch("/models/curve.csv").then(res => res.text())
	}

}

function compute_boundaries(points, width) 
{
	const shape = points.shape
	const left_boundary = nj.zeros(shape)
	const right_boundary = nj.zeros(shape)
	let first = points.slice([0,1],null) 
	let second = points.slice([1,2],null)
	let grad = second.subtract(first)
	let gradnorm, normal, newgrad, avggrad, left, right
	for (let i = 0; i < shape[0]-1; i++) {
		first = points.slice([i,i+1],null) 
		second = points.slice([i+1,i+2],null)
		newgrad = second.subtract(first)
		avggrad = newgrad.add(grad).divide(2)
		gradnorm = Math.sqrt(avggrad.pow(2).sum())
		normal = nj.array([[-avggrad.get(0,1),avggrad.get(0,0)]]).divide(gradnorm)
		left = first.add(normal.multiply(width))
		right = first.subtract(normal.multiply(width))
		left_boundary.slice([i,i+1],null).assign(left, false)
		right_boundary.slice([i,i+1],null).assign(right, false)
		grad = newgrad
	}
	gradnorm = Math.sqrt(newgrad.pow(2).sum())
	normal = nj.array([[-newgrad.get(0,1),newgrad.get(0,0)]]).divide(gradnorm)
	left = first.add(normal.multiply(width))
	right = first.subtract(normal.multiply(width))
	left_boundary.slice([shape[0]-1,shape[0]],null).assign(left, false)
	right_boundary.slice([shape[0]-1,shape[0]],null).assign(right, false)
	const boundaries = nj.stack([left_boundary,right_boundary], shape.length-1)
	return boundaries
}

export { Track }