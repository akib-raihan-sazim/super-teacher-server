#!/bin/sh

yarn db:migration:up:prod
yarn db:seed:prod
yarn start:prod
