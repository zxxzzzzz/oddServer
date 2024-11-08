import { getCoefficient, getGoalLineRuleList } from './goalLineRule.js';
import { solveFourVariableLinearEquations } from './lodash.js';
export * from './lodash.js';
export * from './goalLineRule.js';
function getStrSameWeight(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0)
        return 1.0;
    if (len2 === 0)
        return 1.0;
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    const maxLength = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLength;
}
export const getLeagueSameWeight = (leagueName1, leagueName2) => {
    const l1 = leagueName1
        .toString()
        .replace(/组/g, '级')
        .replace(/(-|附加赛|升级)/g, '');
    const l2 = leagueName2
        .toString()
        .replace(/组/g, '级')
        .replace(/(-|附加赛|升级)/g, '');
    const equalNameList = [
        ['日本职业联赛杯', '日本联赛杯'],
        ['澳大利亚超级联赛', '澳大利亚甲级联赛', '澳大利亚甲级联赛'],
        ['欧罗巴联赛', '欧洲联赛'],
        ['韩国K甲级联赛', '韩国职业联赛'],
        ['日本J1联赛', '日本职业联赛'],
        ['日本J2联赛', '日本职业乙级联赛', '日本乙级联赛'],
        ['英格兰冠军联赛-附加赛', '英格兰冠军联赛'],
        ['世界U20锦标赛', 'U20世界杯2023(在阿根廷)'],
        ['美国公开赛冠军杯', '美国公开赛杯'],
        ['南美解放者杯', '南美自由杯'],
        ['欧洲国家联赛', '欧洲国家联赛A'],
        ['欧洲杯预选赛', '欧洲足球锦标赛2024外围赛'],
        ['国际赛', '国际友谊赛'],
        ['国际赛', '美洲国家联赛A'],
        ['欧洲U21锦标赛', '欧洲U21青年锦标赛2023(在罗马尼亚和格鲁吉亚)'],
        ['中北美金杯赛', '美洲金杯2023(在美国和加拿大)'],
        ['欧洲冠军联赛外围赛', '欧洲冠军联赛'],
        ['女足世界杯', '女子世界杯2023(在澳大利亚和纽西兰)'],
        ['英格兰联赛锦标赛', '英格兰锦标赛'],
        ['欧罗巴联赛', '欧洲联赛'],
        ['欧罗巴联赛', '欧洲联赛外围赛'],
        ['世界杯2026南美洲外围赛', '世界杯预选赛'],
        ['亚运会男足', '亚运会2022男子足球U23(在中国)'],
        ['亚洲冠军联赛', '亚足联冠军联赛'],
        ['世界杯预选赛', '世界杯2026亚洲外围赛', '世界杯2026南美洲外围赛', '世界杯2026非洲外围赛'],
        ['西班牙篮球联赛', '西班牙篮球甲级联赛'],
        ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
        ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
        ['亚洲杯', '亚洲杯2023(在卡塔尔)'],
        ['非洲国家杯', '非洲国家杯2023(在象牙海岸)'],
    ];
    const isEqual = !!equalNameList.some((d) => d.includes(l1) && d.includes(l2));
    if (isEqual) {
        return 1;
    }
    return getStrSameWeight(l1, l2);
};
export const getTeamSameWeight = (teamName1, teamName2) => {
    return getStrSameWeight(teamName1, teamName2);
};
export const getRatioAvg = (str, isNegative) => {
    if (!str)
        return 0;
    const splitCount = str.split('/').length;
    let count = str.split('/').reduce((re, cur) => re + Math.abs(parseFloat(cur)), 0) / splitCount;
    if (isNegative) {
        count = -count;
    }
    if (count === 0)
        return '0';
    return count.toFixed(2);
};
export function getRev(JCOdd, HGOdd, HGPoint, JCPointSin) {
    const I25 = JCPointSin;
    const GC = JCOdd;
    const F23 = GC;
    const VV = JCOdd * HGOdd > 3 ? HGOdd - 1 : HGOdd;
    const G23 = VV;
    const addedHGPoint = 1 + HGPoint;
    const minusHGPoint = 1 - HGPoint;
    const Offset = (10000 * F23) / (addedHGPoint * G23 + minusHGPoint);
    const H23 = Offset;
    const Rev = F23 * 10000 - 10000 * (1 - I25) - 0.972 * H23;
    return {
        GC,
        VV,
        Offset,
        Rev,
    };
}
export function getCompare(item1, item2, HGPoint, JCPointChuan, JCTzAmt) {
    const G37 = item1.GC;
    const G38 = item2.GC;
    const H37 = item1.VV;
    const H38 = item2.VV;
    const I40 = JCPointChuan;
    const addedHGPoint = 1 + HGPoint;
    const minusHGPoint = 1 - HGPoint;
    const item2CompareOffset = (G37 * G38 * 10000) / (addedHGPoint * H38 + minusHGPoint);
    const I38 = item2CompareOffset;
    const item1CompareOffset = (addedHGPoint * H38 * I38 - (10000 * (1 - I40) * 7) / 8) / ((addedHGPoint * H37) / 8 + minusHGPoint);
    const I37 = item1CompareOffset;
    const item2CompareRev = I38 * H38 * addedHGPoint - I37 * minusHGPoint - 10000 * (1 - I40);
    const item1CompareRev = I37 * H37 * 1.028 - 10000 * (1 - I40);
    const item1Amount = item1CompareOffset * JCTzAmt;
    const item2Amount = item2CompareOffset * JCTzAmt;
    return {
        item1: {
            GC: item1.GC,
            VV: item1.VV,
            Offset: item1CompareOffset,
            Rev: item1CompareRev,
            Amount: item1Amount,
        },
        item2: {
            GC: item2.GC,
            VV: item2.VV,
            Offset: item2CompareOffset,
            Rev: item2CompareRev,
            Amount: item2Amount,
        },
    };
}
export function getSinData(JCInfo, HGInfo, op) {
    const toFixNumber = (num, fixCount) => {
        return parseFloat(num.toFixed(fixCount));
    };
    const goalLineRuleList = getGoalLineRuleList();
    const jcGoalLineItem1 = { goalLine: '-', a: JCInfo.had_a, d: JCInfo.had_d, h: JCInfo.had_h };
    const jcGoalLineItem2 = { goalLine: JCInfo.hhad_goalLine, a: JCInfo.hhad_a, d: JCInfo.hhad_d, h: JCInfo.hhad_h };
    const hgGoalLineItem1 = { goalLine: '-', a: HGInfo.had_a, d: HGInfo.had_d, h: HGInfo.had_h };
    const hgGoalLineItem2 = { goalLine: HGInfo.hhad_goalLine1, a: HGInfo.hhad_a1, d: HGInfo.hhad_d1, h: HGInfo.hhad_h1 };
    const hgGoalLineItem3 = { goalLine: HGInfo.hhad_goalLine2, a: HGInfo.hhad_a2, d: HGInfo.hhad_d2, h: HGInfo.hhad_h2 };
    const hgGoalLineItem4 = { goalLine: HGInfo.hhad_goalLine3, a: HGInfo.hhad_a3, d: HGInfo.hhad_d3, h: HGInfo.hhad_h3 };
    const hgGoalLineItem5 = { goalLine: HGInfo.hhad_goalLine4, a: HGInfo.hhad_a4, d: HGInfo.hhad_d4, h: HGInfo.hhad_h4 };
    const hgGoalLineItem6 = { goalLine: HGInfo.hhad_goalLine5, a: HGInfo.hhad_a5, d: HGInfo.hhad_d5, h: HGInfo.hhad_h5 };
    const hgGoalLineItem7 = { goalLine: HGInfo.hhad_goalLine6, a: HGInfo.hhad_a6, d: HGInfo.hhad_d6, h: HGInfo.hhad_h6 };
    const hgGoalLineItem8 = { goalLine: 'J1', a: HGInfo.wm_a1, d: '-', h: HGInfo.wm_h1 };
    const hgGoalLineItem9 = { goalLine: 'J2', a: HGInfo.wm_a2, d: '-', h: HGInfo.wm_h2 };
    const hgGoalLineItem10 = { goalLine: 'J3', a: HGInfo.wm_a3, d: '-', h: HGInfo.wm_h3 };
    const hgGoalLineItemList = [
        hgGoalLineItem1,
        hgGoalLineItem2,
        hgGoalLineItem3,
        hgGoalLineItem4,
        hgGoalLineItem5,
        hgGoalLineItem6,
        hgGoalLineItem7,
        hgGoalLineItem8,
        hgGoalLineItem9,
        hgGoalLineItem10,
    ].filter((item) => item.a !== '-');
    const jcGoalLineItemList = [jcGoalLineItem1, jcGoalLineItem2].filter((item) => item.a !== '-');
    return goalLineRuleList
        .map((rule) => {
        const jcResult1 = rule.jcResult1;
        const jcResult2 = rule.jcResult2;
        const jcGoalLine1 = rule.jcGoalLine1;
        const jcGoalLine2 = rule.jcGoalLine2;
        const hgResult1 = rule.hgResult1;
        const hgResult2 = rule.hgResult2;
        const hgGoalLine1 = rule.hgGoalLine1;
        const hgGoalLine2 = rule.hgGoalLine2;
        const finedJcItem1 = jcGoalLineItemList.find((jcItem) => jcItem.goalLine === jcGoalLine1);
        const finedJcItem2 = jcGoalLineItemList.find((jcItem) => jcItem.goalLine === jcGoalLine2);
        const finedHgItem1 = hgGoalLineItemList.find((hgItem) => hgItem.goalLine === hgGoalLine1);
        const finedHgItem2 = hgGoalLineItemList.find((hgItem) => hgItem.goalLine === hgGoalLine2);
        if (!finedJcItem1 || !finedHgItem1)
            return void 0;
        const jcOdds1Number = !finedJcItem1 ? 0 : jcResult1 === '-' ? 0 : parseFloat(finedJcItem1[jcResult1]);
        const jcOdds2Number = !finedJcItem2 ? 0 : jcResult2 === '-' ? 0 : parseFloat(finedJcItem2[jcResult2]);
        const hgOdds1Number = !finedHgItem1 ? 0 : hgResult1 === '-' ? 0 : parseFloat(finedHgItem1[hgResult1]);
        const hgOdds2Number = !finedHgItem2 ? 0 : hgResult2 === '-' ? 0 : parseFloat(finedHgItem2[hgResult2]);
        const jcAmount1Number = jcOdds1Number * op.JCBet;
        const jcRebate1Number = op.JCBet * op.JCPointSin;
        const a1 = getCoefficient({ result: jcResult1, isJC: true, goalLine: jcGoalLine1 }, { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2Number }, op);
        const b1 = getCoefficient({ result: jcResult1, isJC: true, goalLine: jcGoalLine1 }, { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1Number }, op);
        const c1 = getCoefficient({ result: jcResult1, isJC: true, goalLine: jcGoalLine1 }, { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2Number }, op);
        const d1 = jcOdds1Number === 0 ? 0 : -1;
        const e1 = -getCoefficient({ result: jcResult1, isJC: true, goalLine: jcGoalLine1 }, { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1Number }, op) * op.JCBet;
        const a2 = getCoefficient({ result: jcResult2, isJC: true, goalLine: jcGoalLine2 }, { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2Number }, op);
        const b2 = getCoefficient({ result: jcResult2, isJC: true, goalLine: jcGoalLine2 }, { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1Number }, op);
        const c2 = getCoefficient({ result: jcResult2, isJC: true, goalLine: jcGoalLine2 }, { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2Number }, op);
        const d2 = jcOdds2Number === 0 ? 0 : -1;
        const e2 = -getCoefficient({ result: jcResult2, isJC: true, goalLine: jcGoalLine2 }, { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1Number }, op) * op.JCBet;
        const a3 = getCoefficient({ result: hgResult1, isJC: false, goalLine: hgGoalLine1 }, { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2Number }, op);
        const b3 = getCoefficient({ result: hgResult1, isJC: false, goalLine: hgGoalLine1 }, { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1Number }, op);
        const c3 = getCoefficient({ result: hgResult1, isJC: false, goalLine: hgGoalLine1 }, { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2Number }, op);
        const d3 = hgOdds1Number === 0 ? 0 : -1;
        const e3 = -getCoefficient({ result: hgResult1, isJC: false, goalLine: hgGoalLine1 }, { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1Number }, op) * op.JCBet;
        const a4 = getCoefficient({ result: hgResult2, isJC: false, goalLine: hgGoalLine2 }, { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2Number }, op);
        const b4 = getCoefficient({ result: hgResult2, isJC: false, goalLine: hgGoalLine2 }, { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1Number }, op);
        const c4 = getCoefficient({ result: hgResult2, isJC: false, goalLine: hgGoalLine2 }, { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2Number }, op);
        const d4 = hgOdds2Number === 0 ? 0 : -1;
        const e4 = -getCoefficient({ result: hgResult2, isJC: false, goalLine: hgGoalLine2 }, { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1Number }, op) * op.JCBet;
        const [jcBet2Number, hgBet1Number, hgBet2Number, profitNumber] = solveFourVariableLinearEquations({
            a1,
            b1,
            c1,
            d1,
            e1,
            a2,
            b2,
            c2,
            d2,
            e2,
            a3,
            b3,
            c3,
            d3,
            e3,
            a4,
            b4,
            c4,
            d4,
            e4,
        }) || [0, 0, 0, 0];
        const jcRebate2Number = op.JCPointSin * jcBet2Number;
        const jcAmount2Number = jcBet2Number * jcOdds2Number;
        const hgRebate1Number = hgBet1Number * (hgOdds1Number - 1) * op.HGPoint;
        const hgAmount1Number = hgBet1Number * hgOdds1Number;
        const hgRebate2Number = hgBet2Number * (hgOdds2Number - 1) * op.HGPoint;
        const hgAmount2Number = hgBet2Number * hgOdds2Number;
        const profitRate = `${toFixNumber((profitNumber / op.JCBet) * 100, 3)}%`;
        if (profitNumber === 0)
            return void 0;
        return {
            matchId: JCInfo.matchId,
            JCgoalLine: !finedJcItem1 ? '-' : finedJcItem1.goalLine,
            HGgoalLine: !finedHgItem1 ? '-' : finedHgItem1.goalLine,
            data: {
                JCgoalLine1: !finedJcItem1 ? '-' : finedJcItem1.goalLine,
                JCgoalLine2: !finedJcItem2 ? '-' : finedJcItem2.goalLine,
                HGgoalLine1: !finedHgItem1 ? '-' : finedHgItem1.goalLine,
                HGgoalLine2: !finedHgItem2 ? '-' : finedHgItem2.goalLine,
                jcOdds1: jcOdds1Number,
                jcOdds2: jcOdds2Number,
                hgOdds1: hgOdds1Number,
                hgOdds2: hgOdds2Number,
                JCTouz1: jcResult1,
                JCTouz2: jcResult2,
                HGTouz1: hgResult1,
                HGTouz2: hgResult2,
                method: 'WL',
                matchTimeFormat: JCInfo.matchTimeFormat,
                jcBet1: op.JCBet,
                jcBet2: toFixNumber(jcBet2Number, 3),
                hgBet1: toFixNumber(hgBet1Number, 3),
                hgBet2: toFixNumber(hgBet2Number, 3),
                JCPoint1: toFixNumber(jcRebate1Number, 3),
                JCPoint2: toFixNumber(jcRebate2Number, 3),
                HGPoint1: toFixNumber(hgRebate1Number, 3),
                HGPoint2: toFixNumber(hgRebate2Number, 3),
                jcAmount1: toFixNumber(jcAmount1Number, 3),
                jcAmount2: toFixNumber(jcAmount2Number, 3),
                hgAmount1: toFixNumber(hgAmount1Number, 3),
                hgAmount2: toFixNumber(hgAmount2Number, 3),
                ret: '88.000%',
                profit: toFixNumber(profitNumber, 3),
                profitRate,
            },
        };
    })
        .filter((v) => !!v);
}
