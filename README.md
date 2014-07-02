
jCheck v0.1.0 [![Build Status](https://travis-ci.org/rgrannell1/jCheck.png?branch=master)](https://travis-ci.org/rgrannell1/jCheck)
======

> "Some positive persisting fops we know,

> Who, if once wrong, will needs be always so;

> But you with pleasure own your errors past,

> And make each day a critique on the last."

> Alexander Pope.

You want to verify that your programs work. The best way to
test any assumption is to try disprove it by experimentation, excepting your assumption only when
no counterexample can be found.

Choosing good test-cases by hand is hard; you will be biased towards picking small test cases,
you will use a small sample-size, and testing known-corner cases is second best to testing
unknown corner cases, which are the real source of failures. Random sampling inputs is the only
reliable way to test.

The limiting factor to testing is your patience. Test-cases are data, and manually entering data
is boring. Properties are predicates, which aren't as boring to write. From experience, writing
test-case generators is difficult & difficulty biases towards writing simple generators and
omitting more complex cases.

jCheck is my attempt to add convenient, maximally-powerful testing to JavaScript. You won't deal with
test-case generation at all; you state the inputs a property should hold for, and jCheck verifies your
property has no counterexamples.


## Installation.

```bash
git clone https://github.com/rgrannell1/jCheck.git
cd jCheck
```




## Language.

jCheck has a tiny grammar. A jCheck test binds parametres — in this case 'a' and 'b' — to
random values. To prove invariants always hold true, properties such as predicates and known
failure functions are ran along a stream of random inputs. The tests run for a set timespan,
and the test-cases get longer and larger over time.

Take this seemingly rigourous implementation of take, which takes the first n elements from
an array.

```js
var take = function (num, coll) {

	if (toString.call(num) !== '[object Number]') {
		throw TypeError('num must be a number')
	}
	if (num < 0) {
		throw RangeError('num must be larger than one.')
	}
	if (Math.round(num) !== num) {
		throw RangeError('num must be a round number')
	}
	if (num === Infinity) {
		var num = coll.length
	}

	var out = []
	for (var ith = 0; ith < num; ith++) {
		out[ith] = coll[ith]
	}
	return out
}
```

```js
var is = function (type, val) {
	return toString.call(val) === '[object ' + type + ']'
}

over_("num", "coll")

.describe("take returns correct length")
.holdsWhen_(
	function (num, coll) {
		return is("Number", num) && is("Array", coll) &&
			num > 0 && Math.round(num) === num
	},
	function (num, coll) {
		return take(num, coll).length === num
	}
)

.describe("take runs for all numbers")
.worksWhen_(
	function (num, coll) {
		return is("Number", num) && is("Array", coll) &&
			num > 0 && Math.round(num) === num
	},
	function (num, coll) {
		take(num, coll)
	}
)

.run()
```

* **over, over_**: Bind several variables to random values.

* **describe**: Describe what an assertion proves about your programs.

* **holdsWhen, holdsWhen_**: When a predicate is true, assert that other predicates are true too.
* **failsWhen, failsWhen_**: When a predicate is true, assert that other functions always fail.

* **run**: Execute a test object.

Tests can be built-up in any order.

If a predicate fails — or a known-failure fails to fail — jCheck will simplify the errant
input to something smaller and easier to read. jCheck tests can be run from a web interface or,
for fellow users with bearded necks and sallow faces, from the command-line.

## License

jCheck is released under the MIT licence.

The MIT License (MIT)

Copyright (c) 2014 Ryan Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Versioning

All versions post-release will be compliant with the Semantic Versioning 2.0.0 standard.

http://semver.org/
