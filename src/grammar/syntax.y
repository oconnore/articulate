%start article

%% /* grammar */
 
article
  : elements EOF {return $1;}
  | EOF {return [];}
  ;

elements
  : elements unit {$$ = yy.unify($1.concat($2)); }
  | unit {$$ = $1;}
  ;

unit
  : entity {$$ = $1;}
  | macro {$$ = [$1];}
  | WS {$$ = [$1];}
  ;

nopbUnit
  : macro {$$ = [$1];}
  | WS {$$ = $1;}
  | nopbEntity {$$ = $1;}
  ;

nobUnit
  : macro {$$ = [$1];}
  | WS {$$ = $1;}
  | nobEntity {$$ = $1;}
  ;

nopbEntity
  : WORD
    {$$ = [$1];}
  | nopbControl
    {$$ = [$1];}
  | ESC escapedEntity 
    {$$ = $2;}
  ;

nobEntity
  : WORD
    {$$ = [$1];}
  | nobControl
    {$$ = [$1];}
  | ESC escapedEntity
    {$$ = $2;}
  ;

macro
  : premacro '<'
    {$$ = $1;}
  ;

premacro
  : '%' wref
    {$$ = new yy.Macro($2, [], [], yy);}
  | '%' wref WS
    {$$ = new yy.Macro($2, [], [], yy);}
  | '%' wref params
    {$$ = new yy.Macro($2, $3, [], yy);}
  | '%' wref params WS
    {$$ = new yy.Macro($2, $3, [], yy);}
  | '%' wref pipe
    {$$ = new yy.Macro($2, $3, [], yy);}
  | '%' wref pipe WS
    {$$ = new yy.Macro($2, $3, [], yy);}
  | '%' wref params WS pipe
    {$$ = new yy.Macro($2, $3, $5, yy);}
  | '%' wref params WS pipe WS
    {$$ = new yy.Macro($2, $3, $5, yy);}
  | '%' wref params pipe
    {$$ = new yy.Macro($2, $3, $4, yy);}
  | '%' wref params pipe WS
    {$$ = new yy.Macro($2, $3, $4, yy);}
  | '%' wref WS pipe
    {$$ = new yy.Macro($2, [], $4, yy);}
  | '%' wref WS pipe WS
    {$$ = new yy.Macro($2, [], $4, yy);}
  ;

pipe
  : '|' wref 
    {$$ = [new yy.Pipe($2)];}
  | '|' WS wref 
    {$$ = [new yy.Pipe($3)];}
  | '|' wref params
    {$$ = [new yy.Pipe($2, $3)];}
  | '|' WS wref params
    {$$ = [new yy.Pipe($3, $4)];}

  | pipe '|' wref 
    {$$ = $1.concat([new yy.Pipe($3)]);}
  | pipe '|' WS wref 
    {$$ = $1.concat([new yy.Pipe($4)]);}
  | pipe '|' wref params
    {$$ = $1.concat([new yy.Pipe($3, $4)]);}
  | pipe '|' WS wref params
    {$$ = $1.concat([new yy.Pipe($4, $5)]);}

  | pipe WS '|' wref 
    {$$ = $1.concat([new yy.Pipe($3)]);}
  | pipe WS '|' WS wref 
    {$$ = $1.concat([new yy.Pipe($4)]);}
  | pipe WS '|' wref params
    {$$ = $1.concat([new yy.Pipe($4, $5)]);}
  | pipe WS '|' WS wref params
    {$$ = $1.concat([new yy.Pipe($5, $6)]);}
  ;

body
  : '{' elements '}'
    {$$ = $2;}
  | '{' '}'
    {$$ = [];}
  ;

wref
  : WORD {$$ = $1;}
  | wref WORD {$$ = $1 + $2;}
  ;

params
  : '(' plist ')' {$$ = $2;}
  | '(' WS ')' {$$ = [];}
  | '(' ')' {$$ = [];}
  ;

plist
  : plist ',' plistItem
    {$$ = $1.concat([$3]);}
  | plistItem
    {$$ = [$1];}
  ;

plistItem
  : pentity
    {$$ = $1;}
  | WS pentity
    {$$ = $2;}
  ;

pentity
  : WORD
    {$$ = $1;}
  | string
    {$$ = $1;}
  | paramControl
    {$$ = $1;}
  | pentity WS
    {$$ = $1;}
  | pentity WORD 
    {$$ = $1 + $2;}
  | pentity string
    {$$ = $1 + $2;}
  | pentity paramControl
    {$$ = $1 + $2;}
  | pentity ESC ESC
    {$$ = $1 + "\\";}
  | pentity ESC control
    {$$ = $1 + $3;}
  ;

entity
  : WORD
    {$$ = [$1];}
  | bodyControl
    {$$ = [$1];}
  | ESC escapedEntity 
    {$$ = $2;}
  ;

escapedEntity
  : ESC {$$ = ["\\"];}
  | control {$$ = [$1];}
  | WORD nopbUnit
    {$$ = [new yy.Command($1, [], [])].concat($2);}
  | WORD params nobUnit
    {$$ = [new yy.Command($1, $2, [])].concat($2);}
  | WORD body
    {$$ = [new yy.Command($1, [], $2)];}
  | WORD params body 
    {$$ = [new yy.Command($1, $2, $3)];}
  ;
bodyControl
  : '(' {$$ = $1;}
  | ')' {$$ = $1;}
  | '{' {$$ = $1;}
  | '|' {$$ = $1;}
  | '<' {$$ = $1;}
  | ',' {$$ = $1;}
  | '"' {$$ = $1;}
  ;

nobControl
  : ')' {$$ = $1;}
  | '(' {$$ = $1;}
  | '|' {$$ = $1;}
  | '<' {$$ = $1;}
  | ',' {$$ = $1;}
  | '"' {$$ = $1;}
  ;

nopbControl
  : ')' {$$ = $1;}
  | '|' {$$ = $1;}
  | '<' {$$ = $1;}
  | ',' {$$ = $1;}
  | '"' {$$ = $1;}
  ;

control
  : '(' {$$ = $1;}
  | ')' {$$ = $1;}
  | '{' {$$ = $1;}
  | '}' {$$ = $1;}
  | '|' {$$ = $1;}
  | '%' {$$ = $1;}
  | '<' {$$ = $1;}
  | ',' {$$ = $1;}
  | '"' {$$ = $1;}
  ;

paramControl
  : '{' {$$ = $1;}
  | '}' {$$ = $1;}
  | '|' {$$ = $1;}
  | '%' {$$ = $1;}
  | '<' {$$ = $1;}
  ;

string
  : '"' innerString '"'
    {$$ = $2;}
  ;

innerString
  : innerString nonQuote
    {$$ = $1 + $2;}
  | innerString '\' '"'
    {$$ = $1 + $3;}
  | innerString '\' nonQuote
    {$$ = $1 + "\\" + $3;}
  | /* empty */
    {$$ = '';}
  ;

nonQuote
  : WORD {$$ = $1;}
  | WS {$$ = $1;}
  | '(' {$$ = $1;}
  | ')' {$$ = $1;}
  | '{' {$$ = $1;}
  | '}' {$$ = $1;}
  | '|' {$$ = $1;}
  | '<' {$$ = $1;}
  | '%' {$$ = $1;}
  | ',' {$$ = $1;}
  ;

