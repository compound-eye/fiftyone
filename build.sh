#!/usr/bin/env bash

set -e

DIR=$(dirname $(realpath $0))

docker build -t ce_fiftyone_dev .
