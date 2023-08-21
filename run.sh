#!/usr/bin/env bash

set -e

DIR=$(dirname $(realpath $0))
FIFTYONE_SRC=$DIR
PORT_OPTS=${PORT_OPTS:--p 5151:5151 -p 5173:5173}

docker run \
    -it \
    --mount "type=bind,source=$FIFTYONE_SRC,target=/src51" \
    --mount "type=bind,source=/,target=/host" \
    -u "$(id -u $USER):$(id -g $USER)" \
    ${PORT_OPTS} \
    ce_fiftyone_dev bash
