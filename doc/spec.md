# Spec

## Setup

Each spec*.md file starts with the following setup code to put the dot-ns repo into the path, create a new clean working directory, change to that new directory and establish the NS_PATH to be your new current working directory.

```sh
# execute this command command once in the dot-ns repo folder:
export PATH="${PATH}:${PWD}"

. ns init
mkdir -p ns_bin1
cd ns_bin1
NS_PATH="${PWD}"

```

## Cleanup

Each spec*.md file ends with the following cleanup code, which just simply changes directory to the parent folder so that the next spec*.md files can be saved next to the previous spec*.md file execution.

```sh
cd ..
```

Page: 3
