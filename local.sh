#!/bin/sh
JEKYLL_VERSION=3.8
docker run -it --rm \
  -p 4000:4000 \
  --volume="$PWD:/srv/jekyll" \
  jekyll/jekyll:$JEKYLL_VERSION \
  jekyll serve --drafts
