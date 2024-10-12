import * as fs from 'fs';

import { parse } from '@ein/bash-parser';

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

interface Memory {
    vars: string[];
}

interface ScriptError {
    type: string;
    message: string;
}

interface Script {
    name: string;
    errors: ScriptError[];
}

interface Env {
    memory: Memory;
    scripts: Script[];
}

function isCommandNsScriptInvocation(c: any): boolean {
    return c?.name?.text == '.' && c?.suffix?.length >= 3 && c.suffix[0].text == 'ns' && c.suffix[1].text == 'run' && c.suffix[2].text.length > 0;
}

function isCommandImport(c: any): boolean {
    return c?.name?.text != null && c?.suffix != null && c.name.text == '.' && c.suffix.length > 2 && c.suffix[0].text == 'ns' && c.suffix[1].text == 'import';
}

function isCommandAssignment(c: any): boolean {
    return c.prefix != null && c.prefix.length == 1 && c.prefix[0].type == 'AssignmentWord';
}

function checkCommand(c: any, script: Script, vars: string[]) {
    // console.log(c);
    if (isCommandNsScriptInvocation(c)) {
        // todo: parse script and deal with promise
    } else if (isCommandAssignment(c)) {
        vars.push(c.prefix[0].text.split("=")[0]);
    } else if (isCommandImport(c)) {
        //var prompt = env.scriptNo == 1;
        for (var i=2; i<c.suffix.length; i++) {
            console.log("test", c.suffix[i].text, vars);
            if (vars.indexOf(c.suffix[i].text)<0) {
                script.errors.push({
                    type: "VariableNotSetError",
                    message: `Script: ${script.name}, imports variable: '${c.suffix[i].text}' which is not defined.`
                });
            }
            //console.log("var:", c.suffix[i].text);
        }
    }
}

function checkScript(name: string, s: any, env: Env) {
    //env.scriptNo += 1;
    var script = {name: name, errors: []};
    env.scripts.push(script);
    for (var i=0; i<s.commands.length; i++) {
        if (s.commands[i].type == 'Command') {
            checkCommand(s.commands[i], script, env.memory.vars);
        }
    }
}

function run(scriptName: string, ast: any, env: Env) {
    //console.log(ast);
    //console.log('--------------------------------------------');
    //console.log(ast.type);
    if (ast.type == "Script") {
        checkScript(scriptName, ast, env);
    }
}

function varcheck(path: any, env: Env, cb: any) {
    var bashContent = fs.readFileSync(path, {encoding: 'utf8'});
    //console.log(bashContent);
    //parse(bashContent);
    parse(bashContent, {mode: 'bash'}).then(ast => {
        run(path, ast, env);
        cb(env);
    });
}


(function() {
    var vars: string[] = [];
    var scriptPath: string = "";
    process.argv.forEach(function(val, index, array) {
        if (index == array.length-1) {
            var inVars = val.split(",");
            for (var i=0; i<inVars.length; i++) {
                if (inVars[i].length > 0) {
                    vars.push(inVars[i]);
                }
            }
        } else if (index == array.length-2) {
            scriptPath = val;
        }
    });
    var env: Env = { memory: { vars: vars }, scripts: [] };
    var failed: boolean = false;
    varcheck(scriptPath, env, () => {
        for (var i=0; i<env.scripts.length; i++) {
            for (var j=0; j<env.scripts[i].errors.length; j++) {
                failed = true;
                var first = i == 0 && j == 0;
                var last = i == env.scripts.length - 1 && j == env.scripts[i].errors.length - 1;
                var error = env.scripts[i].errors[j];
                console.error((first?"":"\n")+error.type);
                console.error(error.message+(last?"":"\n"));
            }
        }
        if (failed) {
            process.exitCode = 1;
        }
    });
})();


