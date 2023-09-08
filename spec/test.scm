(define passed 0)
(define failed 0)

(define pass
  (lambda (message)
    (set! passed (+ passed 1))
    (display "Pass!:" message)))

(define fail
  (lambda (message)
    (set! failed (+ failed 1))
    (display "Failed!:" message)))

(define test-equal?
  (lambda (a b expected)
    (if (equal? expected (equal? a b))
      (pass (string-append a b expected))
      (fail (string-append a b expected)))))

"equal?"

(test-equal? '() '() #t)
(test-equal? 123 123 #t)
(test-equal? 123 '123 #t)
(test-equal? "Hello World!" "Hello World!" #t)
(test-equal? "Hello World!" '"Hello World!" #t)
(test-equal? (list 1 2 3) (1 2 3) #f)
(test-equal? (list 1 2 3) '(1 2 3) #f)

(display "-----------")
(display "RESULTS")
(display "-----------")
(display "Passed:" passed)
(display "Failed:" failed)
(display "-----------")

(define exit-code failed)

(display "Exit with code:" exit-code)
(exit exit-code)
