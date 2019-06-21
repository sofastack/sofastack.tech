#!/bin/bash
input="change.csv"
cat $input|while read line
do
    file=`echo $line|cut -d "," -f1`
    old=`echo $line|cut -d "," -f2`
    echo "重命名 $file/index.md"
    seg1=`echo $old|cut -d "/" -f1`
    seg2=`echo $old|cut -d "/" -f2`
    sed -i "" "s/$seg1\/$seg2/\/$seg1\/$seg2/g" $file/index.md
done
