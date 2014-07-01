
/*
	----------------------------------- Helpers -----------------------------------

*/

/*
	Remove the first element from an array.

	@param {[any]}
*/

const restOf = function (coll) {

	var out = []

	for (var ith = 0; ith < coll.length; ith++) {
		if (ith !== 0) {
			out = out.concat( coll[ith] )
		}
	}

	return out
}











/*
	Get the unique values in a collection.
*/

const uniqueOf = function (coll) {

	var set = []

	for (var ith = 0; ith < coll.length; ith++) {

		var elem     = coll[ith]
		// as good a hack as any.
		var elemText = JSON.stringify(elem)
		var hasMatch = false

		for (var jth = 0; jth < set.length; jth++) {

			var setElemText = JSON.stringify(set[jth])

			if (elemText === setElemText) {
				hasMatch = true
			}
		}

		if (!hasMatch) {
			set.push(elem)
		}
	}

	return set
}










/*
	Get the indices of a collection.
*/

const indicesOf = function (coll) {

	var indices = []

	for (var ith = 0; ith < coll.length; ith++) {
		indices[ith] = ith
	}

	return indices

}











/*
	takes a number of seconds, and
	returns a function that returns true if
	called within that timespan after creation.

*/

const stopwatch = function (num) {

	const posixTime = function () {

		return Math.round((new Date).getTime() / 1000.0)
	}

	const genesis = posixTime()

	return function () {

		const lifespan  = posixTime() - genesis
		return lifespan < num

	}
}










/*
	make a string fixed length by addings empty space to its right.
*/

const rightPad = function (str, num) {
	return str.length < num? str + Array(num - str.length).join(' '): str
}











/*
	Match an array of elements versus several possible patterns,
	and return the value assoicated with the pattern.
*/

const match = function (tcase, patterns) {

	for (var ith = 0; ith < patterns.length; ith++) {

		var allMatch = true
		var pattern  = patterns[ith][0]
		var response = patterns[ith][1]

		for (var jth = 0; jth < tcase.length; jth++) {

			allMatch = allMatch && (pattern[jth] === undefined || tcase[jth] === pattern[jth])

		}

		if (allMatch) {
			return response
		}
	}

	throw "internal error: non-exhaustive pattern matching!"
}










/*
	Make a number an adjective by adding a suffix (1st, 2nd, 3rd).

	@param {number} num. The number to add a suffix to.
*/

const addSuffix = function (num) {

	if (!isFinite(num)) {
		return 'Infinith'
	}

	const lastDigit =
		parseInt(num
			.toString()
			.match(/[0-9]$/g)[0],
		10)

	const _      = undefined
	const suffix = match([num, lastDigit], [
		[[1,  _], "st"],
		[[2,  _], "nd"],
		[[3,  _], "rd"],
		[[11, _], "th"],
		[[12, _], "th"],
		[[13, _], "th"],
		[[_ , 1], "st"],
		[[_ , 2], "nd"],
		[[_ , 3], "rd"],
		[[_ , _], "th"]
	])

	return num + suffix
}











/*
	pluralise a string based on a number.

	@param {string} str. The string to conditionally pluralise.
	@param {number} num. The number to plurasise by.
*/

const pluralise = function (str, num) {
	return num > 1? str + 's': str
}










const tabulate = function (coll) {

	if (coll.length === 0) {
		return []
	} else {

		const set = uniqueOf(coll)
		// get the underlying set of coll.
		var   out = set.map(function (elem) {
			return {
				val  : elem,
				freq : 0
			}
		})

		for (var ith = 0; ith < coll.length; ith++) {
			// for each element in coll
			var elem = coll[ith]

			for (var jth = 0; jth < out.length; jth++) {

				var setElem = out[jth]

				// if this elem is equal to the jth setElem, increment the freq.

				if (uniqueOf([elem, setElem.val]).length === 1) {
					out[jth].freq += 1
					break
				}

			}
		}

		return out
	}
}










const repeat = function (num, val) {
	var out = []
	for (var ith = 0; ith < num; ith++) {
		out[ith] = val
	}
	return out
}










module.exports = {
	restOf    : restOf,
	uniqueOf  : uniqueOf,
	indicesOf : indicesOf,
	stopwatch : stopwatch,
	rightPad  : rightPad,
	match     : match,
	addSuffix : addSuffix,
	pluralise : pluralise,
	tabulate  : tabulate,
	repeat    : repeat
}
