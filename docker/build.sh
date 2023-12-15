#!/bin/bash
# awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json
# npm pkg get version
version=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)

if command -v podman  &> /dev/null
then
 # echo podman build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
 podman build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
 podman push harbor.vimpelcom.ru/eafdmmart/ea-board:$version
else 
    if command -v docker  &> /dev/
    then
    # echo docker build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
    docker build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
    docker push harbor.vimpelcom.ru/eafdmmart/ea-board:$version
    fi
fi