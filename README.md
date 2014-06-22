jCheck
======

jCheck is a minimal property-based testing framework for JavaScript.
Its main focus is to remove testing boilerplate; you don't need to
specify test-cases or test-case generators for jCheck tests.

## Installation.

## Language.

jCheck has a very small grammar.

```js
myTest .

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
```

* **over, over_**: Bind several variables to random values.

* **describe**: Describe what an assertion proves about your programs.

* **holdsWhen, holdsWhen_**: When a predicate is true, assert that other predicates are true too.
* **failsWhen, failsWhen_**: When a predicate is true, assert that other functions always fail.

* **run**: Execute a test object.
