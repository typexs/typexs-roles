#!/usr/bin/env bash


asciidoctor -b docbook ../docs/README.adoc


# pandoc -f docbook -t gfm foo.xml -o foo.md

# Unicode symbols were mangled in foo.md. Quick workaround:

# iconv -t utf-8 foo.xml | pandoc -f docbook -t gfm | iconv -f utf-8 > foo.md

# Pandoc inserted hard line breaks at 72 characters. Removed like so:

# pandoc -f docbook -t gfm --wrap=none # don't wrap lines at all

# pandoc -f docbook -t gfm --columns=120 # extend line breaks to 120
