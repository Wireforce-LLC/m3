# if 'tests' in $PWD exit 1

if [ ! -d "$PWD/tests" ]; then
    exit 1
fi

/bin/bash $PWD/tests/BuildNext.sh