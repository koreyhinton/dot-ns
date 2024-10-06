import * as fs from 'fs';

//import { parse } from 'bash-parser';
// var parse: any = require('bash-parser');
import { parse } from '@ein/bash-parser';

//console.log(parse);
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

//parse('echo cia').then(o => console.log(o));

function varcheck(path: any) {
    var bashContent = fs.readFileSync(path, {encoding: 'utf8'});
    console.log(bashContent);
    //parse(bashContent);
    parse(bashContent, {mode: 'bash'}).then(ast => console.log(ast));
}


process.argv.forEach(function(val, index, array) {
    if (index == array.length-1) {
        console.log(val);
        varcheck(val);
    }
});


