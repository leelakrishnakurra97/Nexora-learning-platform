// Question Pools for all units, subjects, and classes
// Matches chapter/topic keywords and returns proper, academic questions

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const QUESTION_BANK: Record<string, Question[]> = {
  "math-sets": [
    {
      question: "Given two sets, A and B, where A = {1, 3, 5, 7, 9} and B = {1, 2, 3, 4, 5}, find A ∪ B (the union of A and B).",
      options: ["{1, 2, 3, 4, 5, 7, 9}", "{1, 3, 5}", "{1, 2, 3, 4, 5, 6, 7, 9}", "{7, 9}"],
      correctAnswerIndex: 0,
      explanation: "The union of two sets A and B combines all unique elements present in either A or B or both."
    },
    {
      question: "Given two sets, A and B, where A = {1, 3, 5, 7, 9} and B = {1, 2, 3, 4, 5}, find A ∩ B (the intersection of A and B).",
      options: ["{1, 3, 5}", "{1, 2, 3, 4, 5}", "{7, 9}", "{1, 2, 3, 4, 5, 7, 9}"],
      correctAnswerIndex: 0,
      explanation: "The intersection of two sets A and B contains only the elements that are common to both sets."
    },
    {
      question: "If a set A has n elements, what is the total number of subsets in the power set P(A)?",
      options: ["2^n", "n^2", "2n", "n!"],
      correctAnswerIndex: 0,
      explanation: "The cardinality of the power set P(A) is 2^n, where n is the number of elements in set A."
    },
    {
      question: "Let A = {1, 2} and B = {3, 4}. What is the Cartesian product A × B?",
      options: ["{(1,3), (1,4), (2,3), (2,4)}", "{(1,3), (2,4)}", "{1, 2, 3, 4}", "{(3,1), (3,2), (4,1), (4,2)}"],
      correctAnswerIndex: 0,
      explanation: "The Cartesian product A × B is the set of all ordered pairs (a, b) where a ∈ A and b ∈ B."
    },
    {
      question: "A relation R on a set A is called an equivalence relation if it satisfies which three properties?",
      options: ["Reflexive, Symmetric, and Transitive", "Reflexive, Antisymmetric, and Transitive", "Symmetric, Asymmetric, and Transitive", "Reflexive, Irreflexive, and Symmetric"],
      correctAnswerIndex: 0,
      explanation: "An equivalence relation must be reflexive (aRa), symmetric (aRb => bRa), and transitive (aRb and bRc => aRc)."
    },
    {
      question: "If f: A → B is both one-to-one (injective) and onto (surjective), then f is described as:",
      options: ["Bijective", "Constant", "Composite", "Identity"],
      correctAnswerIndex: 0,
      explanation: "A bijective function is both injective (one-to-one) and surjective (onto), meaning it maps elements uniquely and covers all of codomain."
    },
    {
      question: "If n(A) = 12, n(B) = 18, and n(A ∩ B) = 5, find n(A ∪ B).",
      options: ["25", "30", "35", "23"],
      correctAnswerIndex: 0,
      explanation: "Using the formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 12 + 18 - 5 = 25."
    },
    {
      question: "Which of the following describes a set that has no elements?",
      options: ["Empty or Null set", "Singleton set", "Universal set", "Infinite set"],
      correctAnswerIndex: 0,
      explanation: "A set with no elements is called the empty set or null set, represented by {} or the symbol Ø."
    },
    {
      question: "Let f(x) = x^2 and g(x) = 2x + 1. Find the composite function (f ∘ g)(x).",
      options: ["(2x + 1)^2", "2x^2 + 1", "2x^2 + 2x", "4x^2 + 1"],
      correctAnswerIndex: 0,
      explanation: "(f ∘ g)(x) = f(g(x)) = f(2x + 1) = (2x + 1)^2."
    },
    {
      question: "According to De Morgan's Laws, what is (A ∪ B)' equal to?",
      options: ["A' ∩ B'", "A' ∪ B'", "A ∩ B", "(A ∩ B)'"],
      correctAnswerIndex: 0,
      explanation: "De Morgan's Laws state that the complement of the union of two sets is the intersection of their complements: (A ∪ B)' = A' ∩ B'."
    }
  ],
  "math-numbers": [
    {
      question: "Which of the following describes the decimal expansion of an irrational number?",
      options: ["Non-terminating and non-recurring", "Terminating", "Non-terminating and recurring", "Repeating block of identical digits"],
      correctAnswerIndex: 0,
      explanation: "Irrational numbers have decimal expansions that are non-terminating and do not form a repeating pattern (non-recurring)."
    },
    {
      question: "Find the common difference of the Arithmetic Progression (AP): 5, 11, 17, 23, ...",
      options: ["6", "5", "11", "-6"],
      correctAnswerIndex: 0,
      explanation: "The common difference d is calculated as a_2 - a_1 = 11 - 5 = 6."
    },
    {
      question: "What is the formula for the sum of the first n terms of an Arithmetic Progression (AP)?",
      options: ["n/2 * (2a + (n-1)d)", "n/2 * (a + d)", "n * (a + nd)", "n/2 * (2a + nd)"],
      correctAnswerIndex: 0,
      explanation: "The standard sum formula for an AP is S_n = n/2 * [2a + (n-1)d]."
    },
    {
      question: "Find the common ratio of the Geometric Progression (GP): 3, 6, 12, 24, ...",
      options: ["2", "3", "4", "6"],
      correctAnswerIndex: 0,
      explanation: "The common ratio r is obtained by dividing any term by the previous term: r = 6/3 = 2."
    },
    {
      question: "What is the sum to infinity of a GP with first term 'a' and common ratio 'r' where |r| < 1?",
      options: ["a / (1 - r)", "a / (r - 1)", "a * r^n / (1 - r)", "a(1 - r)"],
      correctAnswerIndex: 0,
      explanation: "The sum to infinity of a geometric progression is S_infinity = a / (1 - r) for |r| < 1."
    },
    {
      question: "According to the Fundamental Theorem of Arithmetic, every composite number can be expressed as a product of:",
      options: ["Primes in a unique way, up to their order", "Even numbers", "Consecutive integers", "Rational numbers"],
      correctAnswerIndex: 0,
      explanation: "Every composite number can be uniquely factorized into a product of prime numbers, disregarding the order of factors."
    },
    {
      question: "Which number is irrational?",
      options: ["√2", "0.25", "22/7", "√9"],
      correctAnswerIndex: 0,
      explanation: "√2 cannot be expressed as a fraction of two integers, making it irrational. 0.25, 22/7, and √9 (= 3) are rational."
    },
    {
      question: "What is the value of 5 modulo 3 (5 mod 3)?",
      options: ["2", "1", "0", "3"],
      correctAnswerIndex: 0,
      explanation: "5 divided by 3 gives a quotient of 1 and a remainder of 2. Thus, 5 mod 3 = 2."
    }
  ],
  "math-algebra": [
    {
      question: "If ax^2 + bx + c = 0 is a quadratic equation with real coefficients, under what condition are the roots real and distinct?",
      options: ["b^2 - 4ac > 0", "b^2 - 4ac = 0", "b^2 - 4ac < 0", "b^2 - 4ac is a perfect cube"],
      correctAnswerIndex: 0,
      explanation: "Roots are real and distinct if the discriminant Δ = b^2 - 4ac is strictly positive."
    },
    {
      question: "What is the sum of the roots of the quadratic equation 2x^2 - 8x + 6 = 0?",
      options: ["4", "3", "8", "-4"],
      correctAnswerIndex: 0,
      explanation: "The sum of roots of ax^2 + bx + c = 0 is -b/a = -(-8)/2 = 4."
    },
    {
      question: "What is the product of the roots of the quadratic equation 3x^2 - 5x - 12 = 0?",
      options: ["-4", "4", "5/3", "-5/3"],
      correctAnswerIndex: 0,
      explanation: "The product of roots is c/a = -12/3 = -4."
    },
    {
      question: "If a polynomial P(x) is divided by (x - a), the remainder is equal to:",
      options: ["P(a)", "P(-a)", "0", "P(x) / (x - a)"],
      correctAnswerIndex: 0,
      explanation: "The Remainder Theorem states that when P(x) is divided by (x - a), the remainder is P(a)."
    },
    {
      question: "Simplify the algebraic identity: (a - b)^3.",
      options: ["a^3 - 3a^2b + 3ab^2 - b^3", "a^3 - b^3", "a^3 - 3ab(a+b) - b^3", "a^3 + 3a^2b + 3ab^2 + b^3"],
      correctAnswerIndex: 0,
      explanation: "The expansion of (a-b)^3 is a^3 - 3a^2b + 3ab^2 - b^3."
    },
    {
      question: "If x - 2 is a factor of x^3 - 3x^2 + kx - 4, find the value of k.",
      options: ["4", "2", "-2", "0"],
      correctAnswerIndex: 0,
      explanation: "By the Factor Theorem, if (x - 2) is a factor, then P(2) = 0. Substituting: 8 - 12 + 2k - 4 = 0 => 2k - 8 = 0 => k = 4."
    }
  ],
  "math-matrix": [
    {
      question: "If A is a square matrix of order n, then its inverse exists if and only if:",
      options: ["|A| ≠ 0 (A is non-singular)", "|A| = 0 (A is singular)", "A is symmetric", "A is a diagonal matrix"],
      correctAnswerIndex: 0,
      explanation: "The inverse of a matrix A exists (A is invertible) if and only if its determinant |A| is non-zero."
    },
    {
      question: "What is the formula to calculate the inverse of a matrix A?",
      options: ["A⁻¹ = adj(A) / |A|", "A⁻¹ = |A| * adj(A)", "A⁻¹ = A^T / |A|", "A⁻¹ = adj(A) * |A|"],
      correctAnswerIndex: 0,
      explanation: "The inverse of matrix A is given by adj(A) divided by the determinant |A|."
    },
    {
      question: "For any square matrix A, what is the value of A * adj(A)?",
      options: ["|A| * I", "|A|", "I", "A^T"],
      correctAnswerIndex: 0,
      explanation: "A * adj(A) = adj(A) * A = |A| * I, where I is the identity matrix."
    },
    {
      question: "What is the rank of a 3x3 identity matrix?",
      options: ["3", "1", "0", "9"],
      correctAnswerIndex: 0,
      explanation: "The identity matrix of order 3 has 3 non-zero rows, hence its rank is 3."
    },
    {
      question: "According to the Rouché-Capelli theorem, a system of linear equations AX = B is consistent if and only if:",
      options: ["rank(A) = rank([A|B])", "rank(A) < rank([A|B])", "rank(A) = n", "det(A) ≠ 0"],
      correctAnswerIndex: 0,
      explanation: "A linear system is consistent if and only if the rank of the coefficient matrix equals the rank of the augmented matrix."
    },
    {
      question: "Using Cramer's Rule, what is the value of x in terms of determinants?",
      options: ["Δx / Δ", "Δ / Δx", "Δx * Δ", "Δx - Δ"],
      correctAnswerIndex: 0,
      explanation: "By Cramer's Rule, x = Δx / Δ, where Δ is the determinant of the coefficients and Δx is the modified determinant."
    }
  ],
  "math-complex": [
    {
      question: "What is the modulus of the complex number z = 3 - 4i?",
      options: ["5", "25", "7", "1"],
      correctAnswerIndex: 0,
      explanation: "The modulus is |z| = √(3^2 + (-4)^2) = √(9 + 16) = √25 = 5."
    },
    {
      question: "What is the conjugate of the complex number z = a + ib?",
      options: ["a - ib", "-a + ib", "-a - ib", "b + ia"],
      correctAnswerIndex: 0,
      explanation: "The complex conjugate is formed by changing the sign of the imaginary part: conjugate(z) = a - ib."
    },
    {
      question: "According to de Moivre's Theorem, what is (cos θ + i sin θ)^n equal to?",
      options: ["cos(nθ) + i sin(nθ)", "cos^n(θ) + i sin^n(θ)", "cos(nθ) - i sin(nθ)", "cos(θ) + i sin(θ)"],
      correctAnswerIndex: 0,
      explanation: "De Moivre's theorem states that for any real number n, (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ)."
    },
    {
      question: "Find the principal argument of the complex number z = 1 + i.",
      options: ["π/4", "π/2", "π/3", "π/6"],
      correctAnswerIndex: 0,
      explanation: "The principal argument Arg(z) is tan⁻¹(y/x) = tan⁻¹(1/1) = π/4."
    },
    {
      question: "If ω is a complex cube root of unity, what is the value of 1 + ω + ω²?",
      options: ["0", "1", "-1", "3"],
      correctAnswerIndex: 0,
      explanation: "The sum of the three cube roots of unity (1, ω, ω²) is exactly equal to zero."
    }
  ],
  "math-equations": [
    {
      question: "If a polynomial equation of degree n has real coefficients, complex roots must occur in:",
      options: ["Conjugate pairs", "Triplets", "Identical values", "Real pairs"],
      correctAnswerIndex: 0,
      explanation: "For polynomials with real coefficients, complex roots always occur in conjugate pairs (a ± ib)."
    },
    {
      question: "According to Vieta's formulas, what is the sum of the roots of a cubic equation ax^3 + bx^2 + cx + d = 0?",
      options: ["-b/a", "c/a", "-d/a", "b/a"],
      correctAnswerIndex: 0,
      explanation: "For a cubic equation, the sum of roots α + β + γ = -b/a."
    },
    {
      question: "What is the maximum number of real roots that Descartes' Rule of Signs can predict for a polynomial P(x)?",
      options: ["The number of sign variations in P(x) or less by an even number", "The degree of the polynomial", "The number of coefficients", "Exactly the sign variations in P(-x)"],
      correctAnswerIndex: 0,
      explanation: "The number of positive real roots of P(x) is either equal to the number of sign changes in its coefficients, or less by an even integer."
    },
    {
      question: "A polynomial equation of degree n has exactly how many complex roots (counting multiplicity)?",
      options: ["n", "n - 1", "2n", "n^2"],
      correctAnswerIndex: 0,
      explanation: "The Fundamental Theorem of Algebra states that a polynomial of degree n has exactly n complex roots, counting multiplicities."
    }
  ],
  "math-geometry": [
    {
      question: "What is the formula for the centroid of a triangle with vertices (x1, y1), (x2, y2), and (x3, y3)?",
      options: ["((x1+x2+x3)/3, (y1+y2+y3)/3)", "((x1+x2+x3)/2, (y1+y2+y3)/2)", "(x1*x2*x3, y1*y2*y3)", "(x1+x2+x3, y1+y2+y3)"],
      correctAnswerIndex: 0,
      explanation: "The centroid G of a triangle is the average of its vertices: ((x1+x2+x3)/3, (y1+y2+y3)/3)."
    },
    {
      question: "What is the eccentricity (e) of a parabola?",
      options: ["e = 1", "e < 1", "e > 1", "e = 0"],
      correctAnswerIndex: 0,
      explanation: "A parabola is defined as the locus of points whose distance from a focus equals its distance from a directrix, so e = 1."
    },
    {
      question: "What is the standard equation of a circle with centre (h, k) and radius r?",
      options: ["(x - h)^2 + (y - k)^2 = r^2", "(x + h)^2 + (y + k)^2 = r^2", "x^2 + y^2 = r^2", "(x - h)^2 - (y - k)^2 = r^2"],
      correctAnswerIndex: 0,
      explanation: "The equation is derived from the distance formula: (x - h)^2 + (y - k)^2 = r^2."
    },
    {
      question: "Find the perpendicular distance of the point (x1, y1) from the line ax + by + c = 0.",
      options: ["|ax1 + by1 + c| / √(a^2 + b^2)", "|ax1 + by1 + c| / (a^2 + b^2)", "(ax1 + by1) / √(a^2 + b^2)", "√(ax1^2 + by1^2 + c)"],
      correctAnswerIndex: 0,
      explanation: "The perpendicular distance formula from a point to a line is |ax1 + by1 + c| / √(a^2 + b^2)."
    },
    {
      question: "For two vectors A and B, what is the value of their scalar (dot) product A • B?",
      options: ["|A||B|cos(θ)", "|A||B|sin(θ)", "|A||B|tan(θ)", "A * B"],
      correctAnswerIndex: 0,
      explanation: "The dot product of two vectors is given by the product of their magnitudes and the cosine of the angle between them."
    },
    {
      question: "If two vectors are perpendicular, what is the value of their dot product?",
      options: ["0", "1", "-1", "Product of their magnitudes"],
      correctAnswerIndex: 0,
      explanation: "Since cos(90°) = 0, the dot product of two perpendicular vectors is always zero."
    }
  ],
  "math-trig": [
    {
      question: "What is the fundamental trigonometric identity relating sine and cosine?",
      options: ["sin²(θ) + cos²(θ) = 1", "sin(θ) + cos(θ) = 1", "tan²(θ) + 1 = cos²(θ)", "sin²(θ) - cos²(θ) = 1"],
      correctAnswerIndex: 0,
      explanation: "The Pythagorean identity states that sin²(θ) + cos²(θ) = 1 for any angle θ."
    },
    {
      question: "State the Sine Rule for a triangle ABC with sides a, b, c opposite to angles A, B, C.",
      options: ["a/sin(A) = b/sin(B) = c/sin(C)", "a*sin(A) = b*sin(B) = c*sin(C)", "sin(A)/a = sin(B)/b = sin(C)/c", "a^2 = b^2 + c^2 - 2bc cos(A)"],
      correctAnswerIndex: 0,
      explanation: "The Sine Rule states that the ratio of a side to the sine of its opposite angle is constant: a/sin(A) = b/sin(B) = c/sin(C)."
    },
    {
      question: "What is the compound angle formula for cos(A + B)?",
      options: ["cos(A)cos(B) - sin(A)sin(B)", "cos(A)cos(B) + sin(A)sin(B)", "cos(A)sin(B) - sin(A)cos(B)", "sin(A)cos(B) + cos(A)sin(B)"],
      correctAnswerIndex: 0,
      explanation: "The expansion of cos(A + B) is cos(A)cos(B) - sin(A)sin(B)."
    },
    {
      question: "What is the value of sin(2θ) in terms of single-angle functions?",
      options: ["2 sin(θ) cos(θ)", "sin²(θ) - cos²(θ)", "2 sin(θ)", "cos²(θ) - sin²(θ)"],
      correctAnswerIndex: 0,
      explanation: "The double-angle formula for sine is sin(2θ) = 2 sin(θ) cos(θ)."
    }
  ],
  "math-calculus": [
    {
      question: "What is the derivative of x^n with respect to x?",
      options: ["n * x^(n-1)", "x^(n+1) / (n+1)", "n * x^n", "n * x^(n+1)"],
      correctAnswerIndex: 0,
      explanation: "According to the power rule of differentiation, d/dx (x^n) = n * x^(n-1)."
    },
    {
      question: "What does the first derivative of a function represent geometrically?",
      options: ["The slope of the tangent to the curve at that point", "The area under the curve", "The length of the curve", "The curvature of the graph"],
      correctAnswerIndex: 0,
      explanation: "Geometrically, dy/dx evaluated at a point represents the slope of the tangent line to the curve at that point."
    },
    {
      question: "If a function f(x) has a local minimum or maximum at x = c and f is differentiable at c, what is the value of f'(c)?",
      options: ["0", "1", "Infinity", "Undefined"],
      correctAnswerIndex: 0,
      explanation: "At local extrema of a differentiable function, the tangent is horizontal, meaning the derivative f'(c) is zero."
    },
    {
      question: "What is the derivative of ln(x) with respect to x?",
      options: ["1/x", "e^x", "x", "-1/x^2"],
      correctAnswerIndex: 0,
      explanation: "The derivative of the natural logarithm function ln(x) is 1/x."
    }
  ],
  "math-combinatorics": [
    {
      question: "What is the value of the permutation nPr in terms of factorials?",
      options: ["n! / (n - r)!", "n! / r!", "n! / (r! * (n - r)!)", "n^r"],
      correctAnswerIndex: 0,
      explanation: "The number of permutations of n objects taken r at a time is nPr = n! / (n - r)!."
    },
    {
      question: "What is the value of the combination nCr in terms of factorials?",
      options: ["n! / (r! * (n - r)!)", "n! / (n - r)!", "n! / r!", "r! / (n - r)!"],
      correctAnswerIndex: 0,
      explanation: "The number of combinations of n objects taken r at a time is nCr = n! / (r! * (n - r)!)."
    },
    {
      question: "What is the relation between nPr and nCr?",
      options: ["nPr = r! * nCr", "nCr = r! * nPr", "nPr = nCr / r!", "nPr = r * nCr"],
      correctAnswerIndex: 0,
      explanation: "Since nPr = n! / (n - r)! and nCr = n! / (r! * (n - r)!), we have nPr = r! * nCr."
    },
    {
      question: "The Principle of Mathematical Induction consists of showing a statement holds for a base case (n=1) and proving:",
      options: ["If it holds for n=k, it must hold for n=k+1", "It holds for all prime numbers", "It holds for n=0", "If it holds for n=k, it must hold for n=2k"],
      correctAnswerIndex: 0,
      explanation: "In induction, the inductive step requires proving that if the statement holds for n = k, it also holds for n = k + 1."
    }
  ],
  "math-stats": [
    {
      question: "If the probability of an event happening is P(E), what is the probability of the complementary event (not E)?",
      options: ["1 - P(E)", "P(E)", "0", "1 / P(E)"],
      correctAnswerIndex: 0,
      explanation: "The sum of probabilities of all complementary outcomes is always 1, so P(not E) = 1 - P(E)."
    },
    {
      question: "For two independent events A and B, what is the probability of both events occurring simultaneously, P(A ∩ B)?",
      options: ["P(A) * P(B)", "P(A) + P(B)", "P(A) + P(B) - P(A ∪ B)", "P(A) / P(B)"],
      correctAnswerIndex: 0,
      explanation: "For independent events, the joint probability is the product of their individual probabilities: P(A ∩ B) = P(A) * P(B)."
    },
    {
      question: "What is the median of the following dataset: 3, 5, 7, 12, 15?",
      options: ["7", "8.4", "5", "12"],
      correctAnswerIndex: 0,
      explanation: "The dataset is sorted. The middle term (3rd term out of 5) is 7, which is the median."
    },
    {
      question: "The sum of the probabilities of all possible mutually exclusive outcomes in a sample space is:",
      options: ["1", "0", "Infinity", "Depends on sample size"],
      correctAnswerIndex: 0,
      explanation: "By probability axioms, the total probability of the entire sample space is exactly 1."
    }
  ],
  "science-physics-electro": [
    {
      question: "What is the mathematical formula representing Coulomb's Law of Electrostatics?",
      options: ["F = k * q1 * q2 / r²", "F = k * q1 * q2 / r", "F = m * a", "F = G * m1 * m2 / r²"],
      correctAnswerIndex: 0,
      explanation: "Coulomb's Law states that the electrostatic force is F = k * q1 * q2 / r²."
    },
    {
      question: "According to Ohm's Law, what is the relation between voltage (V), current (I), and resistance (R)?",
      options: ["V = I * R", "P = V * I", "V = I² * R", "R = V * I"],
      correctAnswerIndex: 0,
      explanation: "Ohm's Law states V = IR, voltage equals current times resistance."
    },
    {
      question: "What is the SI unit of capacitance?",
      options: ["Farad", "Coulomb", "Ohm", "Volt"],
      correctAnswerIndex: 0,
      explanation: "Capacitance is measured in Farads (F), which is defined as Coulombs per Volt."
    },
    {
      question: "Which of the following laws states that the induced electromotive force (EMF) is proportional to the rate of change of magnetic flux?",
      options: ["Faraday's Law of Induction", "Lenz's Law", "Ampere's Law", "Gauss's Law"],
      correctAnswerIndex: 0,
      explanation: "Faraday's Law of Induction states that EMF = -dΦ/dt, which is the rate of change of magnetic flux."
    }
  ],
  "science-physics-optics": [
    {
      question: "What is the focal length of a flat plane mirror?",
      options: ["Infinity", "Zero", "10 cm", "Depends on mirror size"],
      correctAnswerIndex: 0,
      explanation: "Since a plane mirror has no curvature (radius of curvature = infinity), its focal length is infinity."
    },
    {
      question: "What phenomenon causes a pencil partially submerged in a glass of water to appear bent?",
      options: ["Refraction", "Reflection", "Diffraction", "Total Internal Reflection"],
      correctAnswerIndex: 0,
      explanation: "Refraction is the bending of light as it passes from one transparent medium (air) into another of different optical density (water)."
    },
    {
      question: "What is the speed of sound in dry air at 20 degrees Celsius?",
      options: ["Approximately 343 m/s", "Approximately 1500 m/s", "Approximately 3 * 10^8 m/s", "Approximately 120 m/s"],
      correctAnswerIndex: 0,
      explanation: "The speed of sound in air at 20°C is approximately 343 metres per second."
    },
    {
      question: "Which type of lens is used to correct myopia (nearsightedness)?",
      options: ["Concave lens", "Convex lens", "Bifocal lens", "Cylindrical lens"],
      correctAnswerIndex: 0,
      explanation: "Myopia is corrected using a diverging (concave) lens to shift the focus of light onto the retina."
    }
  ],
  "science-physics-motion": [
    {
      question: "According to Newton's Second Law of Motion, what is force equal to?",
      options: ["Mass multiplied by acceleration (F = ma)", "Mass divided by velocity", "Momentum multiplied by time", "Work divided by distance"],
      correctAnswerIndex: 0,
      explanation: "Newton's second law defines force as the rate of change of momentum, which simplifies to F = ma for constant mass."
    },
    {
      question: "What is the acceleration due to gravity (g) on the surface of the Earth?",
      options: ["9.8 m/s²", "9.8 N/kg", "32 m/s²", "1.6 m/s²"],
      correctAnswerIndex: 0,
      explanation: "The average acceleration due to gravity on Earth is approximately 9.8 metres per second squared."
    },
    {
      question: "If an object is thrown vertically upwards, what is its velocity at the highest point of its trajectory?",
      options: ["Zero", "9.8 m/s", "Equal to initial velocity", "Infinite"],
      correctAnswerIndex: 0,
      explanation: "At the peak height, the object momentarily stops moving before descending, so its instantaneous velocity is zero."
    },
    {
      question: "The conservation of linear momentum states that if no external force acts on a system, the total momentum:",
      options: ["Remains constant", "Becomes zero", "Increases exponentially", "Fluctuates randomly"],
      correctAnswerIndex: 0,
      explanation: "Without external forces, the total momentum of a closed system is conserved (remains constant)."
    }
  ],
  "science-chemistry-metallurgy": [
    {
      question: "Which concentration method is preferred for separating sulphide ores from gangue?",
      options: ["Froth Flotation", "Gravity Separation (Hydraulic Washing)", "Magnetic Separation", "Leaching"],
      correctAnswerIndex: 0,
      explanation: "Froth flotation relies on the preferential wetting of sulphide ore particles by oil, separating them from water-wetted gangue."
    },
    {
      question: "What is the process of heating an ore below its melting point in the presence of excess air called?",
      options: ["Roasting", "Calcination", "Smelting", "Refining"],
      correctAnswerIndex: 0,
      explanation: "Roasting heats sulphide ores in air to convert them into oxides. Calcination heats carbonate or hydrated ores in limited air."
    },
    {
      question: "Which flux is added during the extraction of iron from haematite ore to remove silica gangue?",
      options: ["Limestone (Calcium Carbonate)", "Silica", "Coke", "Alumina"],
      correctAnswerIndex: 0,
      explanation: "Limestone decomposes to CaO (basic flux), which reacts with acidic silica gangue (SiO2) to form fusible slag (CaSiO3)."
    },
    {
      question: "What is the anode made of in the electrolytic refining of copper?",
      options: ["Impure copper plate", "Pure copper strip", "Graphite rod", "Platinum wire"],
      correctAnswerIndex: 0,
      explanation: "In electrolytic refining, the impure metal is made the anode (oxidized) and a thin sheet of pure metal is the cathode (reduced)."
    }
  ],
  "science-chemistry-bonding": [
    {
      question: "What is the geometry of a Xenon Tetrafluoride (XeF4) molecule according to VSEPR theory?",
      options: ["Square Planar", "Tetrahedral", "Octahedral", "Linear"],
      correctAnswerIndex: 0,
      explanation: "XeF4 has 4 bonding pairs and 2 lone pairs (sp3d2 hybridization), resulting in a square planar geometry."
    },
    {
      question: "Which type of chemical bond is formed by the complete transfer of electrons from a metal to a non-metal?",
      options: ["Ionic (Electrovalent) bond", "Covalent bond", "Coordinate covalent bond", "Metallic bond"],
      correctAnswerIndex: 0,
      explanation: "Ionic bonds are formed by the transfer of valence electrons, resulting in electrostatic attraction between ions."
    },
    {
      question: "Which group of elements is characterized by having a completely filled valence shell, making them inert?",
      options: ["Group 18 (Noble Gases)", "Group 17 (Halogens)", "Group 1 (Alkali Metals)", "Group 15 (Pnictogens)"],
      correctAnswerIndex: 0,
      explanation: "Noble gases have a stable octet (or duplet for He) configuration, showing very low chemical reactivity."
    },
    {
      question: "In [Co(NH3)6]Cl3, what is the coordination number of the Cobalt central metal ion?",
      options: ["6", "3", "9", "4"],
      correctAnswerIndex: 0,
      explanation: "Six monodentate ammonia ligands are directly coordinated to Cobalt, making the coordination number 6."
    }
  ],
  "science-chemistry-organic": [
    {
      question: "What is the general molecular formula for alkanes?",
      options: ["C_n H_(2n+2)", "C_n H_2n", "C_n H_(2n-2)", "C_n H_(2n+1)"],
      correctAnswerIndex: 0,
      explanation: "Alkanes are saturated hydrocarbons with the general formula C_n H_(2n+2)."
    },
    {
      question: "Which functional group is present in alcohols?",
      options: ["-OH", "-CHO", "-COOH", "-CO-"],
      correctAnswerIndex: 0,
      explanation: "Alcohols contain the hydroxyl (-OH) functional group."
    },
    {
      question: "What is the IUPAC name for the simplest carboxylic acid, HCOOH?",
      options: ["Methanoic acid", "Ethanoic acid", "Propanoic acid", "Formic acid"],
      correctAnswerIndex: 0,
      explanation: "HCOOH has one carbon, so its IUPAC name is methanoic acid. Formic acid is its common name."
    },
    {
      question: "Which biomolecule serves as the primary reservoir of genetic information in cells?",
      options: ["DNA", "RNA", "Protein", "Glycogen"],
      correctAnswerIndex: 0,
      explanation: "Deoxyribonucleic acid (DNA) is the main hereditary material in almost all living organisms."
    }
  ],
  "science-chemistry-physical": [
    {
      question: "Which equation calculates the cell potential under non-standard concentrations of reactants?",
      options: ["Nernst Equation", "Arrhenius Equation", "Gibbs-Helmholtz Equation", "Van 't Hoff Equation"],
      correctAnswerIndex: 0,
      explanation: "The Nernst Equation calculates the EMF of a cell based on temperature and reaction quotient: E = E° - (RT/nF)lnQ."
    },
    {
      question: "What is the pH of a neutral aqueous solution at 25 degrees Celsius?",
      options: ["7", "0", "14", "1"],
      correctAnswerIndex: 0,
      explanation: "At 25°C, neutral water has [H+] = 10^-7 M, which corresponds to pH = -log(10^-7) = 7."
    },
    {
      question: "According to Le Chatelier's Principle, what happens to an exothermic reaction at equilibrium if temperature is increased?",
      options: ["Equilibrium shifts in the backward direction", "Equilibrium shifts in the forward direction", "Equilibrium constant increases", "No change occurs"],
      correctAnswerIndex: 0,
      explanation: "Increasing temperature shifts the equilibrium in the endothermic direction. For an exothermic reaction, this is the backward direction."
    }
  ],
  "science-biology-genetics": [
    {
      question: "What is the phenotypic ratio of a Mendelian F2 generation in a monohybrid cross?",
      options: ["3:1", "1:2:1", "9:3:3:1", "1:1"],
      correctAnswerIndex: 0,
      explanation: "A monohybrid cross yields 3 dominant phenotype individuals to 1 recessive phenotype individual in the F2 generation."
    },
    {
      question: "Which of the following processes creates identical copies of double-stranded DNA before cell division?",
      options: ["Replication", "Transcription", "Translation", "Mitosis"],
      correctAnswerIndex: 0,
      explanation: "DNA replication is the process of synthesizing two identical strands from a single template DNA molecule."
    },
    {
      question: "According to Darwin's theory of evolution, what is the primary mechanism of evolutionary adaptation?",
      options: ["Natural Selection", "Use and Disuse of Organs", "Genetic Drift", "Inheritance of Acquired Characteristics"],
      correctAnswerIndex: 0,
      explanation: "Darwin proposed natural selection, where organisms with favorable traits are more likely to survive and reproduce."
    },
    {
      question: "In humans, which sex chromosomes determine male gender?",
      options: ["XY", "XX", "XO", "XXY"],
      correctAnswerIndex: 0,
      explanation: "Females inherit two X chromosomes (XX), while males inherit one X and one Y chromosome (XY)."
    }
  ],
  "science-biology-cell": [
    {
      question: "Which organelle is referred to as the 'powerhouse of the cell' due to its role in ATP synthesis?",
      options: ["Mitochondrion", "Nucleus", "Ribosome", "Chloroplast"],
      correctAnswerIndex: 0,
      explanation: "Mitochondria carry out aerobic cellular respiration, generating chemical energy in the form of ATP."
    },
    {
      question: "What is the primary structural difference between prokaryotic and eukaryotic cells?",
      options: ["Eukaryotes possess a defined nucleus and membrane-bound organelles", "Prokaryotes contain a cell wall, eukaryotes do not", "Eukaryotes lack ribosomes", "Prokaryotes are always larger than eukaryotes"],
      correctAnswerIndex: 0,
      explanation: "Eukaryotes have genetic material enclosed in a nuclear membrane (nucleus) and membrane-bound organelles. Prokaryotes lack these structures."
    },
    {
      question: "Which type of plant tissue is composed of actively dividing cells responsible for primary and secondary growth?",
      options: ["Meristematic tissue", "Parenchyma tissue", "Sclerenchyma tissue", "Xylem tissue"],
      correctAnswerIndex: 0,
      explanation: "Meristematic tissues consist of undifferentiated, actively dividing cells located at growth regions (roots, shoots)."
    }
  ],
  "science-biology-health": [
    {
      question: "Which of the following is an infectious disease caused by a virus?",
      options: ["Influenza", "Tuberculosis", "Malaria", "Diabetes"],
      correctAnswerIndex: 0,
      explanation: "Influenza is viral. Tuberculosis is bacterial, malaria is protozoan, and diabetes is non-infectious metabolic."
    },
    {
      question: "Which component of blood is primarily responsible for immune defense against pathogens?",
      options: ["White Blood Cells (Leukocytes)", "Red Blood Cells (Erythrocytes)", "Platelets (Thrombocytes)", "Plasma proteins"],
      correctAnswerIndex: 0,
      explanation: "Leukocytes (WBCs) identify, attack, and eliminate foreign invaders like bacteria and viruses."
    }
  ],
  "science-biology-ecology": [
    {
      question: "What is the term for a community of living organisms interacting with their non-living physical environment?",
      options: ["Ecosystem", "Biosphere", "Population", "Biome"],
      correctAnswerIndex: 0,
      explanation: "An ecosystem comprises the biotic community (organisms) and abiotic factors (soil, water, climate) interacting as a unit."
    },
    {
      question: "In an ecological food chain, which group of organisms occupies the first trophic level?",
      options: ["Producers (Autotrophs)", "Primary Consumers (Herbivores)", "Secondary Consumers (Carnivores)", "Decomposers"],
      correctAnswerIndex: 0,
      explanation: "Autotrophs (green plants) produce food via photosynthesis, forming the base of the food chain at the first trophic level."
    }
  ]
};

// Fallback collections to keep everything professional
const FALLBACK_MATH: Question[] = [
  {
    question: "Evaluate the equation: if 3x - 7 = 14, what is the value of x?",
    options: ["7", "3", "21", "14"],
    correctAnswerIndex: 0,
    explanation: "Add 7 to both sides: 3x = 21. Divide by 3: x = 7."
  },
  {
    question: "What is the sum of all interior angles of a planar hexagon?",
    options: ["720 degrees", "540 degrees", "360 degrees", "180 degrees"],
    correctAnswerIndex: 0,
    explanation: "Sum of angles is (n - 2) * 180. For n=6: (6 - 2) * 180 = 4 * 180 = 720 degrees."
  },
  {
    question: "If the radius of a circle is doubled, what happens to its total area?",
    options: ["It quadruples (4x)", "It doubles (2x)", "It remains identical", "It increases by factor of pi"],
    correctAnswerIndex: 0,
    explanation: "Area = πr². If r becomes 2r, new Area = π(2r)² = 4πr²."
  }
];

const FALLBACK_SCIENCE: Question[] = [
  {
    question: "Which of the following is the fundamental unit of temperature in the SI system?",
    options: ["Kelvin", "Celsius", "Fahrenheit", "Rankine"],
    correctAnswerIndex: 0,
    explanation: "The kelvin (K) is the SI base unit of thermodynamic temperature."
  },
  {
    question: "What state of matter is characterized by having a definite volume but no definite shape?",
    options: ["Liquid", "Solid", "Gas", "Plasma"],
    correctAnswerIndex: 0,
    explanation: "Liquids take the shape of their container but maintain a constant volume."
  },
  {
    question: "According to the Law of Conservation of Energy, energy can neither be created nor:",
    options: ["Destroyed", "Transformed", "Stored", "Measured"],
    correctAnswerIndex: 0,
    explanation: "The law states that energy cannot be created or destroyed, only converted from one form to another."
  }
];

const FALLBACK_GENERAL: Question[] = [
  {
    question: "What is the primary benefit of studying structured academic courses?",
    options: ["To develop cognitive reasoning and analytical problem solving", "Only to pass standard examinations", "To memorize facts without application", "There is no practical benefit"],
    correctAnswerIndex: 0,
    explanation: "Education seeks to foster logical deduction, critical thinking, and structured analysis skills."
  },
  {
    question: "When approaching complex academic challenges, which strategy is most effective?",
    options: ["Breaking the topic down into structured sub-concepts", "Attempting to memorize whole passages", "Skipping complex items", "Guessing without reading"],
    correctAnswerIndex: 0,
    explanation: "Deconstructing large topics into structured components is a proven educational strategy."
  }
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuiz(
  subjectTitle: string,
  chapterTitle: string,
  topicTitle: string,
) {
  const cleanSubject = subjectTitle.toLowerCase();
  const cleanChapter = chapterTitle.toLowerCase();
  const cleanTopic = topicTitle.toLowerCase();

  let pool: Question[] = [];

  // 1. Math matching
  if (cleanSubject.includes("math")) {
    if (
      cleanChapter.includes("set") ||
      cleanChapter.includes("relation") ||
      cleanChapter.includes("function") ||
      cleanTopic.includes("set") ||
      cleanTopic.includes("relation") ||
      cleanTopic.includes("function")
    ) {
      pool = QUESTION_BANK["math-sets"];
    } else if (
      cleanChapter.includes("complex") ||
      cleanTopic.includes("complex")
    ) {
      pool = QUESTION_BANK["math-complex"];
    } else if (
      cleanChapter.includes("matrix") ||
      cleanChapter.includes("determinant") ||
      cleanTopic.includes("matrix") ||
      cleanTopic.includes("determinant")
    ) {
      pool = QUESTION_BANK["math-matrix"];
    } else if (
      cleanChapter.includes("equation") ||
      cleanTopic.includes("equation")
    ) {
      pool = QUESTION_BANK["math-equations"];
    } else if (
      cleanChapter.includes("geometry") ||
      cleanChapter.includes("vector") ||
      cleanChapter.includes("locus") ||
      cleanChapter.includes("conic") ||
      cleanChapter.includes("line") ||
      cleanTopic.includes("geometry") ||
      cleanTopic.includes("vector") ||
      cleanTopic.includes("locus") ||
      cleanTopic.includes("conic") ||
      cleanTopic.includes("line")
    ) {
      pool = QUESTION_BANK["math-geometry"];
    } else if (
      cleanChapter.includes("trig") ||
      cleanTopic.includes("trig")
    ) {
      pool = QUESTION_BANK["math-trig"];
    } else if (
      cleanChapter.includes("calculus") ||
      cleanChapter.includes("limit") ||
      cleanChapter.includes("diff") ||
      cleanTopic.includes("calculus") ||
      cleanTopic.includes("limit") ||
      cleanTopic.includes("diff")
    ) {
      pool = QUESTION_BANK["math-calculus"];
    } else if (
      cleanChapter.includes("combinat") ||
      cleanChapter.includes("induction") ||
      cleanChapter.includes("count") ||
      cleanTopic.includes("combinat") ||
      cleanTopic.includes("induction") ||
      cleanTopic.includes("count")
    ) {
      pool = QUESTION_BANK["math-combinatorics"];
    } else if (
      cleanChapter.includes("stat") ||
      cleanChapter.includes("prob") ||
      cleanChapter.includes("mensur") ||
      cleanTopic.includes("stat") ||
      cleanTopic.includes("prob") ||
      cleanTopic.includes("mensur")
    ) {
      pool = QUESTION_BANK["math-stats"];
    } else {
      pool = FALLBACK_MATH;
    }
  }
  // 2. Science matching
  else if (
    cleanSubject.includes("science") ||
    cleanSubject.includes("physics") ||
    cleanSubject.includes("chem") ||
    cleanSubject.includes("bio")
  ) {
    const isPhysics = cleanSubject.includes("physics") || cleanChapter.includes("physics") || cleanTopic.includes("physics");
    const isChemistry = cleanSubject.includes("chemistry") || cleanSubject.includes("chem") || cleanChapter.includes("chemistry") || cleanTopic.includes("chemistry") || cleanChapter.includes("chem") || cleanTopic.includes("chem");
    const isBiology = cleanSubject.includes("biology") || cleanSubject.includes("bio") || cleanChapter.includes("biology") || cleanTopic.includes("biology") || cleanChapter.includes("bio") || cleanTopic.includes("bio");

    if (isPhysics || cleanChapter.includes("electro") || cleanChapter.includes("electri") || cleanChapter.includes("magnet") || cleanChapter.includes("induction") || cleanTopic.includes("electro") || cleanTopic.includes("electri") || cleanTopic.includes("magnet") || cleanTopic.includes("induction")) {
      if (cleanChapter.includes("electro") || cleanChapter.includes("electri") || cleanChapter.includes("magnet") || cleanTopic.includes("electro") || cleanTopic.includes("electri") || cleanTopic.includes("magnet")) {
        pool = QUESTION_BANK["science-physics-electro"];
      } else if (cleanChapter.includes("optic") || cleanChapter.includes("acoust") || cleanChapter.includes("sound") || cleanChapter.includes("wave") || cleanTopic.includes("optic") || cleanTopic.includes("acoust") || cleanTopic.includes("sound") || cleanTopic.includes("wave")) {
        pool = QUESTION_BANK["science-physics-optics"];
      } else {
        pool = QUESTION_BANK["science-physics-motion"];
      }
    } else if (isChemistry || cleanChapter.includes("metall") || cleanTopic.includes("metall")) {
      if (cleanChapter.includes("metall") || cleanTopic.includes("metall")) {
        pool = QUESTION_BANK["science-chemistry-metallurgy"];
      } else if (cleanChapter.includes("organic") || cleanChapter.includes("carbon") || cleanChapter.includes("biomolec") || cleanTopic.includes("organic") || cleanTopic.includes("carbon") || cleanTopic.includes("biomolec")) {
        pool = QUESTION_BANK["science-chemistry-organic"];
      } else if (cleanChapter.includes("reaction") || cleanChapter.includes("acid") || cleanChapter.includes("base") || cleanChapter.includes("salt") || cleanChapter.includes("equilibrium") || cleanChapter.includes("electrochem") || cleanTopic.includes("reaction") || cleanTopic.includes("acid") || cleanTopic.includes("base") || cleanTopic.includes("salt") || cleanTopic.includes("equilibrium") || cleanTopic.includes("electrochem")) {
        pool = QUESTION_BANK["science-chemistry-physical"];
      } else {
        pool = QUESTION_BANK["science-chemistry-bonding"];
      }
    } else if (isBiology) {
      if (cleanChapter.includes("cell") || cleanChapter.includes("tissu") || cleanChapter.includes("morphol") || cleanTopic.includes("cell") || cleanTopic.includes("tissu") || cleanTopic.includes("morphol")) {
        pool = QUESTION_BANK["science-biology-cell"];
      } else if (cleanChapter.includes("health") || cleanChapter.includes("ill") || cleanChapter.includes("disease") || cleanTopic.includes("health") || cleanTopic.includes("ill") || cleanTopic.includes("disease")) {
        pool = QUESTION_BANK["science-biology-health"];
      } else if (cleanChapter.includes("ecolog") || cleanChapter.includes("environ") || cleanChapter.includes("resource") || cleanChapter.includes("divers") || cleanTopic.includes("ecolog") || cleanTopic.includes("environ") || cleanTopic.includes("resource") || cleanTopic.includes("divers")) {
        pool = QUESTION_BANK["science-biology-ecology"];
      } else {
        pool = QUESTION_BANK["science-biology-genetics"];
      }
    } else {
      pool = FALLBACK_SCIENCE;
    }
  } else {
    pool = FALLBACK_GENERAL;
  }

  // Ensure pool exists and has at least 10 questions by padding with fallbacks and other categories
  let finalPool = pool ? [...pool] : [];
  const isMath = cleanSubject.includes("math");
  const isSci = cleanSubject.includes("science") || cleanSubject.includes("phys") || cleanSubject.includes("chem") || cleanSubject.includes("bio");

  if (finalPool.length < 10) {
    const fallbackList: Question[] = [];
    if (isMath) {
      fallbackList.push(...FALLBACK_MATH);
      Object.keys(QUESTION_BANK).forEach((key) => {
        if (key.startsWith("math-")) {
          fallbackList.push(...QUESTION_BANK[key]);
        }
      });
    } else if (isSci) {
      fallbackList.push(...FALLBACK_SCIENCE);
      Object.keys(QUESTION_BANK).forEach((key) => {
        if (key.startsWith("science-")) {
          fallbackList.push(...QUESTION_BANK[key]);
        }
      });
    } else {
      fallbackList.push(...FALLBACK_GENERAL);
    }

    // Add unique questions from our constructed fallback list
    for (const q of fallbackList) {
      if (finalPool.length >= 10) break;
      if (!finalPool.some((existing) => existing.question === q.question)) {
        finalPool.push(q);
      }
    }

    // Safeguard: pad with general fallbacks if still short
    for (const q of FALLBACK_GENERAL) {
      if (finalPool.length >= 10) break;
      if (!finalPool.some((existing) => existing.question === q.question)) {
        finalPool.push(q);
      }
    }

    // Absolute fallback: duplicate existing questions with a suffix
    let backupIndex = 0;
    while (finalPool.length < 10 && finalPool.length > 0) {
      const copy = { ...finalPool[backupIndex % finalPool.length] };
      copy.question = `${copy.question} (Review)`;
      finalPool.push(copy);
      backupIndex++;
    }
  }

  pool = finalPool;

  // Map each question to match the LMS Quiz interface expectations
  const mappedQuestions = pool.map((q, qIndex) => {
    // Determine difficulty label
    let difficulty = "Medium";
    if (qIndex % 3 === 0) difficulty = "Easy";
    else if (qIndex % 3 === 2) difficulty = "Hard";

    const originalOptions = [...q.options];
    const correctOption = originalOptions[q.correctAnswerIndex];

    // Shuffle options
    const shuffledOptions = shuffle(originalOptions);
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);

    return {
      id: `q_${cleanSubject.substring(0, 3)}_${qIndex}_${Date.now()}`,
      question: q.question,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
      explanation: q.explanation,
      difficulty
    };
  });

  return shuffle(mappedQuestions).slice(0, 10);
}

export function generateQuizForChapter(
  classId: string,
  subjectId: string,
  chapterId: string,
  chapterTitle: string,
) {
  // Strip leading numeric prefixes (e.g. "Chapter 1: ") from chapter titles for clean quiz names
  const cleanTitle = chapterTitle.replace(/^(?:Chapter\s+\d+:\s*|\d+[\.\d]*\s*)/i, "");
  const questions = generateQuiz(subjectId, cleanTitle, cleanTitle);
  return {
    id: `quiz_${chapterId}`,
    title: `${cleanTitle} Quiz`,
    subjectId,
    chapterId,
    durationMinutes: 10,
    questions,
  };
}
