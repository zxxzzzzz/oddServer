import { app } from '../http/server.ts';
import { parseArgs } from '@std/cli/parse-args';
import  '../http/basketball.ts';
import  '../http/football.ts';
import  '../http/user.ts';

const cliArgs = parseArgs(Deno.args);

app.listen({ port: cliArgs.port || 80 });
console.log('listen at port', cliArgs.port || 80);
