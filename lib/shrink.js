
const getMethod   = require('genOO').getMethod
const Categoriser = require('genOO').Categoriser
const is          = require('is')

const repeat      = require('./flotsam').repeat
const stopwatch   = require('./flotsam').stopwatch
const oneOf       = require('./flotsam').oneOf
const indicesOf   = require('./flotsam').indicesOf
const K           = require('./flotsam').K

const score       = require('./score').score







































const shouldContinue = function (scores) {

	var dScore = []

	for (var ith = 0; ith < scores.length-1; ith++) {
		dScore[ith] = scores[ith + 1] - scores[ith]
	}

	return score
}












/*
	A generalised genetic algorithm.
*/

const GA = function (pop, mutate, score) {

	if (pop.length > 100) {
		var pop = pop.slice(0, 99)
	}

	var scores     = []
	const timeLeft = stopwatch(0.5)

	while (timeLeft() && shouldContinue(scores)) {

		var bestScored =
			 pop
			.map(function (member) {
				return [member, score(member)]
			})
			.reduce(function (best, current) {
				return current[1] < best[1]? current: best
			})

		var best  = bestScored[0]
		scores.push(bestScored[1])

		var pop =
			repeat(10, best)
			.map(mutate)
			.concat([best])

	}

	return best
}








const checkPredicate = function (pred, tcase) {

	if (is.function(pred)) {
		// simply apply the test case to the predicate.

		return pred.apply(null, tcase)

	} else if (is.array(pred)) {
		// check each predicate element-wise.

		for (var ith = 0; ith < pred; ith++) {

			var elem = tcase[ith]

			if ( !pred[ith](elem) ) {
				return false
			}
		}

		return true

	} else {
		throw "predicate was not an array or function."
	}
}

const shrinkFail = function (tester, prop, tcases) {

	return GA(tcases, mutate, function (tcase) {

		// the property still returns false.
		const stillFails = !tester(prop.prop, tcase)

		// the test-case still satisfies the predicates.
		const stillValid = checkPredicate(prop.pred, tcase)

		return stillFails && stillValid? score(tcase): Infinity
	})

}





module.exports = shrinkFail
