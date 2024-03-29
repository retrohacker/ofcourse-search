#!/usr/bin/env bash

if [[ $1 == "kill" ]]; then
  docker ps | grep "postgres\|elasticsearch" | awk '{print $1}' | xargs docker kill | xargs docker rm
  exit 0
fi

if docker ps | grep -q "0.0.0.0:5432"; then
  echo "Docker container already bound to port 5432";
else
  docker run -dp 5432:5432 postgres:9.3
fi

if docker ps | grep -q "0.0.0.0:9200"; then
  echo "Docker container already bound to port 9200"
else
  docker run -dp 9200:9200 barnybug/elasticsearch:1.3.2
fi
