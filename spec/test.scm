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
      (pass (string-append "Value " value " was expected to be " expected))
      (fail (string-append "Value " value " was expected to be " expected)))))

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

;; eq?
(assert (eq? '() '()) #t)
(assert (eq? 123 123) #t)
(assert (eq? 123 '123) #t)
(assert (eq? "Hello World" "Hello World") #t)
(assert (eq? "Hello World" '"Hello World") #t)
(assert (eq? (list 1 2 3) (1 2 3)) #f)
(assert (eq? (list 1 2 3) '(1 2 3)) #f)
(assert (eq? 'a 'a) #t)
(assert (eq? 'a 'A) #f)

;; eqv?
(assert (eqv? '() '()) #t)
(assert (eqv? 123 123) #t)
(assert (eqv? 123 '123) #t)
(assert (eqv? "Hello World" "Hello World") #t)
(assert (eqv? "Hello World" '"Hello World") #t)
(assert (eqv? (list 1 2 3) (1 2 3)) #f)
(assert (eqv? (list 1 2 3) '(1 2 3)) #f)
(assert (eqv? 'a 'a) #t)
(assert (eqv? 'a 'A) #f)

;; equal?
(assert (equal? '() '()) #t)
(assert (equal? 123 123) #t)
(assert (equal? 123 '123) #t)
(assert (equal? "Hello World" "Hello World") #t)
(assert (equal? "Hello World" '"Hello World") #t)
(assert (equal? (list 1 2 3) (1 2 3)) #t)
(assert (equal? (list 1 2 3) '(1 2 3)) #t)
(assert (equal? (list 1 2 3) (1 1 1)) #f)
(assert (equal? (list 1 2 3) (1)) #f)
(assert (equal? 'a 'a) #t)
(assert (equal? 'a 'A) #f)

;; car, cdr, cons
(assert (car (1 2)) 1)
(assert (cdr (1 2 3)) (2 3))
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

;; let

(define let_val 0)
(let ((a 10) (b 15))
  (set! let_val (+ a b)))
(assert let_val 25)

(assert (let ((a 10))
          (let ((b (+ 5 10)))
            (+ a b))) 25)

(assert (let ((a let_val))
          (let ((b (+ 5 10)))
            (set! a (+ a 10))
            (+ a b))) 50)

(assert (let ((let_val 10)) let_val) 10)
(assert (let ((let_val let_val)) let_val) 25)

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
