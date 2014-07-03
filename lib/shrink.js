
const getMethod   = require('genOO').getMethod
const Categoriser = require('genOO').Categoriser
const is          = require('is')

const repeat      = require('./flotsam').repeat
const stopwatch   = require('./flotsam').stopwatch




var _remove = {}

_remove.number = function (val) {

	const digits = val.toString().split('')

	const toRemove = Math.floor(Math.random() * digits.length)

	var out = ['0']

	for (var ith = 0; ith < digits.length; ith++) {
		if (ith !== toRemove) {
			out.push(digits[ith])
		}
	}

	const parsed = parseInt(out.join(''), 10)

	return parsed
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

	if (val.length > 0) {
		for (var ith = 0; ith < val.length; ith++) {
			if (ith !== toRemove) {
				out.push(val[ith])
			}
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

const _removeCategory = Categoriser([
	{default: function (x) {
		return !isFinite(x)
	}},
	{default: function (x) {
		return x !== x
	}},
	{number : is.number},
	{string : is.string},
	{array  : is.array },
	{object : is.object},
	{default: function (x) {
		return true
	}}
])

const remove = ( function () {

	return function (val) {

		const mutant = getMethod(_removeCategory, _remove, val)(val)
		return mutant
	}

} )()







/*

*/
var _substitute = {}

_substitute.number = function (val) {
	// substitute a digit of the number.

	const digits    = val.toString().split('')
	const toReplace = Math.floor(Math.random() * digits.length)

	digits[toReplace] = '0123456789'.charAt(Math.random() * 10)

	return parseInt(digits.join(''), 10)
}

_substitute.nan = function (val) {

	const out = Math.random	() * 10000 * (Math.random() - 1)
	return out
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

	return val
}

_substitute.default = function (val) {
	// default to identity.

	return val
}

const _substituteCategory = Categoriser([
	{nan    : function (num) {return num != num}},
	{number : is.number},
	{string : is.string},
	{array  : is.array },
	{object : is.object},
	{default: function (x) {
		return true
	}}
])

const substitute = ( function () {

	return function (val) {


		const mutant = getMethod(_substituteCategory, _substitute, val)(val)

		return mutant
	}

} )()







/*
	A general mutation function for a genetic algorithm, which
	reduces the size or magnitude of an input.
*/

const mutate = function (coll) {

	const mutator  = [remove, substitute][Math.floor(Math.random() * 2)]
	const toMutate = Math.floor(Math.random() * coll.length)

	coll[toMutate] = mutator(coll[toMutate])

	return coll
}











/*
	Score a value by its magnitude.
*/

var _score = {}

_score.string = function (val) {
	// todo; add per-character scoring too.

	return val.length
}

_score.number = function (val) {

	if (!isFinite(val) || Math.abs(val) > 100000000) {
		return 100000000
	} else if (val !== val) {
		return 100000000
	} else {
		return Math.abs(val)
	}
}

_score.array = function (val) {
	return val.reduce(function (acc, current) {
		return acc + score(current)
	}, 0)
}

_score.object = function (val) {
	return object.length
}

_score.default = function (val) {
	return 0
}

const _scoreCategory = Categoriser([
	{number : is.number},
	{string : is.string},
	{array  : is.array },
	{object : is.object},
	{default: function (x) {
		return true
	}}
])

const score = ( function () {

	return function (val) {

		const scoreNum = getMethod(_scoreCategory, _score, val)(val)

		return scoreNum
	}

} )()













const shouldContinue = function (scores) {

	var derivaties = []
	for (var ith = 0; ith < scores.length-1; ith++) {
		derivaties[ith] = scores[ith+1] - scores[ith]
	}

	return score
}

/*
	A generalised genetic algorithm.
*/

const GA = function (population, mutate, score) {

	/*
		use an initial population for better initial variation.
	*/

	if (population.length > 100) {
		var population = population.slice(0, 99)
	}

	var scores     = []
	const timeLeft = stopwatch(0.5)

	while (timeLeft() && shouldContinue(scores)) {

		var bestScored =
			 population
			.map(function (member) {
				return [member, score(member)]
			})
			.reduce(function (best, current) {
				return current[1] < best[1]? current: best
			})

		best   = bestScored[0]
		scores.push(bestScored[1])

		var population =
			repeat(10, best)
			.map(mutate)
			.concat([best])

	}

	return best
}











module.exports = {
	shrinkFail: function (tester, prop, tcase) {

		return GA(tcase, mutate, function (tcase) {

			const stillFails = !tester(prop.failProp, tcase)
			const stillValid = prop.failPred.apply(null, tcase)

			return stillFails && stillValid? score(tcase): Infinity
		})

	},
	_remove    : _remove,
	_substitute: _substitute,
	_score     : _score,

	remove    : remove,
	substitute: substitute,
	score     : score,

	_removeCategory    : _removeCategory,
	_scoreCategory     : _scoreCategory,
	_substituteCategory: _substituteCategory
}
