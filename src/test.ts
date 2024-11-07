import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import { solveThreeVariableLinearEquations, getCoefficient, solveFourVariableLinearEquations, getSinData, toAsyncTimeFunction,toFifoFunction } from './utils/index.js';
import { delay } from './api/utils.js';
import { randomUUID } from 'crypto';

(async () => {
  const t1 = toFifoFunction(toAsyncTimeFunction(async (n:number, i:number)=>{
    await delay(n)
    console.log(i);
  },'test'))
  t1(1000, 1)
  t1(300, 2)
  t1(500, 3)
  // writeFileSync('./user.json', JSON.stringify({ userList: ac }), { encoding: 'utf-8' })
})();
