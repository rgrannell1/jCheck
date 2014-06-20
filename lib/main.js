
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

	const override = function (key) {
		return function () {

			acc[left] = left[key]
			return acc

		}
	}

	const join = function (key) {
		return function () {

			if (length(acc[key]) > 0) {
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

	var self  = joinTest(this, {info: info})
	self.type = 'describe'

	return self
}




const over = function (params) {

	var self  = joinTest(this, {params: params})
	self.type = 'over'

	return self
}





const when = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {positives: args})
	self.type = 'when'

	return self
}





const run = function (time) {

	var self  = joinTest(this, {time: time})
	self.type = 'run'

	return self
}





const _forallProto = {
	run      : run,
	over     : over,
	when     : when,
	describe : describe
}





over(['a', 'b']) .

describe('this is a string') .
when(
	function (a, b) {a + b === b + a}
) .

run(10)
