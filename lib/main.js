
const colourise = {
	red: function (x) {return x}
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



const runTest = function () {

}

/*

*/

const yieldCase = function (params) {

	return params.map(function (param) {
		return fromStream()
	})

}

const propertyError = function (testData, state) {

}

const exhaustionWarning = function (testData, state, info) {

}

const successMessage = function (states, info) {

}

const whenTest = function (prop, testcase) {
	// simply call the predicate with the testcase.

	return prop.apply(null, testcase)
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
			casesExamined : 0
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

	while (timeLeft()) {

		var testcase = yieldCase(params)

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

			propertyError
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




const over = function (params) {

	var self  = joinTest(this, {
		params 	: params,
		type   	: 'over'
	})

	return self
}

const over_ = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		params 	: args,
		type   	: 'over'
	})

	return self
}



const when = function (pred, preds) {

	var self  = joinTest(this, {
		whenProperty : [pred].concat(preds),
		type         : 'when'
	})

	return self
}

const when_ = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		whenProperty : args,
		type         : 'when'
	})

	return self
}





const run = function (time) {

	var self  = joinTest(this, {
		time : time,
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


const joinTest = function (acc, left) {

	if (acc.GLOBAL || acc.window) {
		// a heuristic for detecting the global context.
		var acc = Object.create(_forallProto)
	}

	const override = function (key) {
		return function () {

			acc[key] = left[key]
			return acc

		}
	}

	const join = function (key) {
		return function () {

			if (acc[key]) {
				acc[key] = acc[key].concat( [left[key]] )
			} else {
				acc[key] = [left[key]]
			}

			return acc
		}
	}

	const responses = {
		describe : join('info'),
		over     : override('params'),
		when     : join('whenProperty'),
		run      : function () {

			acc.time = left.time

			executeTest(acc)
		}
	}

	for (type in responses) {

		if (left.type === type) {
			return responses[type]()
		}
	}

}
