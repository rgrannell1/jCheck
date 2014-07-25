
const exec = require('child_process').exec

console.log('running tests.')

require('./test-colourise')
require('./test-flotsam')
require('./test-forall')

var is = function (type, val) {
    return toString.call(val) === '[object ' + type + ']'
}

over_("num")

.describe("test that a number double-equals itself.")
.holdsWhen_(
    function (num) {return is("Number", num)},
    function (num) {return num == num}
)

.run()