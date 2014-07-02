
const colourise  = require('./colourise')
const fromStream = require('./generator')
const flotsam    = require('./flotsam')
const shrink     = require('./shrink').shrinkFail
const format     = require('string-template')

const restOf    = flotsam.restOf
const uniqueOf  = flotsam.uniqueOf
const indicesOf = flotsam.indicesOf
const stopwatch = flotsam.stopwatch
const rightPad  = flotsam.rightPad
const match     = flotsam.match
const addSuffix = flotsam.addSuffix
const pluralise = flotsam.pluralise
const tabulate  = flotsam.tabulate








/*
	The core testing function.
*/

const nonLogicalError = function (info, prop, tcase) {
	return format(
		'"{info} {failed}.\n' +
		'The property \n\n' +
		'{prop}\n\n' +
		'returned a non-logical result for the test-case\n\n' +
		'{tcase}', {
			info  : info,
			prop  : prop.toString(),
			tcase : JSON.stringify(tcase)
	})
}


const runTest = function (tester, groups, state, testcase, infos) {

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
				throw nonLogicalError(infos[groupIth][propIth], prop, JSON.stringify(tcase))
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
					state.failedIndices.concat(failedIndex)

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

const propertyError = function (properties, shrunken, testData, state) {

	const after    = state.failsAfter
	const failsFor = state.failsFor
	const indices  = state.failedIndices

	// whichFailed, descriptions are co-ordered.

	const whichFailed = uniqueOf(indices)
	const expressions = whichFailed.map( function (triple) {

		const ith = triple.group
		const jth = triple.property + 1

		return properties[ith][jth].toString()
	})

	const descriptions = whichFailed.map( function (triple) {
		return testData.info[triple.group]
	})
	const frequencies  = tabulate( indices.map(function (triple) {
		return triple.summary
	}) )

	const paragraphs =
		indicesOf(whichFailed)
		.map(function (ith) {

			const expr  = expressions[ith]
			const freq  = frequencies[ith].freq
			const info  = descriptions[ith]
			const tcase = JSON.stringify(shrunken[ith])

			return '"' + info + '"\n' + 'The assertion \n\n' +
				expr +
			'\n\nfailed ' + freq + ' ' + pluralise('time', freq) + '.\n\n' +
			'The simplest failing-case found was ' +
			tcase +
			'\n'

		})
		.reduce(function (acc, current) {
			return acc + '\n\n' + current
		})

	const message = colourise.red('Failed!') +
		' after ' + after + pluralise(' case', after) + '.\n\n' +
		paragraphs + '\n\n'

	throw message
}











/*
	warn that no test-cases were given to some property group.
*/

const exhaustionWarning = function (testData, state, info) {

	const message = format('"{info}" {failed}\n all {examined} test-cases were rejected.', {
		info     : info,
		failed   : colourise.yellow(" Failed!"),
		examined : state.casesExamined
	})

	console.log(message)
}






/*

*/

const successMessage = function (states, infos) {
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

	const out =
		infos
		.map(function (info) {
			return rightPad("'"+ info + "'" + ' passed! ', 80)  + "(" + colourise.green(testsRun) + ")"
		}).
		reduce(function (acc, val) {
			return acc + '\n' + val
		})

	console.log(out)

	return out
}







/*

*/

const holdsWhenTest = function (prop, tcase) {
	// simply call the predicate with the testcase.

	return prop.apply(null, tcase)
}

const worksWhenTest  = function (prop, tcase) {

	try {
		prop.apply(null, tcase)
		return true
	} catch (err) {
		return false
	}

}

const failsWhenTest = function (prop, tcase) {

	try {
		prop.apply(null, tcase)
		return false
	} catch (err) {
		return true
	}
}






/*
	The backend wrapper in which the test is executed.
*/

const executeTest = function (test) {

	// attach the test data to the local environment.

	const info              = test.info
	const params            = test.params
	const time              = test.time

	const holdsWhenProperty = test.holdsWhenProperty || []
	const failsWhenProperty = test.failsWhenProperty || []

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

	var states       = [initialState(),    initialState()]
	const groupTypes = [holdsWhenProperty, failsWhenProperty]
	const testers    = [holdsWhenTest,     failsWhenTest]

	var timeLeft   = stopwatch(time)

	/*
		execute the tests and collect statistics on the failures.
	*/

	var len = 0

	while (timeLeft()) {

		Math.random() > 0.9? len++: len

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

		var group  = groupTypes[ith]
		var state  = states[ith]
		var tester = testers[ith]

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

			var uniqueFails = uniqueOf(state.failedIndices)

			var shrunken = uniqueFails.map(function (indices) {

				const failProp = group[indices.group][indices.property + 1]

				return shrink(tester, {
					failPred : group[indices.group][0],
					failProp : failProp
				}, state.failsFor)
			})

			propertyError(group, shrunken, testData, state)
		}


	}

	successMessage(states, info)
}





/*

*/







/*

*/

module.exports = executeTest
