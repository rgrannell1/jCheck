
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

	assert(  _remove.number(100) < 100   )
	assert(  is.number(_remove.number(100)) )

	assert(  _remove.number(-100) > -100   )
	assert(  is.number(_remove.number(-100)) )

	assert(  _remove.number(100.21123) < 100.21123 )
	assert(  is.number(_remove.number(100.1321)) )

console.log('_remove.array')

	assert( _remove.array([1, 2, 3]).length === 2 )
	assert( _remove.array({a: 1, b :2}).size === 1)
	assert( _remove.array([]).length === 0 )
	assert( _remove.array({}).size === 0)
