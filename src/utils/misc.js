
function nearestAngle(start, to) 
{
	var angle1 = start - 360;
	var angle2 = start
	var angle3 = start + 360
	var diff1 = Math.abs(angle1 - to)
	var diff2 = Math.abs(angle2 - to)
	var diff3 = Math.abs(angle3 - to)
	var min = Math.min(diff1, diff2, diff3)
	if (min == diff1) start = angle1
	if (min == diff3) start = angle3
	return start
}

function lerpAngles(start, to, lerp) 
{
	var start = nearestAngle(start, to)
	return (1.0-lerp)*start + lerp*to
}

function clamp(val, lim)
{
	return Math.min(Math.max(val, -lim), lim)
}

export { clamp, nearestAngle, lerpAngles }