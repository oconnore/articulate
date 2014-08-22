test: src/Grammar.js
	node_modules/.bin/mocha -R spec -u tdd --recursive test/

src/Grammar.js: src/grammar/syntax.y
	node_modules/.bin/jison src/grammar/syntax.y -p lalr -o src/Grammar.js

install:
	npm install
  

.PHONY: test install
  
