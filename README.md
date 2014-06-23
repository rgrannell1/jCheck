
jCheck
======

jCheck is a minimal property-based testing framework for JavaScript / Node.
Its main focus is to remove testing boilerplate; you don't need to
specify test-cases or test-case generators for jCheck tests.

## Installation.

```bash
git clone https://github.com/rgrannell1/jCheck.git
cd jCheck
```

## Language.

jCheck has a very small grammar. A jCheck test binds parametres - in this case 'a' and 'b' - to
random values. Properties - such as predicate functions and known failure functions - are ran over
a stream of possible inputs, to prove invariants always hold true. The tests run for a set timespan,
and test with increasingly long and large inputs.

The tests can be built up in any order.

```js
over_('a', 'b') .

describe('addition is commutative') .
holdsWhen_(
	function (a, b) {
		return typeof a === 'number' && a === a &&
		typeof b === 'number' && b === b
	},
	function (a, b) {
		return a + b === b + a
	}
) .

run(1)
```

* **over, over_**: Bind several variables to random values.

* **describe**: Describe what an assertion proves about your programs.

* **holdsWhen, holdsWhen_**: When a predicate is true, assert that other predicates are true too.
* **failsWhen, failsWhen_**: When a predicate is true, assert that other functions always fail.

* **run**: Execute a test object.

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
