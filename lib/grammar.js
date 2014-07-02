
/*
	-------------------------------- Grammar --------------------------------

	describe(string)                 add a description to a property group. Concatanative property.

	over([string])                   the parametres to bind random variables to.
	                                 Overriding property.

	over_(string_)                   the parametres to bind random variables to.
	                                 Overriding property.

	holdsWhen(Function, [Function])  holdsWhen a predicate is true, assert that several other
	                                     predicates are also true. Concatanative property.

	holdsWhen_(Function_)            holdsWhen_ a predicate is true, assert that several other
	                                     predicates are also true. Concatanative property.

	run(number)                          triggers the start of a test, specifies how long the test runs for.

*/

const executeTest = require('./run-test')
const fromStream  = require('./generator')




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
	Variadic form of over.
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

const holdsWhen = function (pred, preds) {

	var self  = joinTest(this, {
		holdsWhenProperty : [pred].concat(preds),
		type              : 'holdsWhen'
	})

	return self
}

/*
	Variadic form of holdsWhen.
*/

const holdsWhen_ = function () {

	const args = Array.prototype.slice.call(arguments)

	var self  = joinTest(this, {
		holdsWhenProperty : args,
		type         : 'holdsWhen'
	})

	return self
}

const runsWhen = function () {

	const self = joinTest(this, {
		runsWhenProperty : 1
	})

	return self
}

const runsWhen_ = function () {

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
	run         : run,

	over        : over,
	over_       : over_,

	holdsWhen   : holdsWhen,
	holdsWhen_  : holdsWhen_,

	describe    : describe
}


/*
	JoinTest

	JoinTest takes the 'this' passed to a grammar method, and some
	new data as its right argument. It then updates i
*/

const joinTest = ( function () {

	/*
		Test if an object is the global 'this' object.
	*/

	const isGlobalThis = function (obj) {
		return obj.GLOBAL || obj.window
	}

	return function (acc, right) {

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
			describe  : join('info'),
			over      : override('params'),
			holdsWhen : join('holdsWhenProperty'),
			run       : function () {

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

} )()











module.exports = {
	describe   : describe,

	over       : over,
	over_      : over_,

	holdsWhen  : holdsWhen,
	holdsWhen_ : holdsWhen_,

	run        : run
}
