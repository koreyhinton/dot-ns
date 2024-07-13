# Spec 1 - ns import/export cycle works

This feature specifies that variable(s) can be shared to another script and
back again (full cycle), automatically applying the necessary imports and
exports for the caller based on what the callee script has specified it intends
to share (import/export).

## Test the feature in the bash shell

```sh
# execute this command command once in the dot-ns repo folder:
export PATH="${PATH}:${PWD}"

NS_PATH="${PWD}"
. ns init
mkdir -p ns_bin1
cd ns_bin1
```

my_script file (+x permission)

```sh
. ns import my_var   # 1
my_var="${my_var}c"  # 2
. ns export my_var   # 3
```

line 1 retrieves my_var from storage

line 3 saves my_var to storage

my_script just appends c to the my_var variable.

```sh
my_var=ab          # 1
. ns run my_script # 2
echo "$my_var"     # 3
```

line 3 prints `abc`

### Additional details
Before my_script invokes:
1. ns' run command will reads my_script's import line
2. finds my_var and then saves it to storage

After my_script invokes:
1. ns' run command will read my_script's export line
2. finds my_var and then retrieves it from storage

```sh
cd ..
```

Page: 1
