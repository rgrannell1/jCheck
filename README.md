jCheck
======

jCheck is a minimal property-based testing framework for JavaScript.
Its main focus is to remove testing boilerplate; you don't need to
specify test-cases or test-case generators for jCheck tests.

## Installation.

## Usage.



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

## Language.

jCheck has a very small grammar.

***over**: Bind several variables to random values.

**describe**: Describe what an assertion proves about your programs.

**run**: Execute a test object.

### Assertions.

* **holdsWhen**: When a predicate is true, assert that other predicates are true too.
* **failsWhen**: When a predicate is true, assert that other functions always fail.
