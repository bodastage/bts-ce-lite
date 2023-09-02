mkdir -p python

#!/bin/bash
release_date="20210724"
standalone_python="python/"


if [[ ! -d "$standalone_python" && "$OSTYPE" == "darwin"* ]]; then
    filename="cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz"
    wget https://github.com/indygreg/python-build-standalone/releases/download/${release_date}/${filename}
    tar -xzvf ${filename}                                                                          
    rm -rf ${filename}
    # Now delete the test/ folder, saving about 23MB of disk space
    rm -rf python/lib/python3.9/test
fi

if [[ ! -d "$standalone_python" && == "linux-gnu"* ]]; then
    filename="cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz"
    wget https://github.com/indygreg/python-build-standalone/releases/download/${release_date}/${filename}
    tar -xzvf ${filename}                                                                          
    rm -rf ${filename}
    # Now delete the test/ folder, saving about 23MB of disk space
    rm -rf python/lib/python3.9/test
fi

if [[ ! -d "$standalone_python" && == "cygwin" ]]; then

    rm -rf python/lib/python3.9/test
fi

if [[ "$OSTYPE" == "msys" ]]; then
        # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
fi

if [[ "$OSTYPE" == "win32" ]]; then
        # I'm not sure this can happen.
fi

if [[ "$OSTYPE" == "freebsd"* ]]; then
        # ...
fi

# add checks for unix, mac, and windows 