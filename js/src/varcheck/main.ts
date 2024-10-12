import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

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

const checkCommand = async (c: any, script: Script, vars: string[], env: Env) => {
    // console.log(c);
    if (isCommandNsScriptInvocation(c)) {
        var childScriptName = c.suffix[2].text;
        const e = promisify(exec);
        const { stdout, stderr } = await e('ns_which "' + childScriptName + '"');
        var path: string = stdout.replace("\n", "");
        var pass = await varcheck(path, env);
        /*if (!pass) {
            console.log('child script failed', env.scripts[1].errors);
        }*/
    } else if (isCommandAssignment(c)) {
        vars.push(c.prefix[0].text.split("=")[0]);
    } else if (isCommandImport(c)) {
        //var prompt = env.scriptNo == 1;
        for (var i=2; i<c.suffix.length; i++) {
            if (vars.indexOf(c.suffix[i].text)<0) {
                script.errors.push({
                    type: "VariableNotSetError",
                    message: `Script: ${script.name}, imports variable: '${c.suffix[i].text}' which is not defined.`
                });
            }
            //console.log("var:", c.suffix[i].text);
        }
    }
    return true;
}

async function checkScript(name: string, s: any, env: Env) {
    //env.scriptNo += 1;
    var script = {name: name, errors: []};
    env.scripts.push(script);
    for (var i=0; i<s.commands.length; i++) {
        if (s.commands[i].type == 'Command') {
            await checkCommand(s.commands[i], script, env.memory.vars, env);
        }
    }
    return true;
}

async function run(scriptName: string, ast: any, env: Env) {
    //console.log(ast);
    //console.log('--------------------------------------------');
    //console.log(ast.type);
    if (ast.type == "Script") {
        await checkScript(scriptName, ast, env);
    }
}

const varcheck = async (path: any, env: Env): Promise<boolean> => {
    var bashContent = fs.readFileSync(path, {encoding: 'utf8'});
    //console.log(bashContent);
    //parse(bashContent);
    var ast = await parse(bashContent, {mode: 'bash'});
    await run(path, ast, env);
    return env.scripts.filter(s => s.errors.length > 0).length == 0;
}


(async () => {
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

    var pass = await varcheck(scriptPath, env);
    if (!pass) {
        for (var i=0; i<env.scripts.length; i++) {
            for (var j=0; j<env.scripts[i].errors.length; j++) {
                var first = i == 0 && j == 0;
                var last = i == env.scripts.length - 1 && j == env.scripts[i].errors.length - 1;
                var error = env.scripts[i].errors[j];
                console.error((first?"":"\n")+error.type);
                console.error(error.message+(last?"":"\n"));
            }
        }
        process.exitCode = 1;
    }
})();

