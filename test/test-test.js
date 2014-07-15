
const is         = require('is')

const jCheck     = require('../jCheck')
const over       = jCheck.over
const over_      = jCheck.over_
const describe   = jCheck.describe
const holdsWhen  = jCheck.holdsWhen
const holdsWhen_ = jCheck.holdsWhen_
const run        = jCheck.run


var isa = function (type, val) {
	return toString.call(val) === '[object ' + type + ']'
}

over_("num")

.describe("test that a number double-equals itself.")
.holdsWhen_(
	function (num) {return isa("Number", num)},
	function (num) {return num == num}
)

.run()



over_('val')

.describe('this is a work')
.holdsWhen_(
	function (x) {return true},
	function (x) {return true},
	function (x) {return true},
	function (x) {return true}
)

.run()
