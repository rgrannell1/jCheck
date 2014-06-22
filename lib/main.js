
/*
	jCheck is a quick and dumn property testing framework for JavaScript / Node.

*/

/*
	Helper Functions.

*/

/*
	Remove the first element from an array.

	@param {[any]}
*/

const restOf = function (coll) {

	var out = []

	for (var ith = 0; ith < coll.length; ith++) {
		if (ith !== 0) {
			out = out.concat( coll[ith] )
		}
	}

	return out
}

/*
	Get the unique values in a collection.
*/

const uniqueOf = function (coll) {

	var set = []

	for (var ith = 0; ith < coll.length; ith++) {

		var elem     = coll[ith]
		var hasMatch = false

		for (var jth = 0; jth < set.length; jth++) {
			if (elem === set[jth]) {
				hasMatch = true
			}
		}

		if (!hasMatch) {
			set.push(elem)
		}
	}

	return set
}

/*
	Get the indices of a collection.
*/

const indicesOf = function (coll) {

	var indices = []

	for (var ith = 0; ith < coll.length; ith++) {
		indices[ith] = ith
	}

	return indices

}

/*
	takes a number of seconds, and
	returns a function that returns true if
	called within that timespan after creation.

*/

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

const rightPad = function (str, num) {
	return str.length < num? str + Array(num - str.length).join(' '): str
}

const match = function (tcase, patterns) {

	for (var ith = 0; ith < patterns.length; ith++) {

		var allMatch = true
		var pattern  = patterns[ith][0]
		var response = patterns[ith][1]

		for (var jth = 0; jth < tcase.length; jth++) {

			allMatch = allMatch && (pattern[jth] === undefined || tcase[jth] === pattern[jth])

		}

		if (allMatch) {
			return response
		}
	}

	throw "internal error: non-exhaustive pattern matching!"
}

const addSuffix = function (num) {

	if (!isFinite(num)) {
		return 'Infinith'
	}

	const leastSignificant =
		parseInt(num
			.toString()
			.match(/[0-9]$/g)[0],
		10)

	const _      = undefined
	const suffix = match([num, leastSignificant], [
		[[2,  _], "nd"],
		[[3,  _], "rd"],
		[[11, _], "th"],
		[[12, _], "th"],
		[[13, _], "th"],
		[[_ , 1], "st"],
		[[_ , 2], "nd"],
		[[_ , 3], "rd"],
		[[_ , _], "th"]
	])

	return num + suffix
}

const pluralise = function (str, num) {
	return num > 1? str + 's': str
}

const colourise = ( function () {

	const supportColour = function () {
		return true
	}

	const colouriser = function (code) {
		return function (message) {
			return supportColour()? "\033[" + code + message + "\033[0m": message
		}
	}

	return {
		black  : colouriser("0;30m"),
		blue   : colouriser("0;34m"),
		green  : colouriser("0;32m"),
		red    : colouriser("0;31m"),
		yellow : colouriser("1;33m")
	}

} )()











const fromStream = ( function () {

	var self = {}

	/*
		-------------------------------- Generators --------------------------------

	*/

	// -------------------------------- numeric --------------------------------

	self.number = function (len) {
		// uniform random number of a given order 'len'.

		const  sign = Math.random() > 0.5? +1: -1
		return sign * Math.random() * Math.pow(10, len)
	}
	self.integer = function (len) {
		// uniform random integer of a given order 'len'.

		return Math.round(self.number(len))
	}

	self.nan    = function (len) {
		return NaN
	}

	// -------------------------------- character --------------------------------

	self.alphabetical = (function () {
		// uppercase and lowecase letters in a string of length 'len'.

		const charset =
			'abcdefghijklmnopqrstuvwxyz' +
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

		return function (len) {

			var out = ''

			for (var ith = 0; ith < len; ith++) {
				out += charset.charAt(Math.random * charset.length)
			}

			return out
		}

	})()









	/*
		-------------------------------- Sampler --------------------------------

	*/

	return function (len) {
		// return a random generator.

		const generators = Object.keys(self)
		const ith        = generators[Math.floor(Math.random() * generators.length)]

		return self[ith](len)
	}

} )()






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

		console.log((testData.info))
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

	*/

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

const whenTest = function (prop, testcase) {
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

	const info         = test.info
	const params       = test.params
	const time         = test.time
	const whenProperty = test.whenProperty

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
	const groupTypes = [whenProperty]
	const testers    = [whenTest]





	var timeLeft = stopwatch(time)

	/*
		execute the tests and collect statistics on the failures.
	*/

	const len = 10

	while (timeLeft()) {

		var testcase = yieldCase(params, len)

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
	-------------------------------- Grammar --------------------------------

	describe(string)            add a description to a property group. Concatanative property.

	over([string])              the parametres to bind random variables to.
	                            Overriding property.

	over_(string_)              the parametres to bind random variables to.
	                            Overriding property.

	when(Function, [Function])  when a predicate is true, assert that several other
	                            predicates are also true. Concatanative property.

	when_(Function_)            when a predicate is true, assert that several other
	                            predicates are also true. Concatanative property.

	run(number)                 triggers the start of a test, specifies how long the test runs for.
*/

const describe = function (info) {

	var self  = joinTest(this, {
		info : [info],
		type : 'describe'
	})

	return self
}


/*
	Bind random variables to test over.

	@param {[string]} strs. An array of strings.
*/

const over = function (strs) {

	var self  = joinTest(this, {
		params 	: strs,
		type   	: 'over'
	})

	return self
}

/*

*/

const over_ = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		params 	: args,
		type   	: 'over'
	})

	return self
}

/*
	When a predicate is true of a test-case, ensure several other predicates are true too.

	@param {Function}   pred:  a predicate function. This function tests if a test-case
	    is suitable to be given to a set of properties.

	@param {[Function]} preds: an array of predicate functions. These functions are
	    properties that must hold true for an test-case that matches `pred`.

	@return {object}
*/

const when = function (pred, preds) {

	var self  = joinTest(this, {
		whenProperty : [pred].concat(preds),
		type         : 'when'
	})

	return self
}

/*

*/

const when_ = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		whenProperty : args,
		type         : 'when'
	})

	return self
}

/*
	Run a test.

	@param {number} num. The number of seconds testing should continue for.
*/

const run = function (num) {

	var self  = joinTest(this, {
		time : num,
		type : 'run'
	})

	return self
}





const _forallProto = {
	run      : run,

	over     : over,
	over_    : over_,

	when     : when,
	when_    : when_,

	describe : describe
}

/*
	Test if an object is the global 'this' object.
*/

const isGlobalThis = function (obj) {
	return obj.GLOBAL || obj.window
}

/*
	JoinTest

	JoinTest takes the 'this' passed to a grammar method, and some
	new data as its right argument. It then updates i
*/

const joinTest = function (acc, right) {

	if (isGlobalThis(acc)) {
		var acc = Object.create(_forallProto)
	}

	const override = function (key) {
		return function () {

			acc[key] = right[key]
			return acc

		}
	}

	const join = function (key) {
		return function () {

			if (acc[key]) {
				acc[key] = acc[key].concat( [right[key]] )
			} else {
				acc[key] = [right[key]]
			}

			return acc
		}
	}

	const responses = {
		describe : join('info'),
		over     : override('params'),
		when     : join('whenProperty'),
		run      : function () {

			acc.time = right.time

			executeTest(acc)
		}
	}

	for (type in responses) {

		if (right.type === type) {
			return responses[type]()
		}
	}

}





over_('a', 'b') .

describe('addition is commutative') .
when_(
	function (a, b) {
		return typeof a === 'number' && a === a &&
		typeof b === 'number' && b === b
	},
	function (a, b) {
		return a + b === b + a + 1
	}
) .

describe('addition is associative') .
when_(
	function (a, b, c) {
		return typeof a === 'number' && a === a &&
		typeof b === 'number' && b === b &&
		typeof c === 'number' && c === c
	},
	function (a, b, c) {
		return (a + b) + c === a + (b + c)
	}
) .

run(1)
