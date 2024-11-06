import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import { solveThreeVariableLinearEquations, getCoefficient, solveFourVariableLinearEquations, getSinData, toFifoFunction } from './utils/index.js';
import { delay } from './api/utils.js';

(async () => {
  const op = {
    JCPoint: 0.12,
    HGPoint: 0.023,
    JCBet: 10000,
    JCPointSin: 0,
    JCPointChuan: 0,
  };
  const cc = toFifoFunction(async (i: number, index: number) => {
    await delay(i);
    console.log(index);
  });
  cc(600, 1)
  cc(100, 2)
  cc(300, 3)
})();
