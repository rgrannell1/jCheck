
const getMethod   = require('genOO').getMethod
const Categoriser = require('genOO').Categoriser
const is          = require('is')

const K          = require('./flotsam').K





var _score = ( function () {

	var self = {}

	self.string = function (val) {
		return val.length
	}

	self.number = function (val) {

		if (!isFinite(val) || Math.abs(val) > 100000000) {
			// must always return a finite value to be mutatable.
			return 100000000
		} else {
			return Math.abs(val)
		}
	}

	self.array = function (val) {

		// score is n + E (val[ith] / n)

		const len = val.length

		return len + val
			.map(function (a) {return score(a) / len})
			.reduce(function (a, b) {return a + b}, 0)
	}

	self.object = function (val) {

		// score is n + E (val[ith] / n)

		const len = Object.keys(val).length

		return len + Object.keys(val)
			.map(function (key) {return score(val[key]) / len})
			.reduce(function (a, b) {return a + b}, 0)
	}

	self.default = K(Infinity)

	return self

})()





const _scoreCategory = Categoriser([
	{string : is.string},
	{number : is.number},
	{array  : is.array },
	{object : is.object},
	{default: K(true)  }
])

const score = function (val) {
	return getMethod(_scoreCategory, _score, val)(val)
}





module.exports = {
	score          : score,
	_score         : _score,
	_scoreCategory : _scoreCategory,
}
