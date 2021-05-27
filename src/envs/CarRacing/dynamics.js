import { clamp } from "../../utils/misc.js"


const USE_DELTA = true
const DELTA_T = 0.05
const TURN_SCALE = 0.1
const PEDAL_SCALE = 1.0
const TURN_LIMIT = 0.025
const PEDAL_LIMIT = 1.0
const MI_TO_KM = 1.60934
const KMPH_TO_MPS = 1/3.6
const FT_TO_M = 0.3048

const constants =
{
	m: 2000.0, 
	I_zz: 3764.0, 	
	h_cm: 0.3,	 	
	l_f: 1.53, 	
	l_r: 1.23, 	
	C_D0: 241, 	
	C_D1: 25.1, 	
	C_αf: 150000.0, 
	C_αr: 280000.0, 
	μ_f: 1.6, 		
	μ_r: 1.6, 		
}

var CarState = function(X, Y, ψ, Vx, Vy, S, ψ̇, δ, pedals)
{
	this.X = X !== undefined ? X : 0.0
	this.Y = Y !== undefined ? Y : 0.0
	this.ψ = ψ !== undefined ? ψ : 0.0
	this.Vx = Vx !== undefined ? Vx : 0.0
	this.Vy = Vy !== undefined ? Vy : 0.0
	this.S = S !== undefined ? S : 0.0
	this.ψ̇ = ψ̇  !== undefined ? ψ̇  : 0.0
	this.δ = δ !== undefined ? δ : 0.0
	this.pedals = pedals !== undefined ? pedals : 0.0
	// this.info = info !== undefined ? info : {}
}

var TireModel = function()
{
	this.name = "x1"

	this.calcFAero = function(Vx, C0, C1)
	{
		return C0 + C1*Vx
	}

	this.calcFz = function(Fx, m, h_cm, l, L)
	{
		return (m*l*9.81 + h_cm*Fx)/L
	}

	this.calcFy = function(α, μ, C_α, F_Z, F_X)
	{
		let Fy_max = Math.sqrt(Math.pow(μ*F_Z,2) - Math.pow(F_X,2))
		return Math.abs(α) < Math.atanh(3*Fy_max/C_α) 
			? -C_α*Math.tan(α) + C_α*C_α/(3*Fy_max)*Math.abs(Math.tan(α))*Math.tan(α) - Math.pow(C_α,3)/(27*Fy_max*Fy_max)*Math.pow(Math.tan(α),3) 
			: -Fy_max*Math.sign(α)
	}

}

var CarDynamics = function()
{
	this.tireModel = new TireModel()
	this.state = new CarState()

	this.reset = function(startPos, startVel)
	{
		this.state = new CarState(startPos[0], startPos[1], startPos[2], startVel)
		return this
	}

	this.step = function(action, dt=DELTA_T, integrationSteps=1, useDelta=USE_DELTA)
	{
		const turnRate = action[0]
		const pedalRate = action[1]
		dt = dt/integrationSteps
		let state = this.state
		const turnLimit = TURN_LIMIT*Math.pow(Math.min(50/state.Vx,2), 2)
		const FyScale = Math.min(Math.abs(state.Vx), 1)
		
		for (let i = 0; i < integrationSteps; i++)
		{
			let δ = useDelta ? clamp(state.δ + clamp(turnRate*TURN_SCALE-state.δ, turnLimit) * dt, turnLimit) : turnRate*turnLimit
			let αf = Math.atan2((state.Vy + constants.l_f * state.ψ̇),state.Vx) - δ
			let αr = Math.atan2((state.Vy - constants.l_r * state.ψ̇),state.Vx) + 0.0
			
			let pedals = useDelta ? clamp(state.pedals + clamp(pedalRate*PEDAL_SCALE-state.pedals, PEDAL_LIMIT) * dt, PEDAL_LIMIT) : pedalRate*PEDAL_LIMIT
			let accel = 4000 * Math.max(pedals, 0)
			let brake = Math.min(pedals, 0)*22500*(this.state.Vx > 0)

			let F_X_Aero = this.tireModel.calcFAero(state.Vx, constants.C_D0, constants.C_D1)

			let FxF = brake * 0.6
			let FxR = accel+brake*0.4
			let FzF = this.tireModel.calcFz(FxF, constants.m, constants.h_cm, constants.l_f, constants.l_f+constants.l_r)
			let FzR = this.tireModel.calcFz(FxR, constants.m, constants.h_cm, constants.l_r, constants.l_f+constants.l_r)
			let FyF = this.tireModel.calcFy(αf, constants.μ_f, constants.C_αf, FzF, FxF) * FyScale
			let FyR = this.tireModel.calcFy(αr, constants.μ_r, constants.C_αr, FzR, FxR) * FyScale
			
			let ψ̈ = (1/constants.I_zz) * ((2*FxF*Math.sin(δ) + 2*FyF*Math.cos(δ))*constants.l_f - 2*FyR*constants.l_r)
			let V̇x = (1/constants.m) * (2*FxF*Math.cos(δ) - 2*FyF*Math.sin(δ) + 2*FxR - F_X_Aero) + state.ψ̇ * state.Vy
			let V̇y = (1/constants.m) * (2*FyF*Math.cos(δ) + 2*FxF*Math.sin(δ) + 2*FyR) - state.ψ̇ * state.Vx
			
			let ψ̇ = FyScale * (state.ψ̇ + ψ̈  * dt)
			let Vx = Math.max(state.Vx + V̇x * dt, 0)
			let Vy = FyScale * (state.Vy + V̇y * dt)
			let V = Math.sqrt(Vx**2 + Vy**2)

			let β = Math.atan2(Vy,Vx)
			let ψ = (state.ψ + ψ̇  * dt)
			let X = (state.X + (Vx * Math.cos(ψ) - Vy * Math.sin(ψ)) * dt)
			let Y = (state.Y + (Vy * Math.cos(ψ) + Vx * Math.sin(ψ)) * dt)
			let S = (state.S*1000 + V * dt)/1000
			ψ = Math.atan2(Math.sin(ψ), Math.cos(ψ))

			let info = {F_X_Aero, yaw_acc:ψ̈ , vx_dot:V̇x, vy_dot:V̇y, V:V, β:β, αf:αf, αr:αr, FxF:FxF/1000, FxR:FxR/1000, FyF:FyF/1000, FyR:FyR/1000, FzF:FzF/1000, FzR:FzR/1000, gear:0}
			state = new CarState(X,Y,ψ,Vx,Vy,S,ψ̇,δ,pedals,info)
		}
		this.state = state
		return this
	}
}

export { CarDynamics }
