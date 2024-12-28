
# Installation

The preferred installation method will be via ns-clone (work in progress).

- [ns-clone](https://github.com/koreyhinton/ns-clone)

Until ns-clone is updated, inline code blocks will require sourcing ns.profile from your bashrc. After cloning also add this line to ~/.bashrc (with this full repo path in place of ${path_to_dot_ns}):

```bash
. ${path_to_dot_ns}/ns.profile
```

# . ns

The `. ns run ${scriptname}` syntax uses a sourced run script that can provide the variables to each script based on the `. ns import ms_varname` and `. ns export ms_varname` statements.

Please see the repository's root README file for the modular script approach that shares namespaced variables, ie:

```bash
# example 'ms' namespace ([m]y [s]cript)
ms_run_mode=test
. ns run script1  # imports (and optionally exports) required ms_* variables

# 
ms-script1 # or run via 'ms' script namespace prefix (provided by ns-clone)
```

Ideally, your library of bash functions when using the non-syntactic sugar syntax (. ns scriptname) would do best to reference the full script paths to avoid collisions of duplicate filenames in the NS_PATH variable. Soon, ns-clone will use functions instead of aliases so it can export the ms-* prefix versions down into subshells.

Input variables can also be required, via `. ns require varname` at the top of the script file, and if the variable is not set before running running then it will prompt for it.

# Inline Code Blocks

Dot-ns' pursuit of building modular bash code resulted in the use of bash features that can make for inefficient code performance because of the heavy subshell usage and the unnecessary file i/o. While the unnecessary file i/o can be remediated with a large refactor effort, it would be hard to do so without duplicating the data (2x the memory).

Bash has the ability to do modular inline design using a here-doc with a call to bash's eval which will not create a subshell. The ns-compose/reuse commands provides syntacic sugar for block definition and are defined as a functions which will results in no subshells being created /process forking.

WARNING: This inline approach will have some drawbacks. Firstly, eval is well known for it's potential to be a security risk, so you'd likely want to make use of inline blocks only for non-external inputs or careful code that won't facilitate external control. The other drawback will be that you will have to keep close track of the variables used in the block and it can help if you make sure to dispose of every variable as soon as it is no longer needed.

If you'd like to opt into faster modular code that can be kept all inline, then you can use the blocks in the following ways:

1. run (an unnamed code block directly)

2. compose (save a code block without running it yet)

3. reuse (invoke a saved code block directly, same as `eval "$block_name"`)

4. delete (a composed here-doc variable)

```bash
echo "$BASHPID"  # to see the process never forked

# 1. run
ns-run <<'EOF'
echo "$BASHPID"
EOF

# 2. compose
ns-compose block1 <<'EOF'

# code block
var1=foo
echo "$BASHPID"
EOF

# 3. reuse
ns-reuse block1  # without '$', or eval "$block1"

# 4. delete
ns-delete var1 block1  # without '$'
```

This linear coding approach could make sense for a long script that does not need to be broken up into different pieces when multiple commands do need to be provided. The entire script can be in one file that can reuse the composed code blocks defined inline.



