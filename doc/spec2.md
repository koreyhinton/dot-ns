# Spec 2 - ns run by receiving input pipe

The run-piped command is used instead of run when you want to pipe stdin into
the script.

## Test the feature in the bash shell

```sh
# execute this command command once in the dot-ns repo folder:
export PATH="${PATH}:${PWD}"

. ns init
mkdir -p ns_bin1
cd ns_bin1
NS_PATH="${PWD}"

```

my_script file (+x permission)

```sh
read my_var <&0     # line 1
. ns export my_var  # line 2
```

line 1 will read from the stdin file descriptor and store in my_var

line 2 uses the 'export' subcommand to save my_var to storage so that the run, run-piped, or import commands can bring it back to memory

my_script invocation with an input pipe

```sh
. ns run-piped my_script < <(echo test) # line 1
echo "$my_var"                          # line 2
```

line 1 read from right to left prints test as a process substitution, then redirects as input pipe, which contents will be input to the run-piped subcommand.

line 2 will print 'test' from the my_var variable that run-piped has automatically set from export storage

Note: `echo test | . ns run-piped my_script` will not work since it will use storage associated with a subshell process id and then won't find that value when you try to `echo "$my_var"`. So, instead you can use <(process substitution) and pipe that as stdin: <

```sh
cd ..
```

Page: 2
