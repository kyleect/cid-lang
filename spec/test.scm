(define passed 0)
(define failed 0)

(define pass
  (lambda (message)
    (begin
      (set! passed (+ passed 1))
      (display "Pass!" message))))

(define fail
  (lambda (message)
    (begin
      (set! failed (+ failed 1))
      (display "Fail!" message))))

(define assert
  (lambda (value expected)
    (if (equal? value expected)
      (pass (string-append "Value" value "was expected to be" expected))
      (fail (string-append "Value" value "was expected to be" expected)))))

(define assert-equal?
  (lambda (a b expected)
    (assert (equal? a b) expected)))

;; Math

(assert (+ 10 5) 15)
(assert (- 10 5)  5)
(assert (* 10 5) 50)
(assert (/ 10 5)  2)

(assert (>  10 5) #t)
(assert (>  5 10) #f)
(assert (>  5  5) #f)
(assert (>= 10 5) #t)
(assert (>= 5 10) #f)
(assert (>= 5  5) #t)

(assert (<  10 5) #f)
(assert (<  5 10) #t)
(assert (<  5  5) #f)
(assert (<= 10 5) #f)
(assert (<= 5 10) #t)
(assert (<= 5  5) #t)

;; equal?
(assert-equal? '() '() #t)
(assert-equal? 123 123 #t)
(assert-equal? 123 '123 #t)
(assert-equal? "Hello World!" "Hello World!" #t)
(assert-equal? "Hello World!" '"Hello World!" #t)
(assert-equal? (list 1 2 3) (1 2 3) #f)
(assert-equal? (list 1 2 3) '(1 2 3) #f)

(assert-equal? 1 (car (cons 1 2)) #t)
(assert-equal? 2 (cdr (cons 1 2)) #t)

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
(assert (number? #t) #f)
(assert (number? #f) #f)

;; string?
(assert (string? 123) #f)
(assert (string? '123) #f)
(assert (string? 123.45) #f)
(assert (string? -123) #f)
(assert (string? -123.45) #f)
(assert (string? "Hello") #t)
(assert (string? ()) #f)
(assert (string? (1)) #f)
(assert (string? (1 2 3)) #f)
(assert (string? 'a) #f)
(assert (string? +) #f)
(assert (string? #t) #f)
(assert (string? #f) #f)

;; boolean?
(assert (boolean? 123) #f)
(assert (boolean? '123) #f)
(assert (boolean? 123.45) #f)
(assert (boolean? -123) #f)
(assert (boolean? -123.45) #f)
(assert (boolean? "Hello") #f)
(assert (boolean? ()) #f)
(assert (boolean? (1)) #f)
(assert (boolean? (1 2 3)) #f)
(assert (boolean? 'a) #f)
(assert (boolean? +) #f)
(assert (boolean? #t) #t)
(assert (boolean? #f) #t)

;; symbol?
(assert (symbol? 123) #f)
(assert (symbol? '123) #f)
(assert (symbol? 123.45) #f)
(assert (symbol? -123) #f)
(assert (symbol? -123.45) #f)
(assert (symbol? "Hello") #f)
(assert (symbol? ()) #f)
(assert (symbol? (1)) #f)
(assert (symbol? (1 2 3)) #f)
(assert (symbol? 'a) #t)
(assert (symbol? +) #f)
(assert (symbol? #t) #f)
(assert (symbol? #f) #f)

;; list?
(assert (list? 123) #f)
(assert (list? '123) #f)
(assert (list? 123.45) #f)
(assert (list? -123) #f)
(assert (list? -123.45) #f)
(assert (list? "Hello") #f)
(assert (list? ()) #t)
(assert (list? (1)) #t)
(assert (list? (1 2 3)) #t)
(assert (list? 'a) #f)
(assert (list? +) #f)
(assert (list? #t) #f)
(assert (list? #f) #f)

;; pair?
(assert (pair? 123) #f)
(assert (pair? '123) #f)
(assert (pair? 123.45) #f)
(assert (pair? -123) #f)
(assert (pair? -123.45) #f)
(assert (pair? "Hello") #f)
(assert (pair? ()) #f)
(assert (pair? (1)) #t)
(assert (pair? (1 2 3)) #t)
(assert (pair? 'a) #f)
(assert (pair? +) #f)
(assert (pair? #t) #f)
(assert (pair? #f) #f)

;; string-append
(assert (string-append 1 2 3) "123")
(assert (string-append "Hello" 'World) "HelloWorld")
(assert (string-append "Hello " 'World) "Hello World")

;; string-append
(assert (string-join ("Hello" 'World) " ") "Hello World")
(assert (string-join ("Hello" 'World) ",") "Hello,World")
;; TODO: This causes memory leak
;(assert (string-join ("Hello" 'World) "")  "HelloWorld")

;; lambda

;; Calling Defined Lambda
(define id (lambda (x) x))
(assert (id 10) 10)

;; Calling Inline Lambda
(assert ((lambda (x) x) 10) 10)

;; Single Expression Body Only
(define id2 (lambda (x) 'x x))
(assert (id2 10) 'x)

;; Nested Defined Lambda
(define nestedFn (lambda (a)
    (lambda (b)
      (+ a b))))
(assert ((nestedFn 10) 15) 25)

;; Nested Inline Lambda
(assert (((lambda (a)
    (lambda (b)
      (+ a b))) 10) 15) 25)

;; begin
(define begin_val 0)
(assert 
  (begin
    (set! begin_val 5)
    (+ begin_val 1))
  6)

;; Results

(display "-----------")
(display "RESULTS")
(display "-----------")
(display "Passed:" passed)
(display "Failed:" failed)
(display "-----------")

(display "Exit with code:" failed)
(exit failed)
