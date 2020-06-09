#!/bin/bash

APPLICABLEFILES=$(ls | grep -Eoh --group-separator=$' ' '[0-9]+-[0-9]-[0-9].html')
FILECOUNT=$(echo $APPLICABLEFILES | wc -w)
HTML=""

for (( i = 1; i <= $FILECOUNT; ++ i )) do
CURRENTFILE=$(echo $APPLICABLEFILES | cut -d ' ' -f $i)
if test "$i" = "1"; then
PREVIOUSFILE=$CURRENTFILE
else 
PREVIOUSFILE="$(echo $APPLICABLEFILES | cut -d ' ' -f $(($i - 1)))"
fi
CURRENTFILEMAINTEXT=$(sed -n "/<main>/,/<\/main>/p" $CURRENTFILE)
PREVIOUSFILEMAINTEXT=$(sed -n "/<main>/,/<\/main>/p" $PREVIOUSFILE)
MAINTEXTDIFF=$(diff <(echo "$PREVIOUSFILEMAINTEXT") <(echo "$CURRENTFILEMAINTEXT"))
echo $CURRENTFILE
CURRENTFILELABEL=$(echo $CURRENTFILE | sed 's/-/./g; s/.html//')
CURRENTFILEAUTHOR=$(grep "<meta name=\"author\" content=\"[^\"]*\">" $CURRENTFILE | cut -d "\"" -f 4 | cut -d ":" -f 1)
DIFFNUMBERFROMPREVIOUS=$(sdiff -B -b -s $CURRENTFILE $PREVIOUSFILE | wc -w)
sed -Ei "s/v[0-9]+\.[0-9]+\.[0-9]+/v$CURRENTFILELABEL/g" $CURRENTFILE
HTML="<li><a href=\"$CURRENTFILE\">$CURRENTFILELABEL</a> - <span class=\"diff\">$DIFFNUMBERFROMPREVIOUS Words Changed</span> - <span class=\"author\">Author: $CURRENTFILEAUTHOR</span></li>${HTML}"
done

echo $HTML
cat index_base_boilerplate.html > index.html
sed -i '/id=\"indexlist\">/,$d' index.html
echo "<ul class=\"large bigtext diffshow\" id=\"indexlist\">$HTML</ul></main></body></html>" >> index.html