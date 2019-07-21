#!/bin/bash
#
# Change permissions of the resources folder after installation.
#
# This script runs when hte user installs with the deb package.

chmod -R 777 /opt/Boda-Lite/resources

# Link to the binary
ln -sf '/opt/${productFilename}/${executable}' '/usr/local/bin/${executable}';
echo 'Successfully added /opt/${productFilename}/${executable} to /usr/local/bin/${executable}'