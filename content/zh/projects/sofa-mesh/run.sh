#!/bin/bash
project="sofa-mesh"
cat $project.csv|while read line;
do
    oldfile=`echo $line|cut -d "," -f1`
    newdir=`echo $line|cut -d "," -f2`
    newfile=$newdir/index.md
    echo "创建新目录:$newdir"
    mkdir $newdir
    echo "创建新文件:$newfile"
    touch $newdir/index.md
    title=`echo $line|cut -d "," -f3`
    aliases=`echo $line|cut -d "," -f4`
    echo """
---
title: \"$title\"
aliases: \"$aliases\"
---

""">$newfile
cat $oldfile>>$newfile
done
