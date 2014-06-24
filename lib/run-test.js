
const colourise  = require('./colourise')
const fromStream = require('./generator')
const flotsam    = require('./flotsam')

const restOf    = flotsam.restOf
const uniqueOf  = flotsam.uniqueOf
const indicesOf = flotsam.indicesOf
const stopwatch = flotsam.stopwatch
const rightPad  = flotsam.rightPad
const match     = flotsam.match
const addSuffix = flotsam.addSuffix
const pluralise = flotsam.pluralise










/*
	The core testing function.
*/

const runTest = function (tester, groups, state, testcase, info) {

	for (var groupIth = 0; groupIth < groups.length; groupIth++) {

		var group = groups[groupIth]

		var groupPred  = group[0]
		var groupProps = restOf(group)

		var isMatch = groupPred.apply(null, testcase)

		state.casesExamined += 1

		if (!isMatch) {
			continue
		}

		state.testsRun += 1

		/*
			the predicate for this group was true; test each associated
			property.
		*/

		for (var propIth = 0; propIth < groupProps.length; propIth++) {

			var prop    = groupProps[propIth]
			var hasProp = tester(prop, testcase)

			// the result of the predicate was non-boolean.
			if (hasProp !== true && hasProp !== false) {
				var message =
					info + '\n' +
					colourise.red('Failed!') +
					' the property returned a non-logical result\n' +
					'For the test-case '

				throw message
			}

			if (!hasProp) {

				// note the earliest fail.
				state.failsAfter =
					Math.min(state.failsAfter, state.testsRun)

				// store the failed cases.
				state.failsFor =
					state.failsFor.concat([testcase])

				// store the index of the failed properties.

				var failedIndex = {
					group    : groupIth,
					property : propIth,
					summary  : groupIth + ', ' + propIth
				}

				state.failedIndices =
					[state.failedIndices, [failedIndex]]

			}
		}

	}

	return state
}











/*
	Generate bindings for each random variable.

	@param {[string]} strs. The parametres to be bound to a random value.
	@param {number} num. The length or order of the random value to be
	    generated.
*/

const yieldCase = function (strs, num) {

	return strs.map(function (param) {
		return fromStream(num)
	})

}











/*

*/

const propertyError = function (properties, testData, state) {

	const after    = state.failsAfter
	const failsFor = state.failsFor
	const indices  = state.failedIndices

	// whichFailed, descriptions are co-ordered

	const whichFailed = uniqueOf(indices)

	const expressions = whichFailed.map( function (triple) {

		const ith = triple.group
		const jth = triple.property + 1

	})

	const descriptions = whichFailed.map( function (triple) {
		testData.info[triple.group]
	})

	const paragraphs = 1

	const message = colourise.red('failed! After ' + addSuffix(after) + pluralise(' case', after) + '.')

	throw message
}











/*
	warn that no test-cases were given to some property group.
*/

const exhaustionWarning = function (testData, state, info) {

	const run      = state.testsRun
	const examined = state.casesExamined

	const message =
		info + colourise.yellow(" Failed!\n") +
		"all " + examined + " test cases were rejected."

}







/*

*/

const successMessage = function (states, info) {
	/*
		for each state object get the number of
		tests of that type run, convert to .csv
	*/

	const testsRun =
		states
		.map(function (state) {
			return state.testsRun + '/' + state.casesExamined
		})
		.reduce(function (acc, val) {
			return acc + ', ' + val
		})

	const message =
		rightPad("'"+ info + "'" + ' passed! ', 80)  + "(" + colourise.green(testsRun) + ")"

	console.log(message)
}







/*

*/

const holdsWhenTest = function (prop, testcase) {
	// simply call the predicate with the testcase.

	return prop.apply(null, testcase)
}






/*
	ensure that the test being passed to run
	can be executed properly.
*/
const validateTest = function (test) {

	// throw an error if any fields are missing.
	;['info', 'params', 'time'].forEach(function (key) {

		if (!test.hasOwnProperty(key)) {
			var message =
				"the property '" + key + "' was missing from the test object."

			throw colourise.red(message)
		}
	})

	// time mustn't be NaN
	if (test.time !== test.time) {

		var message =
			'time must not be NaN.'

		throw colourise.red(message)
	}

	// time definitely mustn't be Infinite
	if (!isFinite(test.time)) {

		var message =
			'time must not be infinite.'

		throw colourise.red(message)
	}

	// time must be positive
	if (test.time < 0) {
		var message =
			'time must be positive.'

		throw colourise.red(message)
	}

	return true
}

/*
	The backend wrapper in which the test is executed.
*/

const executeTest = function (test) {

	validateTest(test)

	// attach the test data to the local environment.

	const info              = test.info
	const params            = test.params
	const time              = test.time
	const holdsWhenProperty = test.holdsWhenProperty

	const initialState = function () {
		return {
			casesExamined : 0,
			testsRun      : 0,
			failsFor      : [],
			failsAfter    : Infinity,
			failedIndices : []
		}
	}




	// each test subtype has its own state, tester and property group.

	var states       = [initialState()]
	const groupTypes = [holdsWhenProperty]
	const testers    = [holdsWhenTest]





	var timeLeft   = stopwatch(time)

	/*
		execute the tests and collect statistics on the failures.
	*/

	var len = 0

	while (timeLeft()) {

		len++
		var testcase = yieldCase(params, Math.ceil(len / 20))

		for (var ith = 0; ith < states.length; ith++) {

			var test  = testers[ith]
			var group = groupTypes[ith]
			var state = states[ith]

			runTest(test, group, state, testcase, info)
		}

	}

	// additional data needed to report success or failure.

	const testData = {
		info: info,
		time: time
	}

	/*
		Check that the correct number of tests were run, and
		that none of the tests fail.
	*/

	for (var ith = 0; ith < states.length; ith++) {

		var group = groupTypes[ith]
		var state = states[ith]

		if (group.length > 0 && state.testsRun === 0) {
			/*
				No tests were run for a particular test group.
				Warn the user about this fact.
			*/
			exhaustionWarning(testData, state, info)
		}

		if (state.failsFor.length > 0) {
			/*
				Throw errors for this particular group.
			*/

			propertyError(group, testData, state)
		}


	}

	successMessage(states, info)
}





/*

*/







/*

*/

const shrinkFail = function (tcase) {


}


module.exports = executeTest
