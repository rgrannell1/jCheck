

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
