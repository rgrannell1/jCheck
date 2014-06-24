
/*

*/

const getMethod   = require('genOO').getMethod
const Categoriser = require('genOO').Categoriser
const is          = require('is')

const stopwatch = function (num) {

	const posixTime = function () {

		return Math.round((new Date).getTime() / 1000.0)
	}

	const genesis = posixTime()

	return function () {

		const lifespan  = posixTime() - genesis
		return lifespan < num

	}
}



const remove = ( function () {

	var _remove = {}

	_remove.number = function (val) {

		const digits = val.split('')

		const toRemove = Math.floor(Math.random() * digits.length)

		var out = []
		for (var ith = 0; ith < digits.length; ith++) {
			if (ith !== toRemove) {
				out.push(val[ith])
			}
		}
		return parseInt(out.join(''), 10)
	}
	_remove.string = function (val) {

		const chars = val.split('')

		const toRemove = Math.floor(Math.random() * chars.length)

		var out = []
		for (var ith = 0; ith < chars.length; ith++) {
			if (ith !== toRemove) {
				out.push(val[ith])
			}
		}
		return out.join('')
	}

	_remove.array  = function (val) {

		const toRemove = Math.floor(Math.random() * val.length)

		var out = []
		for (var ith = 0; ith < val.length; ith++) {
			if (ith !== toRemove) {
				out.push(val[ith])
			}
		}
		return out
	}

	_remove.object = function (val) {

		const keys     = Object.keys(val)
		const toRemove = Math.floor(Math.random() * keys.length)

		delete val[keys[toRemove]]
		return val
	}

	_remove.default = function (val) {
		return val
	}

	return function (val) {

		const _removeCategory = Categoriser([
			{number : is.number},
			{string : is.string},
			{array  : is.array },
			{object : is.object},
			{default: function (x) {
				return true
			}}
		])

		return getMethod(_removeCategory, _remove, val)(val)
	}

} )()







/*

*/

const substitute = ( function () {

	var _substitute = {}

	_substitute.number = function (val) {
		// substitute a digit of the number.

		const digits    = val.toString().split('')
		const toReplace = Math.floor(Math.random() * digits.length)

		digits[toReplace] = '0123456789'.charAt(Math.random() * 10)

		return parseInt(digits.join(''), 10)
	}

	_substitute.string = function (val) {
		// substitute a character of the number.

		const alphanumeric =
			'abcdefghijklmnopqrstuvwxyz' +
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
			'0123456789'

		const chars     = val.toString().split('')
		const toReplace = Math.floor(Math.random() * chars.length)

		chars[toReplace] = alphanumeric.charAt(Math.random() * alphanumeric.length)

		return chars.join('')
	}

	_substitute.array  = function (val) {
		// substitute an element of an array.

		const toReplace = Math.floor(Math.random() * val.length)
		val[toReplace] = substitute(val[toReplace])

		return val
	}

	_substitute.object = function (val) {
		// substitute an element of an object.

	}

	_substitute.default = function (val) {
		// default to identity.

		return val
	}

	return function (val) {

		const substituteCategory = Categoriser([
			{number : is.number},
			{string : is.string},
			{array  : is.array },
			{object : is.object},
			{default: function (x) {
				return true
			}}
		])

		return getMethod(substituteCategory, _substitute, val)(val)

	}

} )()







/*
	A general mutation function for a genetic algorithm, which
	reduces the size or magnitude of an input.
*/

const mutate = function (val) {
	return [mutate, substitute][Math.floor(Math.random() * 2)](val)
}











/*
	Score a value by its magnitude.
*/

const score = ( function () {

	var _score = {}

	_score.string = function (val) {
		// todo; add per-character scoring too.

		return val.length
	}

	_score.number = function (val) {
		return Math.abs(val)
	}

	_score.array = function (val) {
		return val.length * val.reduce(function (acc, current) {
			return acc + score(current)
		}, 0)
	}

	_score.object = function (val) {
		return object.length
	}

	_score.default = function (val) {
		return 0
	}

	return function (val) {

		const scoreCategory = Categoriser([
			{number : is.number},
			{string : is.string},
			{array  : is.array },
			{object : is.object},
			{default: function (x) {
				return true
			}}
		])

		return getMethod(scoreCategory, _score, val)(val)

	}

} )()















const repeat = function (num, val) {
	var out = []
	for (var ith = 0; ith < num; ith++) {
		out[ith] = val
	}
	return out
}





/*
	A generalised genetic algorithm.
*/

const GA = function (first, mutate, score) {

	const scorePercentDt = function (coll) {
		// get the percentage change over up to five steps.

		return 2
	}

	var best    = first
	var scores  = [-Infinity]

	const timeLeft = stopwatch(1)

	while (scorePercentDt(scores) > 1 && timeLeft()) {

		var population =
			repeat(10, best)
			.map(mutate)
			.concat(best)

		var scored =
			 population
			.map(function (member) {
				return [member, score(member)]
			})

		var bestScored =
			scored
			.reduce(function (best, current) {
				return current[1] < best[1]? current: best
			})

		var best   = bestScored[0]
		scores.push(bestScored[1])

		console.log(best)

	}

	return best
}


console.log( GA(10000000, mutate, score) )