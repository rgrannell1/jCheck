
_remove     = require('../lib/mutate')._remove
_substitute = require('../lib/mutate')._substitute
_score      = require('../lib/score')._score

remove     = require('../lib/mutate').remove
substitute = require('../lib/mutate').substitute
score      = require('../lib/score').score

_removeCategory     = require('../lib/mutate')._removeCategory
_substituteCategory = require('../lib/mutate')._substituteCategory
_scoreCategory      = require('../lib/score')._scoreCategory






const assert = require('assert')
const is     = require('is')


/*
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

	assert( _remove.number(100) < 100   )
	assert( is.number(_remove.number(100)) )

	assert( _remove.number(-100) > -100   )
	assert( is.number(_remove.number(-100)) )

	assert( _remove.number(100.21123) < 100.21123 )
	assert( is.number(_remove.number(100.1321)) )

console.log('_remove.array')

	assert( _remove.array([1, 2, 3]).length === 2 )
	assert( _remove.array([]).length === 0 )

console.log('_remove.object')

	assert( Object.keys( _remove.object({a: 1, b: 2}) ).length === 1 )
	assert( Object.keys( _remove.object({}) ).length === 0 )
*/