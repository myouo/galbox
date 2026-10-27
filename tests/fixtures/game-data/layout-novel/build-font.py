# Original geometric test font. Regenerate with fontTools==4.60.1.
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
fb=FontBuilder(1000,isTTF=True)
order=['.notdef','space']+[f'uni{n:04X}' for n in range(33,127)]
fb.setupGlyphOrder(order)
fb.setupCharacterMap({n:('space' if n==32 else f'uni{n:04X}') for n in range(32,127)})
patterns={
'A':['01110','10001','10001','11111','10001','10001','10001'],
'B':['11110','10001','10001','11110','10001','10001','11110'],
'C':['01111','10000','10000','10000','10000','10000','01111'],
'D':['11110','10001','10001','10001','10001','10001','11110'],
'E':['11111','10000','10000','11110','10000','10000','11111'],
'F':['11111','10000','10000','11110','10000','10000','10000'],
'G':['01111','10000','10000','10111','10001','10001','01111'],
'H':['10001','10001','10001','11111','10001','10001','10001'],
'I':['11111','00100','00100','00100','00100','00100','11111'],
'J':['00111','00010','00010','00010','10010','10010','01100'],
'K':['10001','10010','10100','11000','10100','10010','10001'],
'L':['10000','10000','10000','10000','10000','10000','11111'],
'M':['10001','11011','10101','10101','10001','10001','10001'],
'N':['10001','11001','11001','10101','10011','10011','10001'],
'O':['01110','10001','10001','10001','10001','10001','01110'],
'P':['11110','10001','10001','11110','10000','10000','10000'],
'Q':['01110','10001','10001','10001','10101','10010','01101'],
'R':['11110','10001','10001','11110','10100','10010','10001'],
'S':['01111','10000','10000','01110','00001','00001','11110'],
'T':['11111','00100','00100','00100','00100','00100','00100'],
'U':['10001','10001','10001','10001','10001','10001','01110'],
'V':['10001','10001','10001','10001','01010','01010','00100'],
'W':['10001','10001','10001','10101','10101','11011','10001'],
'X':['10001','10001','01010','00100','01010','10001','10001'],
'Y':['10001','10001','01010','00100','00100','00100','00100'],
'Z':['11111','00001','00010','00100','01000','10000','11111'],
'0':['01110','10001','10011','10101','11001','10001','01110'],
'1':['00100','01100','00100','00100','00100','00100','01110'],
'2':['01110','10001','00001','00010','00100','01000','11111'],
'3':['11110','00001','00001','01110','00001','00001','11110'],
'/':['00001','00001','00010','00100','01000','10000','10000'],
}
glyphs={}
for index,name in enumerate(order):
 p=TTGlyphPen(None)
 if name!='space':
  char=chr(int(name[3:],16)).upper() if name.startswith('uni') else '?'
  rows=patterns.get(char,patterns['O'])
  for row,bits in enumerate(rows):
   for col,bit in enumerate(bits):
    if bit=='1':
     x=55+col*95;y=80+(6-row)*100
     p.moveTo((x,y));p.lineTo((x,y+85));p.lineTo((x+80,y+85));p.lineTo((x+80,y));p.closePath()
 glyphs[name]=p.glyph()
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics({name:(600,0) for name in order})
fb.setupHorizontalHeader(ascent=850,descent=-150)
fb.setupNameTable({'familyName':'Galbox Lighthouse Grid','styleName':'Regular','uniqueFontIdentifier':'galbox-lighthouse-grid-1','fullName':'Galbox Lighthouse Grid Regular','psName':'GalboxLighthouseGrid-Regular','version':'Version 1.0','copyright':'Original galbox-sdk fixture'})
fb.setupOS2(sTypoAscender=850,sTypoDescender=-150,usWinAscent=850,usWinDescent=150)
fb.setupPost();fb.setupMaxp()
fb.font['head'].created=3406620153;fb.font['head'].modified=3406620153
fb.save(Path(__file__).with_name('lighthouse-grid.ttf'))
