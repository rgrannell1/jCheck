
const makeStream = function () {

}

const validateTest = function (test) {

}

const runTest = function () {

}

const yieldCase = function (params) {

	return params.map(function (param) {
		return fromStream()
	})

}

const throwPropertyError = function (testData, state) {

}

const messageSuccess = function (states, info) {

}

const positiveTest = function (prop, tcase) {

}

const executeTest = function (test) {

}

/*
	-------------------------------- Grammar --------------------------------

	describe(info)           add a description to a property group.
*/

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
		when     : join('positives'),
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





const when = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		positives : args,
		type      : 'when'
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
	when     : when,
	describe : describe
}





a = over(['a', 'b']) .

describe('this is a string') .
when(
	function (a, b) {a + b === b + a}
) .

describe('this') .
when(
	function (a) {a}
)

console.dir(a)
