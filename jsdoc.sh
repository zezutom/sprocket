#!/bin/bash
#
# Generates javascript documentation using jsdoc3 and docstrap
#
# Prerequisites:
# 1. jsdoc3	https://github.com/jsdoc3/jsdoc
# 2. docstrap	https://github.com/terryweiss/docstrap
#

# jsdoc3 installation directory, please adjust to your own environment
JSDOC_DIR=~/bin/jsdoc-3.2.0

# docstrap installation directory, please adjust to your own environment
DOCSTRAP_DIR=~/bin/docstrap

# project directory, the current working directory is assumed
PROJECT_DIR=$(pwd)

# the documentation directory. It is recreated every time this script is running.
DOC_DIR=$PROJECT_DIR/doc

if [ -d $DOC_DIR ]
then
  echo 'Deleting outdated files'
  rm -r $DOC_DIR
fi

echo 'Creating project documentation'
$JSDOC_DIR/jsdoc $PROJECT_DIR -r -t $DOCSTRAP_DIR/template -c $PROJECT_DIR/jsdoc.conf.json -d $DOC_DIR
echo 'Done!'
