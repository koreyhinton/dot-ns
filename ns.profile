
ns_dir="${BASH_SOURCE%/*}"
ns_bin="${ns_dir}/ns_bin"

if [[ -z "$NS_PATH" ]]; then
    NS_PATH="$ns_bin"
else
    NS_PATH="${ns_bin}:${NS_PATH}"
fi
export NS_PATH
export NS_LAST_CMD=

which ns >/dev/null 2>/dev/null
ec=$?
if [[ $ec -gt 0 ]]; then
    export PATH="${ns_dir}:${PATH}"
fi

export VC_JS_DIR="${ns_dir}/js"

ns-compose() {
    local var_name=$1
    read -r -d '' "$var_name"
}
export -f ns-compose

ns-delete() {
    while [[ -n "$1" ]]
    do
        local var_name=$1
        export -n "$var_name"
        unset "$var_name"
        shift
    done
}
export -f ns-delete

ns-run() {
    local var_name
    read -r -d '' var_name
    eval "$var_name"
}
export -f ns-run

ns-reuse() {
    eval "${!1}"
}
export -f ns-reuse
