
const is         = require('is')

const jcheck     = require('../jcheck')
const over       = jcheck.over
const over_      = jcheck.over_
const describe   = jcheck.describe
const holdsWhen  = jcheck.holdsWhen
const holdsWhen_ = jcheck.holdsWhen_
const run        = jcheck.run




over_('val')

.describe('this is a work')
.holdsWhen_(
	function (x) {return true},
	function (x) {return true},
	function (x) {return true},
	function (x) {return true}
)

.run()






over_('num0', 'num1', 'num2')

.describe('subtraction is associative')
.holdsWhen_(
	[
		[is.number, is.number, is.number]
	],
	function (a, b, c) {return isFinite(a / b)}
)

.run()
