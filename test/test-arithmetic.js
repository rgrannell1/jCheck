
require('./test-colourise')
const should = require('should');










const jcheck = require('../jcheck')

const over  = jcheck.over
const over_ = jcheck.over_

const describe = jcheck.describe

const holdsWhen  = jcheck.holdsWhen
const holdsWhen_ = jcheck.holdsWhen_

const run = jcheck.run







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

.run(1)