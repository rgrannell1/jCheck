
over_('a', 'b') .

describe('addition & multiplication are commutative') .
when_(
	typeof(a) === 'number' && a === a &&
	typeof(b) === 'number' && b === b,
	a + b === b + a,
	a * b === b * a
) .

describe('multiplication is commutative') .

run(1)
