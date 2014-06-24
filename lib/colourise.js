
/*
	Add tput colours to a string.s
*/

const colourise = ( function () {

	const supportColour = function () {
		return true
	}

	const colouriser = function (code) {
		return function (message) {
			return supportColour()? "\033[" + code + message + "\033[0m": message
		}
	}

	return {
		black  : colouriser("0;30m"),
		blue   : colouriser("0;34m"),
		green  : colouriser("0;32m"),
		red    : colouriser("0;31m"),
		yellow : colouriser("1;33m")
	}

} )()

module.exports = colourise
