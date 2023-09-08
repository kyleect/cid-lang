(define passed 0)
(define failed 0)

(define pass
  (lambda (message)
    (set! passed (+ passed 1))
    (display "Pass!" message)))

(define fail
  (lambda (message)
    (set! failed (+ failed 1))
    (display "Fail!" message)))

(define assert
  (lambda (value expected)
    (if (equal? value expected)
      (pass (string-append "Value was expected to be" expected))
      (fail (string-append "Value was expected to be" expected)))))

(define assert-equal?
  (lambda (a b expected)
    (assert (equal? a b) expected)))

;; equal?
(assert-equal? '() '() #t)
(assert-equal? 123 123 #t)
(assert-equal? 123 '123 #t)
(assert-equal? "Hello World!" "Hello World!" #t)
(assert-equal? "Hello World!" '"Hello World!" #t)
(assert-equal? (list 1 2 3) (1 2 3) #f)
(assert-equal? (list 1 2 3) '(1 2 3) #f)

;; number?
(assert (number? 123) #t)
(assert (number? '123) #t)
(assert (number? 123.45) #t)
(assert (number? -123) #t)
(assert (number? -123.45) #t)
(assert (number? "Hello") #f)
(assert (number? ()) #f)
(assert (number? (1)) #f)
(assert (number? (1 2 3)) #f)
(assert (number? 'a) #f)
(assert (number? +) #f)

;; Results

(display "-----------")
(display "RESULTS")
(display "-----------")
(display "Passed:" passed)
(display "Failed:" failed)
(display "-----------")

(display "Exit with code:" failed)
(exit failed)
