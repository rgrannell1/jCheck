
const colourise  = require('./colourise')
const fromStream = require('./generator')
const flotsam    = require('./flotsam')
const shrink     = require('./shrink').shrinkFail
const format     = require('string-template')

const restOf     = flotsam.restOf
const uniqueOf   = flotsam.uniqueOf
const indicesOf  = flotsam.indicesOf
const stopwatch  = flotsam.stopwatch
const rightPad   = flotsam.rightPad
const match      = flotsam.match
const addSuffix  = flotsam.addSuffix
const pluralise  = flotsam.pluralise
const tabulate   = flotsam.tabulate
const repeat     = flotsam.repeat
const flatMap    = flotsam.flatMap
const atKey      = flotsam.atKey








/*
	The core testing function.
*/

const nonLogicalError = function (info, prop, tcase) {
	return format(
		'"{info} {failed}.\n' +
		'The property \n\n' +
		'{prop}\n\n' +
		'returned a non-logical result for the test-case\n\n' +
		'{tcase}\n', {
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

		state.casesExamined[groupIth] += 1

		if (!isMatch) {
			continue
		}

		state.testsRun[groupIth] += 1

		/*
			the predicate for this group was true; test each associated
			property.\
		*/

		for (var propIth = 0; propIth < groupProps.length; propIth++) {

			var prop    = groupProps[propIth]
			var hasProp = tester(prop, testcase)

			// the result of the predicate was non-boolean.
			if (hasProp !== true && hasProp !== false) {
				throw nonLogicalError(
					infos[groupIth][propIth], prop, JSON.stringify(tcase))
			}

			if (!hasProp) {

				// note the earliest fail.
				state.failsAfter =
					state.testsRun
					.reduce(Math.min, state.failsAfter)

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

const propertyError = function (props, shrunken, testData, state) {

	const after    = state.failsAfter
	const indices  = state.failedIndices

	// whichFailed, descriptions, expressions are co-ordered.

	const whichFailed = uniqueOf(indices)
	const expressions = whichFailed.map( function (triple) {

		const ith = triple.group
		const jth = triple.property + 1

		return props[ith][jth].toString()
	})

	const descriptions = whichFailed.map( function (triple) {
		return testData.info[triple.group]
	})
	const frequencies  = tabulate( indices.map(atKey('summary')) )

	const paragraphs =
		indicesOf(whichFailed)
		.map(function (ith) {

			return format(
				'"{info}"\n' +
				'The assertion\n\n' +
				'{prop}' +
				'\n\nfailed {freq} {times}.\n\n' +
				'{tcase}\n', {

				info  : descriptions[ith],
				prop  : expressions [ith],
				freq  : frequencies [ith].freq,
				times : pluralise('time', this.freq),
				tcase : JSON.stringify(shrunken[ith])
			})

		})
		.reduce(function (acc, current) {
			return acc + '\n\n' + current
		})

	const header = format('{failed} after {after} {cases}.\n\n', {
		failed : colourise.red('Failed!'),
		after  : after,
		cases  : pluralise(' case', after)
	})

	throw header + paragraphs + '\n\n'
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

	const delimit = function (delimiter) {
		return function (str0, str1) {
			return str0 + delimiter + str1
		}
	}

	// info is flat, so it must be iterated over seperately.

	var testsRun = flatMap(function (state) {
		return [{
			examined : state.casesExamined,
			run : state.testsRun
		}]
	}, states)

	const message =
		Object.keys(testsRun)
		.filter(function (ith) {
			return states[ith].testsRun.length > 0
		})
		.map(function (ith) {

			var ith     = parseInt(ith)
			const info  = infos[ith]
			const state = states[ith]

			const examined = testsRun[ith].examined
			const run      = testsRun[ith].run

			const descr = rightPad(
				format('"{info}" {passed}!', {
					info   : info,
					passed : colourise.green('passed')
				}), 80) +
				format('({testsRun})', {
					testsRun: [run, examined]
				})

			const stats = colourise.green( format("{run}/{examined}", {
				run      : state.run,
				examined : state.examined
			}) )

			return descr + stats
		})
		.reduce(delimit('\n'))

	console.log(message)

	return message
}







/*

*/

const holdsWhenTest = function (prop, tcase) {
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

	const infos  = test.info
	const params = test.params
	const time   = test.time

	const initialState = function (len) {
		return {
			casesExamined : repeat(len, 0),
			testsRun      : repeat(len, 0),
			failsFor      : [],
			failsAfter    : Infinity,
			failedIndices : []
		}
	}

	// each test subtype has its own state, tester and property group.


	const groupTypes = [
		test.holdsWhenProperty || [],
		test.failsWhenProperty || [],
		test.worksWhenProperty || []
	]
	var states       = [
		initialState(groupTypes[0].length),
		initialState(groupTypes[1].length),
		initialState(groupTypes[2].length)
	]

	const testers    = [holdsWhenTest,  failsWhenTest,  worksWhenTest]
	const timeLeft   = stopwatch(time)

	/*
		execute the tests and collect statistics on the failures.
	*/

	var len = 0

	while (timeLeft()) {

		/*
			incrementing gets faster over time,
			as small n tend to expose more base cases.
		*/
		Math.random() > 0.95 * Math.pow(0.95, len)? len++: len

		var tcase = yieldCase(params, Math.ceil(len / 20))

		for (var ith = 0; ith < states.length; ith++) {

			var test  = testers[ith]
			var group = groupTypes[ith]
			var state = states[ith]

			runTest(test, group, state, tcase, infos)
		}

	}

	// additional data needed to report success or failure.

	const testData = {
		info: infos,
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
			exhaustionWarning(testData, state, infos)
		}

		if (state.failsFor.length > 0) {
			/*
				Throw errors for this particular group.
			*/

			// grab the failed properties,
			// shrink with the failed cases as initial population.

			var shrunken =
				uniqueOf(state.failedIndices)
				.map(function (indices) {
					return shrink(tester, {
						pred : group[indices.group][0],
						prop : group[indices.group][indices.property + 1]
					}, state.failsFor)
				})

			propertyError(group, shrunken, testData, state)
		}


	}

	successMessage(states, infos)
}











module.exports = executeTest
