(define passed 0)
(define failed 0)

(define pass
  (lambda (expected actual)
    (set! passed (+ passed 1))
    (display "Pass! Expected:" expected "Actual:" actual)))

(define fail
  (lambda (expected actual)
    (set! failed (+ failed 1))
    (display "Failed! Expected:" expected "Actual:" actual)))

(define test
  (lambda (expected actual)
    (if (equal? expected actual)
      (pass expected actual)
      (fail expected actual))))

"equals?"

(test '() '())
(test 123 123)
(test 123 '123)
(test "Hello World!" "Hello World!")
(test "Hello World!" '"Hello World!")
(test (list 1 2 3) (1 2 3))
(test (list 1 2 3) '(1 2 3))

(display "-----------")
(display "RESULTS")
(display "-----------")
(display "Passed:" passed)
(display "Failed:" failed)