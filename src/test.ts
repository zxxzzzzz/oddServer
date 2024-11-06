import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import { solveThreeVariableLinearEquations, getCoefficient, solveFourVariableLinearEquations, getSinData, toFifoFunction } from './utils/index.js';
import { delay } from './api/utils.js';
import { randomUUID } from 'crypto';

(async () => {
  const ac = [
    {
      "account": "test1",
      "password": "12345678",
      "token": "1726893695725"
    },
    {
      "account": "test2x",
      "password": "123456789",
      "token": "1718026312028"
    },
    {
      "account": "test3",
      "password": "12345678",
      "token": "1726677525143"
    },
    {
      "account": "test4",
      "password": "12345678",
      "token": "1726893842180"
    },
    {
      "account": "zxx",
      "password": "12345678",
      "token": "1723549256564"
    },
    {
      "account": "xjn133",
      "password": "12345678",
      "token": "1726891783002"
    },
    {
      "account": "xjn399",
      "password": "12345678",
      "token": "1726886683972"
    },
    {
      "account": "xjn1333",
      "password": "12345678",
      "token": "1726815283906"
    },
    {
      "account": "xjn2666",
      "password": "12345678",
      "token": "1726893788606"
    },
    {
      "account": "xjn3999",
      "password": "12345678",
      "token": "1726893177541"
    },
    {
      "account": "jxd1333",
      "password": "12345678",
      "token": "1726894007545"
    },
    {
      "account": "jxd2666",
      "password": "12345678",
      "token": "1726888107001"
    },
    {
      "account": "jxd3999",
      "password": "12345678",
      "token": "1726893804998"
    },
    {
      "account": "jxd0222",
      "password": "12345678",
      "token": "1726893601809"
    },
    {
      "account": "jxd0000",
      "password": "12345678",
      "token": "1726894069374"
    },
    {
      "account": "jxd1111",
      "password": "12345678",
      "token": "1726892554866"
    },
    {
      "account": "jxd2222",
      "password": "88888888",
      "token": "1725884602216"
    },
    {
      "account": "jxd3333",
      "password": "12345678",
      "token": "1726894041233"
    },
    {
      "account": "jxd0111",
      "password": "88888888",
      "token": "1726858513075"
    },
    {
      "account": "jxd0222",
      "password": "88888888",
      "token": "1726893601809"
    },
    {
      "account": "jxd0333",
      "password": "88888888",
      "token": "1726893969859"
    },
    {
      "account": "jxd0444",
      "password": "88888888",
      "token": "1725859452034"
    }
  ].map((ac, index) => {
    return {
      "password": ac.password,
      "id": index.toString(),
      "uuid": randomUUID(),
      "account": ac.account,
      "name": '',
      "identificationcard": '',
      "company": '',
      "companyinfo": '',
      "sex": "",
      "email": "",
      "wechat": '',
      "photosrc": '',
      "role": "user",
      "pcsessionid": "",
      "phonesessionid": '',
      "phone": '',
      "lastlogintime": "",
      "vip": null,
      "viptime": "2025-11-04T15:59:59.000Z",
      "keywords": null,
      "createdAt": "2024-09-21T12:48:39.000Z",
      "updatedAt": "2024-10-24T11:08:20.000Z",
      "JCPointSinHad": "0.12",
      "JCPointChuanHad": "0.13",
      "JCPointSinTgg": "0.07",
      "JCPointSinHalf": "0.07",
      "JCPointChuanQb": "0.07",
      "JCPointSinLq": "0.07",
      "JCPointChuanLq": "0.07",
      "JCPointChuanLqQb": "0.07",
      "HGPoint": "0.023",
      "JCTzAmt": "10000",
      "minrate": "0",
      "maxmultiple": "10",
      "danRadio": 1,
      "chuanRadio": 2,
      "zjqsRadio": 2,
      "bqcRadio": 2,
      "qbRadio": 2,
      "otherRadio": 6,
      "danSwitch": 1,
      "chuanSwitch": 1,
      "zjqsSwitch": 1,
      "bqcSwitch": 1,
      "qbSwitch": 1,
      "otherSwitch": 1
    }
  })
  writeFileSync('./user.json', JSON.stringify({ userList: ac }), { encoding: 'utf-8' })
})();
