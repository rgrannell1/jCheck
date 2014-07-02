
const jcheck     = require('../jcheck')

const over       = jcheck.over
const over_      = jcheck.over_

const describe   = jcheck.describe

const holdsWhen  = jcheck.holdsWhen
const holdsWhen_ = jcheck.holdsWhen_

const run        = jcheck.run




over_('val')

.describe('true is always true')
.holdsWhen_(
	function (val) {return true},
	function (val) {return true}
)

.run()






over_('val0', 'val1')

.describe('true is always true')
.holdsWhen_(
	function (val0, val1) {return true},
	function (val0, val1) {return true}
)

.run()






over_('a', 'b')

.describe('string concatentation adds its input lengths')
.holdsWhen_(
	function (a, b) {
		return typeof a === 'string' && typeof b === 'string'
	},
	function (a, b) {
		return (a + b).length === (b + a).length
	},
	function (a, b) {
		return (a + b).length === a.length + b.length
	}
)

.describe('string concatentation with empty-string is same length')
.holdsWhen_(
	function (a, b) {
		return typeof a === 'string' && typeof b === 'string' && (a.length * b.length) === 0
	},
	function (a, b) {
		return a.length === 0?
			(a + b).length === b.length:
			(a + b).length === a.length
	}

)

.run()







over_('val')

.describe('throw always fails')
.failsWhen_(
	function (val) {return true},
	function (val) {throw 'error! folly! poppycock! tisch! fipsy!'}
)

.run()













var take = function (num, coll) {

	if (toString.call(num) !== '[object Number]') {
		throw TypeError('num must be a number')
	}
	if (num < 0) {
		throw RangeError('num must be larger than one.')
	}
	if (Math.round(num) !== num) {
		throw RangeError('num must be a round number')
	}
	if (num === Infinity) {
		var num = coll.length
	}

	var out = []
	for (var ith = 0; ith < num; ith++) {
		out[ith] = coll[ith]
	}
	return out
}

var is = function (type, val) {
	return toString.call(val) === '[object ' + type + ']'
}

over_("num", "coll")

.describe("take returns correct length")
.holdsWhen_(
	function (num, coll) {
		return is("Number", num) && num > 0 && Math.round(num) === num &&
			is("Array", coll)
	},
	function (num, coll) {
		return take(num, coll).length === num
	}
)

.describe("take runs for all numbers")
.worksWhen_(
	function (num, coll) {
		return is("Number", num) && num > 0 && Math.round(num) === num &&
			is("Array", coll)
	},
	function (num, coll) {
		take(num, coll)
	}
)

.run()