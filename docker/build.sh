#!/bin/bash
# awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json
# npm pkg get version
version=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)

if command -v podman  &> /dev/null
then
 # echo podman build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
 podman build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version -t harbor.vimpelcom.ru/eafdmmart/ea-board:latest
 podman push harbor.vimpelcom.ru/eafdmmart/ea-board:$version
else 
    if command -v docker  &> /dev/null
    then
    # echo docker build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version
    docker build . -f ./docker/dockerfile -t harbor.vimpelcom.ru/eafdmmart/ea-board:$version -t harbor.vimpelcom.ru/eafdmmart/ea-board:latest
    docker push harbor.vimpelcom.ru/eafdmmart/ea-board:$version
    docker push harbor.vimpelcom.ru/eafdmmart/ea-board:latest
    fi
fi