

function clamp(val, lim)
{
	return Math.min(Math.max(val, -lim), lim)
}

export { clamp }