
/*
	mutate.

	A general mutation function for a genetic algorithm. This is done by
	many subdefinitions.

	remove:
		remove.number          remove a digit from a number.
		remove.string          remove a character from a string.
		remove.array           apply remove on an element in an array.
		remove.object          apply remove on an element in an object.
		remove.default         identity function.

		the 'remove' subdefinition shortens an input value.

	trim:
		trim.array             remove an element from an array.
		trim.object            remove an element from an object.

		trim.default           identity function.

		the 'trim' subdefinition removes an element from a container.

	replace:
		replace.nan            replace nan with a random number.
		replace.infinity       replace infinity with a random number.

		replace.number         replace a digit of a number with another digit.
		replace.string         replace a letter of a string with a random letter.
		replace.array          replace a .
		replace.object         replace a .

		replace.default        identity function.

		the 'replace' subdefinition swaps part of an input with another value.

*/





const _remove = ( function () {

	var self = {}

	self.number = function (val) {

		const digits   = val.toString().split('')
		const toRemove = Math.floor(Math.random() * digits.length)

		var out = ['0']

		for (var ith = 0; ith < digits.length; ith++) {
			if (ith !== toRemove) {
				out.push(digits[ith])
			}
		}

		return parseInt(out.join(''), 10)
	}

	self.string = function (val) {

		const chars    = val.split('')
		const toRemove = Math.floor(Math.random() * chars.length)

		var out = []

		for (var ith = 0; ith < chars.length; ith++) {
			if (ith !== toRemove) {
				out.push(val[ith])
			}
		}

		return out.join('')
	}

	self.array = function (val) {

		const toApply = Math.floor(Math.random() * val.length)

		val[toApply] = remove(val[toApply])

		return val
	}

	self.object = function (val) {

		const keys    = Object.keys(val)
		const toApply = Math.floor(Math.random() * keys.length)
		const key     = keys[toApply]

		val[keys] = remove(val[keys])

		return val
	}

	self.default = function (val) {
		return val
	}

	return self

} )()





const _removeCategory = Categoriser([
	// NaN or Infinity.
	{default: function (x) {return x !== x}},
	{default: function (x) return !isFinite(x)},

	{number : is.number},
	{string : is.string},
	{array  : is.array},
	{object : is.object},
	{default: K(true)  }
])

const remove = function (val) {
	return getMethod(_removeCategory, _remove, val)(val)
}





const _trim = ( function () {

	var self = {}

	self.array  = function (val) {

		const toRemove = Math.floor(Math.random() * val.length)
		var out        = []

		if (val.length > 0) {
			for (var ith = 0; ith < val.length; ith++) {
				if (ith !== toRemove) {
					out.push(val[ith])
				}
			}
		}

		return out
	}

	self.object = function (val) {

		const keys     = Object.keys(val)
		const toRemove = Math.floor(Math.random() * keys.length)

		delete val[keys[toRemove]]
		return val
	}

	return self

} )()






const _trimCategory = Categoriser([
	{array  : is.array},
	{object : is.object},
	{default: K(true)  }
])

const trim = function (val) {
	return getMethod(_trimCategory, _trim, val)(val)
}









/*

*/
const _replace = ( function () {

	var self = {}

	self.number = function (val) {
		// replace a digit of the number.

		const digits      = val.toString().split('')
		const toReplace   = Math.floor(Math.random() * digits.length)

		digits[toReplace] = '0123456789'.charAt(Math.random() * 10)

		return parseInt(digits.join(''), 10)
	}

	self.nan = function (val) {
		// replace NaN with a random number.

		return Math.random	() * 10000 * (Math.random() - 1)
	}

	self.string = function (val) {
		// replace a character of the number.

		const alphanumeric =
			'abcdefghijklmnopqrstuvwxyz' +
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
			'0123456789'

		const chars     = val.toString().split('')
		const toReplace = Math.floor(Math.random() * chars.length)

		chars[toReplace] = alphanumeric.charAt(Math.random() * alphanumeric.length)

		return chars.join('')
	}

	self.array  = function (val) {
		// replace an element of an array.

		const toReplace = Math.floor(Math.random() * val.length)
		val[toReplace] = replace(val[toReplace])

		return val
	}

	self.object = function (val) {
		// replace an element of an object.

		const keys     = Object.keys(val)
		const toRemove = Math.floor(Math.random() * keys.length)

		delete val[keys[toRemove]]
		return val
	}

	self.default = K

	return self

} )()





const _replaceCategory = Categoriser([
	{infinity: function (num) {return num !== num}},
	{nan     : function (num) {return !isFinite(num)}},

	{number  : is.number},
	{string  : is.string},
	{array   : is.array },
	{object  : is.object},
	{default : K(true)  }
])

const replace = function (val) {
	return getMethod(_replaceCategory, _replace, val)(val)
}






const mutate = ( function () {

	const mutators = [remove, replace]

	return function (coll) {

		const mutator  = oneOf(mutators)
		const toMutate = oneOf(indicesOf(coll.length))

		coll[toMutate] = mutator(coll[toMutate])

		return coll
	}

} )()
