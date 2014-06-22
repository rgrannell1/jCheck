
/*
	jCheck is a quick and dumn property testing framework for JavaScript / Node.

*/

const colourise = {
	red    : function (x) {return x},
	yellow : function (x) {return x}
}









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
	The core testing function.
*/

const runTest = function (tester, groups, state, testcase, info) {

	for (var groupIth = 0; groupIth < groups.length; groupIth++) {

		var group = groups[groupIth]

		var groupPred  = groups[0]
		var groupProps = restOf(groups)

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

*/

const yieldCase = function (params, len) {

	return params.map(function (param) {
		return fromStream(len)
	})

}









const propertyError = function (testData, state) {
	throw 'failed!'
}

















const exhaustionWarning = function (testData, state, info) {

	const run      = state.testsRun
	const examined = state.casesExamined

	const message =
		info + colourise.yellow(" Failed!\n") +
		"all " + examined + " test cases were rejected."

	throw message
}








const successMessage = function (states, info) {
	/*

	*/

	const testsRun =
		states
		.map(function (state) {
			return state.testsRun
		})
		.reduce(function (acc, val) {
			return acc + ', ' + val
		})

	const message =
		"'"+ info + "'" + ' passed!' + "(" + testsRun + ")"

	console.log(message)
}








const whenTest = function (prop, testcase) {
	// simply call the predicate with the testcase.

	return prop.apply(null, testcase)
}








const stopwatch = function (seconds) {
	/*
		takes a number of seconds, and
		returns a function that returns true if
		called within that timespan after creation.
	*/

	const posixTime = function () {

		return Math.round((new Date).getTime() / 1000.0)
	}

	const genesis = posixTime()

	return function () {

		const lifespan  = posixTime() - genesis
		return lifespan < seconds

	}
}






const validateTest = function (test) {
	/*
		ensure that the test being passed to run
		can be executed properly.
	*/

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

			propertyError(testData, state)
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
		info : info,
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
				acc[key] = right[key]
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

run(1)
