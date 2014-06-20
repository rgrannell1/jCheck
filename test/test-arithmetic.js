
over_('a', 'b') .

describe('addition is commutative') .
when_(
	typeof(a) === 'number' && a === a &&
	typeof(b) === 'number' && b === b,
	a + b === b + a
) .

run(1)
