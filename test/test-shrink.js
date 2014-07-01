
_remove     = require('../lib/shrink')._remove
_substitute = require('../lib/shrink')._substitute
_score      = require('../lib/shrink')._remove

remove     = require('../lib/shrink').remove
substitute = require('../lib/shrink').substitute
score      = require('../lib/shrink').remove

_removeCategory     = require('../lib/shrink')._removeCategory
_scoreCategory      = require('../lib/shrink')._scoreCategory
_substituteCategory = require('../lib/shrink')._substituteCategory






const assert = require('assert')
const is     = require('is')

console.log('_remove.array')

	assert(_remove.array([]).length === 0)
	assert(is.array( _remove.array([]) ))
	assert(is.array( _remove.array([1]) ))
	assert(is.array( _remove.array([1, 2]) ))
	assert(_remove.array([1, 2]).length === 1)

console.log('_remove.string')

	assert(_remove.string('a') === '')
	assert(_remove.string('ab').length === 1)
	assert(is.string(_remove.string('ab')))

console.log('_remove.number')

	console.log(  remove(100) < 100   )
	console.log(  is.number(remove(100)) )

	console.log(  remove(-100) > -100   )
	console.log(  is.number(remove(-100)) )

	console.log(  remove(100.21123) < 100.21123 )
	console.log(  is.number(remove(100.1321)) )
