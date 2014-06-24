
const jcheck = require('../jcheck')

const over  = jcheck.over
const over_ = jcheck.over_

const describe = jcheck.describe

const holdsWhen  = jcheck.holdsWhen
const holdsWhen_ = jcheck.holdsWhen_

const run = jcheck.run







over_('a', 'b')

.describe('addition is commutative')
.holdsWhen_(
	function (a, b) {
		return typeof a === 'number' && a === a &&
		typeof b === 'number' && b === b
	},
	function (a, b) {
		return a + b === b + a
	}
)

.run(1)