
const fromStream = ( function () {

	var self = {}

	/*
		-------------------------------- Generators --------------------------------

	*/

	self.number = function (len) {
		// uniform random number of a given order 'len'.

		const sign  = Math.random() > 0.5? +1: -1
		return sign * Math.random() * Math.pow(10, len)
	}
	self.integer = function (len) {
		return Math.round(self.number(len))
	}

	self.nan    = function (len) {
		return NaN
	}










	/*
		-------------------------------- Sampler --------------------------------

	*/

	return self

} )()

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

const whenTest = function (prop, testcase) {
	return prop.apply(null, testcase)
}

const executeTest = function (test) {

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
		positives : [pred].concat(preds),
		type      : 'when'
	})

	return self
}

const when_ = function () {

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






a =
over_('a', 'b')

. describe('this is a string')
. when_(
	function (a, b) {a + b === b + a}
)

. describe('this')
. when_(
	function (a) {a}
)
