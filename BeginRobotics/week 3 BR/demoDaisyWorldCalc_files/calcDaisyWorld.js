// functions to calculate daisyworld

var pointsmax = 100
var stefansConst = 0.56686E-7
var solarLuminosity = 9.426846E-4
var albedoToTemperature = 2.06425E9
var deltaL = 0.009
var fluxConstant = 9.17E5
var proportionFertile = 1.00
var deathrate = 0.3
var steptime = 0.25
var maxSpecies = 10


function daisySpecies() {
	this.area = 1.0
	this.albedo = 0.5
	this.temperature = 0.001
	this.birthrate = 0.9
	this.deathrate = 0.1
	this.delta = 0.01
	this.data = []
	this.simulate = simulate
	
	function simulate (fertilearea, tempPow4, planetAlbedo) {
	var tempv = albedoToTemperature * (planetAlbedo - this.albedo) + tempPow4
		this.temperature = Math.sqrt(Math.sqrt(tempv))-273
		this.birthrate = 1 - 0.003265*(22.5-this.temperature)*(22.5-this.temperature)
		this.delta = this.area* (fertilearea*this.birthrate - this.deathrate)
		this.area += this.delta * steptime
		if (this.area<0.01) this.area = 0.01
		else if (this.area > 1000) this.area = 1000
	}	
}

function daisyWorld() {
	this.numSpecies = 2
	this.timeScale = []
	this.worldtemp = []
	this.nolifetemp = []
	this.totalDaisies = []
	this.luminosity = 0
	this.planetAlbedo = 100
	this.tempPow4 = 100
	this.fertilearea = 0
	this.minAlbedo = 0.1
	this.maxAlbedo = 0.9
	this.daisies = []
	for (var ct = 0; ct< maxSpecies; ct++) this.daisies[ct] = new daisySpecies()
	this.initRun = initRun
	this.simulate = simulate
	this.calculate = calculate
	this.inTransient = inTransient
	
function initRun (numS, maxA, minA) {
   this.minAlbedo = minA
   this.maxAlbedo = maxA
   this.numSpecies = numS+1
   this.daisies[0].albedo = 0.5 // grey soil	
   for (var ct=1; ct<this.numSpecies; ct++) {
		this.daisies[ct].area = 0.01
		this.daisies[ct].temperature = 0.001
		if (ct==1) this.daisies[ct].albedo = this.minAlbedo
		else this.daisies[ct].albedo = this.minAlbedo + (this.maxAlbedo-this.minAlbedo) * (ct-1) / (this.numSpecies-2)
   }	   
}	

function simulate() {
var sumDaisy = 0
var lumValue = 0
	this.luminosity = 0.6*solarLuminosity
	for (ct = 0; ct < pointsmax; ct++) {
		lumValue = (this.luminosity - 0.6*solarLuminosity) * 1000.0
		this.calculate(ct)
		sumDaisy = 0
		for (var dct=1; dct<this.numSpecies; dct++) {
			sumDaisy += this.daisies[dct].area
		}
		this.totalDaisies[ct] = sumDaisy
		this.luminosity += solarLuminosity*deltaL
	}	
}

function inTransient(lct) {
var ok 
	if (lct > 1000) ok = false    // was 1000
	else {
		ok = false
		for (var ct = 1; ct<this.numSpecies; ct++) {
			if (this.daisies[ct].delta > 0.0001) ok = true    // was 0.001
		}	
	}	
	return ok
}

	
function calculate(iter) {
var ct, lct = 0
	for (ct = 1; ct<this.numSpecies; ct++) this.daisies[ct].area = 0.01
	do {
		lct++
		this.daisies[0].area = 1.0
		for (ct=1; ct<this.numSpecies; ct++) this.daisies[0].area -= this.daisies[ct].area
		
		this.fertilearea = proportionFertile
		for (ct=1; ct<this.numSpecies; ct++) this.fertilearea -= this.daisies[ct].area

		this.planetAlbedo = 0
		for (ct=0; ct<this.numSpecies; ct++) this.planetAlbedo += this.daisies[ct].area *this.daisies[ct].albedo
		
		this.tempPow4 = fluxConstant * this.luminosity * 0.5 / stefansConst
		this.nolifetemp[iter] = Math.sqrt(Math.sqrt(this.tempPow4)) - 273
		this.tempPow4 = fluxConstant * this.luminosity * (1-this.planetAlbedo) / stefansConst
		this.worldtemp[iter] = Math.sqrt(Math.sqrt(this.tempPow4)) - 273
		
		for (ct=1; ct<this.numSpecies; ct++) this.daisies[ct].simulate(this.fertilearea, this.tempPow4, this.planetAlbedo)
		
		
	} while (this.inTransient(lct))
	this.timeScale[iter] = iter	
	for (ct=0; ct<this.numSpecies; ct++) this.daisies[ct].data[iter] = this.daisies[ct].area
}
	
}


