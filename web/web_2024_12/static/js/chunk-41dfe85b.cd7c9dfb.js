(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-41dfe85b"],{"04d1":function(t,a,e){"use strict";var i=e("342f"),o=i.match(/firefox\/(\d+)/i);t.exports=!!o&&+o[1]},"083a":function(t,a,e){"use strict";var i=e("0d51"),o=TypeError;t.exports=function(t,a){if(!delete t[a])throw o("Cannot delete property "+i(a)+" of "+i(t))}},"17c3":function(t,a,e){t.exports=e.p+"static/media/tips.892297d8.mp3"},"3f70":function(t,a,e){"use strict";e.d(a,"b",(function(){return o})),e.d(a,"a",(function(){return s}));var i=e("b775");function o(t){return Object(i["a"])({url:"/water/getBasketballData",method:"post",data:t})}function s(t){return Object(i["a"])({url:"/water/getBsktQBData",method:"post",data:t})}},"4e82":function(t,a,e){"use strict";var i=e("23e7"),o=e("e330"),s=e("59ed"),n=e("7b0b"),r=e("07fa"),l=e("083a"),c=e("577e"),d=e("d039"),h=e("addb"),f=e("a640"),u=e("04d1"),g=e("d998"),p=e("2d00"),m=e("512ce"),_=[],v=o(_.sort),b=o(_.push),y=d((function(){_.sort(void 0)})),w=d((function(){_.sort(null)})),C=f("sort"),L=!d((function(){if(p)return p<70;if(!(u&&u>3)){if(g)return!0;if(m)return m<603;var t,a,e,i,o="";for(t=65;t<76;t++){switch(a=String.fromCharCode(t),t){case 66:case 69:case 70:case 72:e=3;break;case 68:case 71:e=4;break;default:e=2}for(i=0;i<47;i++)_.push({k:a+i,v:e})}for(_.sort((function(t,a){return a.v-t.v})),i=0;i<_.length;i++)a=_[i].k.charAt(0),o.charAt(o.length-1)!==a&&(o+=a);return"DGBEFHACIJK"!==o}})),J=y||!w||!C||!L,x=function(t){return function(a,e){return void 0===e?-1:void 0===a?1:void 0!==t?+t(a,e)||0:c(a)>c(e)?1:-1}};i({target:"Array",proto:!0,forced:J},{sort:function(t){void 0!==t&&s(t);var a=n(this);if(L)return void 0===t?v(a):v(a,t);var e,i,o=[],c=r(a);for(i=0;i<c;i++)i in a&&b(o,a[i]);h(o,x(t)),e=r(o),i=0;while(i<e)a[i]=o[i++];while(i<c)l(a,i++);return a}})},"512ce":function(t,a,e){"use strict";var i=e("342f"),o=i.match(/AppleWebKit\/(\d+)\./);t.exports=!!o&&+o[1]},"5b3f":function(t,a,e){},9466:function(t,a,e){t.exports=e.p+"static/media/otherTips.6bef445d.mp3"},a15b:function(t,a,e){"use strict";var i=e("23e7"),o=e("e330"),s=e("44ad"),n=e("fc6a"),r=e("a640"),l=o([].join),c=s!==Object,d=c||!r("join",",");i({target:"Array",proto:!0,forced:d},{join:function(t){return l(n(this),void 0===t?",":t)}})},a434:function(t,a,e){"use strict";var i=e("23e7"),o=e("7b0b"),s=e("23cb"),n=e("5926"),r=e("07fa"),l=e("3a34"),c=e("3511"),d=e("65f0"),h=e("8418"),f=e("083a"),u=e("1dde"),g=u("splice"),p=Math.max,m=Math.min;i({target:"Array",proto:!0,forced:!g},{splice:function(t,a){var e,i,u,g,_,v,b=o(this),y=r(b),w=s(t,y),C=arguments.length;for(0===C?e=i=0:1===C?(e=0,i=y-w):(e=C-2,i=m(p(n(a),0),y-w)),c(y+e-i),u=d(b,i),g=0;g<i;g++)_=w+g,_ in b&&h(u,g,b[_]);if(u.length=i,e<i){for(g=w;g<y-i;g++)_=g+i,v=g+e,_ in b?b[v]=b[_]:f(b,v);for(g=y;g>y-i+e;g--)f(b,g-1)}else if(e>i)for(g=y-i;g>w;g--)_=g+i-1,v=g+e-1,_ in b?b[v]=b[_]:f(b,v);for(g=0;g<e;g++)b[g+w]=arguments[g+2];return l(b,y-i+e),u}})},ab2d:function(t,a,e){"use strict";e("5b3f")},addb:function(t,a,e){"use strict";var i=e("4dae"),o=Math.floor,s=function(t,a){var e=t.length,l=o(e/2);return e<8?n(t,a):r(t,s(i(t,0,l),a),s(i(t,l),a),a)},n=function(t,a){var e,i,o=t.length,s=1;while(s<o){i=s,e=t[s];while(i&&a(t[i-1],e)>0)t[i]=t[--i];i!==s++&&(t[i]=e)}return t},r=function(t,a,e,i){var o=a.length,s=e.length,n=0,r=0;while(n<o||r<s)t[n+r]=n<o&&r<s?i(a[n],e[r])<=0?a[n++]:e[r++]:n<o?a[n++]:e[r++];return t};t.exports=s},cff0:function(t,a,e){"use strict";e.r(a);var i=function(){var t=this,a=t.$createElement,i=t._self._c||a;return i("div",[i("audio",{staticStyle:{visibility:"hidden"},attrs:{id:"audio",src:e("17c3")}}),i("audio",{staticStyle:{visibility:"hidden"},attrs:{id:"audioother",src:e("9466")}}),i("div",{staticClass:"app-container",staticStyle:{display:"flex"}},[i("div",{staticStyle:{width:"77%",display:"inline-block"}},[i("el-table",{directives:[{name:"el-table-infinite-scroll",rawName:"v-el-table-infinite-scroll",value:t.load,expression:"load"}],attrs:{"empty-text":"暂无数据",data:t.slice_bed_data_list,"element-loading-text":"Loading",height:"1000px",width:"1000px",border:"",fit:"","row-class-name":t.tableRowClassName,"highlight-current-row":""}},[i("el-table-column",{attrs:{align:"center",label:"ID",width:"40"},scopedSlots:t._u([{key:"default",fn:function(a){return[t._v(" "+t._s(a.$index)+" "),i("p",[t._v(t._s(t.gettztype(a.row.data.method)))]),"1"!==a.row.data.method.slice(-1)?i("div",{staticClass:"smallbtn",on:{click:function(e){return t.ccCalcute(a.row,t.JCInfos[a.row.matchId],t.HGInfos[a.row.matchId],1)}}},[t._v(" 1 ")]):t._e(),"1"!==a.row.data.method.slice(-1)?i("div",{staticClass:"smallbtn",on:{click:function(e){return t.ccCalcute(a.row,t.JCInfos[a.row.matchId],t.HGInfos[a.row.matchId],2)}}},[t._v(" 2 ")]):t._e()]}}])}),i("el-table-column",{attrs:{label:"赛事",width:"250",align:"center"},scopedSlots:t._u([{key:"default",fn:function(a){return[i("div",{staticStyle:{border:"1px solid #dfc6c6","border-bottom":"0px"}},[i("span",{staticStyle:{color:"#ea3d09","font-size":"16px","font-weight":"bolder"}},[t._v(t._s(t.JCInfos[a.row.matchId].matchNumStr))]),i("br"),t._v(" "+t._s(t.JCInfos[a.row.matchId].matchTimeFormat)),i("br"),t._v(" 【JC赛事】 "),i("br"),t._v(" 【"+t._s(t.JCInfos[a.row.matchId].leagueAbbName)+"】 "),i("span",{staticStyle:{color:"red"}},[t._v(t._s(t.JCInfos[a.row.matchId].homeTeamAbbName))]),t._v(" VS "),i("span",{staticStyle:{color:"blue"}},[t._v(t._s(t.JCInfos[a.row.matchId].awayTeamAbbName))])]),i("div",{staticStyle:{border:"1px solid #dfc6c6"}},[t._v(" 【HG赛事】"),i("br"),t._v(" 【"+t._s(t.HGInfos[a.row.matchId].leagueAbbName)+"】"),i("br"),i("span",{staticStyle:{color:"red"}},[t._v(t._s(t.HGInfos[a.row.matchId].homeTeamAbbName))]),t._v(" VS "),i("span",{staticStyle:{color:"blue"}},[t._v(t._s(t.HGInfos[a.row.matchId].awayTeamAbbName))]),i("br"),t._v(" 更新时间："+t._s(t.dateFormat(new Date(t.HGInfos[a.row.matchId].updatedAt),"yyyy-MM-dd hh:mm:ss"))+" ")])]}}])}),i("el-table-column",{attrs:{label:"JC投注",align:"center"},scopedSlots:t._u([{key:"default",fn:function(a){return[i("div",{staticStyle:{padding:"0 10px"}},[i("el-row",{staticStyle:{"margin-bottom":"10px"},attrs:{gutter:20}},[i("el-col",{attrs:{span:6}},[t._v(" 投注类型 ")]),i("el-col",{attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?"大":"主负")+" ")]),i("el-col",{attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?"小":"主胜")+" ")])],1),t._l(t.JCInfos[a.row.matchId].jcodds,(function(e,o){return i("el-row",{directives:[{name:"show",rawName:"v-show",value:"大小"===e.type.slice(0,2)&&"dx"===a.row.gametype||"大小"!==e.type.slice(0,2)&&"dx"!==a.row.gametype,expression:"(jcodd.type.slice(0,2)==='大小'&&scope.row.gametype==='dx')||(jcodd.type.slice(0,2)!=='大小'&&scope.row.gametype!=='dx')"}],key:o,attrs:{gutter:20}},[i("el-popover",{attrs:{placement:"left",width:"260",trigger:"hover"},on:{show:function(i){return t.showOddsChg(e.goalLine,a.row.matchId)}}},[i("div",{attrs:{id:"oddsChgDiv"}},[i("div",{staticStyle:{"background-color":"#FF6000",color:"#FFFFFF","line-height":"21px"}},[t._v(" "+t._s(t.JCInfos[a.row.matchId].homeTeamAbbName)+" VS "+t._s(t.JCInfos[a.row.matchId].awayTeamAbbName)+" 奖金变化 ")]),i("div",{staticClass:"OpenDivTop"},[i("table",{staticClass:"OpenDivMain",attrs:{cellpadding:"0",cellspacing:"0"}},[t.arrChgOdds[0]&&t.arrChgOdds[0].goalLine&&parseInt(t.arrChgOdds[0].goalLine)>50?i("tbody",[i("tr",{attrs:{bgcolor:"#F0F8FF"}},[i("td",[t._v("大分")]),i("td",[t._v("总分")]),i("td",[t._v("小分")]),i("td",[t._v("时间")])]),t._l(t.arrChgOdds,(function(a,e){return i("tr",{key:e},[i("td",[i("font",{attrs:{color:"-1"===a.hf?"#269803":"1"===a.hf?"#FF0000":""}},[t._v(" "+t._s(a.h)+t._s("-1"===a.hf?"↓":"1"===a.hf?"↑":"")+" ")])],1),a.goalLine?i("td",[i("font",{attrs:{color:"-1"===a.goalLinef?"#269803":"1"===a.goalLinef?"#FF0000":""}},[t._v(" "+t._s(a.goalLine)+t._s("-1"===a.goalLinef?"↓":"1"===a.goalLinef?"↑":"")+" ")])],1):t._e(),i("td",[i("font",{attrs:{color:"-1"===a.lf?"#269803":"1"===a.lf?"#FF0000":""}},[t._v(" "+t._s(a.l)+t._s("-1"===a.lf?"↓":"1"===a.lf?"↑":"")+" ")])],1),i("td",[t._v(t._s(a.updateDate.slice(5))+" "+t._s(a.updateTime.slice(0,5)))])])}))],2):i("tbody",[i("tr",{attrs:{bgcolor:"#F0F8FF"}},[i("td",[t._v("主负")]),t.arrChgOdds[0]&&t.arrChgOdds[0].goalLine?i("td",[t._v(" 让分 ")]):t._e(),i("td",[t._v("主胜")]),i("td",[t._v("时间")])]),t._l(t.arrChgOdds,(function(a,e){return i("tr",{key:e},[i("td",[i("font",{attrs:{color:"-1"===a.af?"#269803":"1"===a.af?"#FF0000":""}},[t._v(" "+t._s(a.a)+t._s("-1"===a.af?"↓":"1"===a.af?"↑":"")+" ")])],1),a.goalLine?i("td",[i("font",{attrs:{color:"-1"===a.goalLinef?"#269803":"1"===a.goalLinef?"#FF0000":""}},[t._v(" "+t._s(a.goalLine)+t._s("-1"===a.goalLinef?"↓":"1"===a.goalLinef?"↑":"")+" ")])],1):t._e(),i("td",[i("font",{attrs:{color:"-1"===a.hf?"#269803":"1"===a.hf?"#FF0000":""}},[t._v(" "+t._s(a.h)+t._s("-1"===a.hf?"↓":"1"===a.hf?"↑":"")+" ")])],1),i("td",[t._v(t._s(a.updateDate.slice(5))+" "+t._s(a.updateTime.slice(0,5)))])])}))],2)])])]),i("el-col",{class:a.row.jctz[e.goalLine]?"selecttd1":"",attrs:{slot:"reference",span:6},slot:"reference"},[t._v(" "+t._s(e.type)+" ")])],1),i("el-col",{class:a.row.jctz[e.goalLine]&&(a.row.jctz[e.goalLine].indexOf("a")>-1||a.row.jctz[e.goalLine].indexOf("d")>-1)?"selecttd":"",attrs:{span:9}},[t._v(" "+t._s((a.row.gametype,e.a))+" ")]),i("el-col",{class:a.row.jctz[e.goalLine]&&(a.row.jctz[e.goalLine].indexOf("h")>-1||a.row.jctz[e.goalLine].indexOf("x")>-1)?"selecttd":"",attrs:{span:9}},[t._v(" "+t._s((a.row.gametype,e.h))+" ")])],1)}))],2)]}}])}),i("el-table-column",{attrs:{"class-name":"status-col",label:"平台投注",align:"center"},scopedSlots:t._u([{key:"default",fn:function(a){return[i("div",{staticStyle:{padding:"0 10px"}},[i("el-row",{staticStyle:{"margin-top":"10px"},attrs:{gutter:20}},[i("el-col",{attrs:{span:6}},[t._v(" 投注类型 ")]),i("el-col",{attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?"大":t.HGInfos[a.row.matchId].homeTeamAbbName)+" ")]),i("el-col",{attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?"小":t.HGInfos[a.row.matchId].awayTeamAbbName)+" ")])],1),t._l(t.HGInfos[a.row.matchId].hgodds,(function(e,o){return i("el-row",{directives:[{name:"show",rawName:"v-show",value:"大小"===e.type.slice(0,2)&&"dx"===a.row.gametype||"大小"!==e.type.slice(0,2)&&"dx"!==a.row.gametype,expression:"(hgodd.type.slice(0,2)==='大小'&&scope.row.gametype==='dx')||(hgodd.type.slice(0,2)!=='大小'&&scope.row.gametype!=='dx')"}],key:o,staticStyle:{"margin-top":"5px"},attrs:{gutter:20}},[i("div",[i("el-col",{class:a.row.hgtz[e.goalLine]?"selecttd1":"",attrs:{span:6}},[t._v(" "+t._s(e.type)+" ")]),i("el-col",{class:a.row.hgtz[e.goalLine]&&(a.row.hgtz[e.goalLine].indexOf("h")>-1||a.row.hgtz[e.goalLine].indexOf("d")>-1)?"selecttd":"",attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?e.a:e.h)+" ")]),i("el-col",{class:a.row.hgtz[e.goalLine]&&(a.row.hgtz[e.goalLine].indexOf("a")>-1||a.row.hgtz[e.goalLine].indexOf("x")>-1)?"selecttd":"",attrs:{span:9}},[t._v(" "+t._s("dx"===a.row.gametype?e.h:e.a)+" ")])],1)])}))],2)]}}])}),i("el-table-column",{attrs:{align:"center",label:"利润",width:"100",prop:"data.profit"}}),i("el-table-column",{attrs:{align:"center",label:"利润率",width:"100",prop:"profitRate"},scopedSlots:t._u([{key:"default",fn:function(a){return[t._v(" "+t._s(a.row.data.profitRate)+" "),i("br"),i("el-button",{attrs:{size:"mini",type:"success"},on:{click:function(e){return t.calculate(a.row)}}},[t._v(" 计算 ")])]}}])})],1),t.isflag?i("el-alert",{attrs:{title:"正在努力加载中...",type:"success",center:"",closable:!1,"show-icon":""}}):t._e(),t.isMore?i("el-alert",{attrs:{title:"没有更多啦！",type:"warning",center:"","show-icon":""}}):t._e()],1),i("div",{staticClass:"intf-dialog",staticStyle:{width:"23%",display:"inline-block","background-color":"#fff","margin-left":"1%"}},[i("div",{style:"position:relative;display: flex;"+(t.boxopen?"":"max-height:0px")},[i("div",{staticClass:"firstcol"},[i("div",{staticClass:"li",staticStyle:{"background-color":"rgb(207, 7, 7)",color:"#fff",position:"relative",width:"100px",top:"0px"}},[i("span",{on:{click:function(a){return t.selectGames("")}}},[t._v("全部比赛")])]),i("div",{staticClass:"hualun"},t._l(t.arrTimeMatchs,(function(a,e){return i("div",{key:e},[i("p",{staticStyle:{margin:"0","font-size":"14px",color:"#fff","background-color":"#000",width:"100%","text-align":"center",padding:"3px"}},[t._v(" "+t._s(a.time)+" ")]),t._l(a.arrMacths,(function(a,e){return i("div",{key:e,staticClass:"li",on:{click:function(e){return t.selectGames(a.matchId)}}},[i("span",[t._v(t._s(a.matchNumStr))]),t._v(" "),"1"===a.isSingle_had||"1"===a.isSingle_hhad?i("el-tag",{attrs:{size:"mini",effect:"dark",type:"danger"}},[t._v(" 单 ")]):t._e(),t._v(" "),i("br"),i("span",{style:(parseFloat(a.maxProfitRate)>0?"color:rgb(202, 6, 6)":"color:green")+";margin-top: 5px;display: block;"},[t._v(t._s("-100%"===a.maxProfitRate?"无数据":a.maxProfitRate))])],1)}))],2)})),0)]),i("div",{staticClass:"secondcol"},[i("div",{staticClass:"li",staticStyle:{"background-color":"rgb(207, 7, 7)",position:"relative",color:"#fff",width:"150px",top:"0px"}},[i("span",{on:{click:function(a){t.cccalshow=!0}}},[t._v("串子计算器")])]),i("div",{staticClass:"li"},[t._v(" 最高倍数 "),i("br"),i("el-input-number",{staticStyle:{"margin-right":"20px"},attrs:{"controls-position":"right",precision:2,step:.01,size:"mini"},on:{change:function(a){return t.changeMaxBeis()}},model:{value:t.configData.maxmultiple,callback:function(a){t.$set(t.configData,"maxmultiple",a)},expression:"configData.maxmultiple"}})],1),i("div",{staticClass:"hualun"},[i("div",{staticClass:"li"},[i("el-select",{attrs:{multiple:"",placeholder:"排除场次",size:"mini"},model:{value:t.outMatch,callback:function(a){t.outMatch=a},expression:"outMatch"}},t._l(t.JCInfos,(function(t){return i("el-option",{key:t.matchNumStr,attrs:{label:t.matchNumStr,value:t.matchId}})})),1)],1),i("div",{staticClass:"li"},[i("el-select",{attrs:{multiple:"",placeholder:"包含场次",size:"mini"},model:{value:t.inMatch,callback:function(a){t.inMatch=a},expression:"inMatch"}},t._l(t.JCInfos,(function(t){return i("el-option",{key:t.matchNumStr,attrs:{label:t.matchNumStr,value:t.matchId}})})),1)],1),0===t.ccList.length?i("div",{staticClass:"li"},[t._v(" 暂无高于0数据 ")]):t._l(t.ccList,(function(a,e){return i("div",{key:e,staticClass:"li",on:{click:function(e){return t.selectccGames(a)}}},[i("p",{staticStyle:{"background-color":"#000",color:"#FFF",margin:"0"}},[t._v(" "+t._s(a.matchNumStr1)+"x"+t._s(a.matchNumStr2)+" ")]),i("p",{staticStyle:{margin:"0","margin-top":"5px"}},[i("span",[t._v(t._s(a.beis)+"倍 ")]),t._v(t._s(a.JCTouzName1)+"x"+t._s(a.JCTouzName2)+" ")]),i("span",{style:(parseFloat(a.JcProfitRate)>0?"color:rgb(202, 6, 6)":"color:green")+";margin-top: 5px;display: block;"},[t._v(t._s(parseFloat(a.JcProfitRate).toFixed(2))+"%")])])}))],2)]),i("div",{staticClass:"thredcol"},[t._m(0),i("div",{staticClass:"hualun"},t._l(t.planList,(function(a,e){return i("div",{key:e,staticClass:"li",on:{click:function(e){return t.selectccGames(a)}}},[a.Marks?i("el-tag",{staticStyle:{"margin-bottom":"2px"},attrs:{size:"mini"}},[t._v(" "+t._s(a.Marks)+" ")]):t._e(),a.Marks?i("br"):t._e(),t._v(" "+t._s(a.planId.split("%0A")[0])+" "),i("br"),t._v("X"),i("br"),t._v(" "+t._s(a.planId.split("%0A")[1])+" "),i("br"),i("el-button",{staticStyle:{"z-index":"100"},attrs:{size:"mini",type:"danger",icon:"el-icon-delete",circle:""},on:{click:function(e){return t.delPlan(a)}}})],1)})),0),i("div",{staticClass:"check",staticStyle:{"background-color":"rgb(207, 7, 7)",position:"relative",color:"#fff",width:"120px",margin:"10px 0 0 0",top:"0px"},on:{click:function(a){return t.showhistoryplan(1)}}},[i("span",[t._v("查看历史方案")]),i("span",{class:{"el-icon-caret-left":!t.showHisPlan}}),i("span",{class:{"el-icon-caret-bottom":t.showHisPlan}})]),i("div",{staticClass:"checkhualun",attrs:{visible:t.showHisPlan},on:{"update:visible":function(a){t.showHisPlan=a}}},t._l(t.hisPlanList,(function(a,e){return i("div",{key:e,staticClass:"li",on:{click:function(e){return t.selectccGames(a)}}},[a.Marks?i("el-tag",{staticStyle:{"margin-bottom":"2px"},attrs:{size:"mini"}},[t._v(" "+t._s(a.Marks)+" ")]):t._e(),a.Marks?i("br"):t._e(),t._v(" "+t._s(a.planId.split("%0A")[0])+" "),i("br"),t._v("X"),i("br"),t._v(" "+t._s(a.planId.split("%0A")[1])+" "),i("br"),i("el-popconfirm",{attrs:{title:"确定删除此方案吗？"},on:{confirm:function(e){return t.delPlan(a)},onConfirm:function(e){return t.delPlan(a)}}},[i("el-button",{staticStyle:{"z-index":"100"},attrs:{slot:"reference",size:"mini",type:"danger",icon:"el-icon-delete",circle:""},on:{click:function(t){t.stopPropagation()}},slot:"reference"})],1)],1)})),0)])]),i("div",{staticClass:"otherwat"},[t.ftSinList&&t.ftSinList.length>0?i("div",[t._v(" 足单： "),i("ul",{staticClass:"otherwatul"},t._l(t.ftSinList,(function(a,e){return i("li",{key:e},[t._v(" "+t._s(a.matchNumStr)),i("br"),i("span",{staticStyle:{color:"red"}},[t._v(t._s(a.profitRate))])])})),0)]):t._e(),t.ftChuanList&&t.ftChuanList.length>0?i("div",[t._v(" 足串： "),i("ul",{staticClass:"otherwatul"},t._l(t.ftChuanList,(function(a,e){return i("li",{key:e},[t._v(" "+t._s(a.matchNumStr1)),i("br"),t._v(t._s(a.matchNumStr2)),i("br"),i("span",{staticStyle:{color:"red"}},[t._v(t._s(a.profitRate))])])})),0)]):t._e(),t.fttgList&&t.fttgList.length>0?i("div",[t._v(" 总进球数： "),i("ul",{staticClass:"otherwatul"},t._l(t.fttgList,(function(a,e){return i("li",{key:e},[t._v(" "+t._s(a.matchNumStr)),i("br"),i("span",{staticStyle:{color:"red"}},[t._v(t._s(a.profitRate))])])})),0)]):t._e(),t.bqcList&&t.bqcList.length>0?i("div",[t._v(" 半全场: "),i("ul",{staticClass:"otherwatul"},t._l(t.bqcList,(function(a,e){return i("li",{key:e},[t._v(" "+t._s(a.matchNumStr)),i("br"),i("span",{staticStyle:{color:"red"}},[t._v(t._s(a.profitRate))])])})),0)]):t._e()])])])])},o=[function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"li",staticStyle:{"background-color":"rgb(207, 7, 7)",position:"relative",color:"#fff",width:"120px",top:"0px"}},[e("span",[t._v("保存方案")])])}],s=e("c7eb"),n=e("1da1"),r=e("5530"),l=(e("b64b"),e("e9c4"),e("4de4"),e("d3b7"),e("fb6a"),e("b0c0"),e("14d9"),e("99af"),e("25f0"),e("a9e3"),e("ac1f"),e("5319"),e("00b4"),e("4d63"),e("c607"),e("2c3e"),e("d81d"),e("b680"),e("a434"),e("4e82"),e("a15b"),e("3f70")),c=e("60a8"),d=(e("9d9f"),{filters:{statusFilter:function(t){var a={published:"success",draft:"gray",deleted:"danger"};return a[t]}},props:{configData:Object,planList:Array,hisPlanList:Array,flashFlag:Boolean},data:function(){return{outMatch:"",inMatch:"",dglrshow:!0,cclrshow:!1,boxopen:!0,start:0,end:10,isflag:!1,isMore:!1,list:[],allList:[],seltedMatch:"",slice_bed_data_list:[],listLoading:!0,arrSFInfos:[],arrRSFInfos:[],arrZFInfos:[],HGInfos:[],JCInfos:[],timer:null,tiptone:!1,arrdgtztype:[{value:"WL",name:"生死"},{value:"WLD1",name:"内平生死平"},{value:"WLD2",name:"外平生死平"},{value:"WH1",name:"内平赢一半"},{value:"WH2",name:"外平赢一半"},{value:"WH3",name:"内只平赢一半"},{value:"D1",name:"内平手盘"},{value:"D2",name:"外平手盘"},{value:"D3",name:"内只平手盘"},{value:"LH1",name:"内平输一半"},{value:"LH2",name:"外平输一半"},{value:"LH3",name:"内只平输一半"}],ccList:[],ccAllList:[],ccSaveData:[],arrTimeMatchs:[],arrChgOdds:[],ftChuanList:[],ftSinList:[],fttgList:[],bqcList:[],showHisPlan:!1}},watch:{configData:function(t){this.fetchData()},flashFlag:function(t){this.fetchData()}},created:function(){},mounted:function(){this.fetchData()},beforeDestroy:function(){clearTimeout(this.timer)},methods:{showhistoryplan:function(t){0==this.showHisPlan?(this.$emit("showhistoryplan",1),this.showHisPlan=!0):(this.$emit("showhistoryplan",0),this.showHisPlan=!1)},showOddsChg:function(t,a){var e=this;this.arrChgOdds=[],Object(c["a"])({matchId:a,poolCode:"-"===t?"mnl":parseFloat(t)>50?"hilo":"hdc"}).then((function(a){"-"===t?e.arrChgOdds=a.value.mnlList:parseFloat(t)>50?e.arrChgOdds=a.value.hiloList:e.arrChgOdds=a.value.hdcList}))},aplayAudio:function(t){if(!this.tiptone)return!1;var a=document.getElementById(t);a.play()},changeMaxBeis:function(){var t=this,a=JSON.parse(JSON.stringify(this.ccAllList));a=a.filter((function(a){return a.beis<t.configData.maxmultiple})),this.ccList=a.slice(0,100)},delPlan:function(t){this.$emit("delPlan",t)},selectccGames:function(t){this.$emit("selectccGames",{ccDatas:JSON.parse(JSON.stringify(t)),jcMatch1:this.JCInfos[t.matchId1],jcMatch2:this.JCInfos[t.matchId2],hgMatch1:this.HGInfos[t.matchId1],hgMatch2:this.HGInfos[t.matchId2]})},ccCalcute:function(t,a,e,i){this.$emit("ccCalcute",{gametype:"lqdg",tzInfo:t,jcMatch:a,hgMatch:e,id:i})},gettztype:function(t){for(var a=0;a<this.arrdgtztype.length;a++)if(this.arrdgtztype[a].value===t)return this.arrdgtztype[a].name},selectGames:function(t){if(this.slice_bed_data_list=[],this.seltedMatch=t,this.seltedMatch){this.list=[];for(var a=0;a<this.allList.length;a++)this.allList[a].matchId===this.seltedMatch&&this.list.push(this.allList[a])}else this.list=this.allList;this.start=0,this.end=10,this.load()},load:function(){var t=this;this.isMore=!1,this.isflag=!0,this.isflag&&(this.slice_bed_data_list.length!==this.list.length?(this.slice_bed_data_list=this.slice_bed_data_list.concat(this.list.slice(this.start,this.end)),this.start=this.end,this.end=this.end+10):setTimeout((function(){t.isMore=!0,setTimeout((function(){t.isMore=!1}),2e3)}),2e3),setTimeout((function(){t.isflag=!1,t.isMore=!1}),1e3))},tableRowClassName:function(t){t.row;var a=t.rowIndex;return a%4===0?"warning-row":a%2===0?"success-row":""},calculate:function(t){t.data.JCPoint=this.configData.JCPointSin,t.data.HGPoint=this.configData.HGPoint,this.$emit("calculate",{matchInfo:t,gametype:"lqdg",JCInfos:this.JCInfos,HGInfos:this.HGInfos})},getArrObjByMacthId:function(t,a){for(var e=0;e<a.length;e++)if(a[e].matchId===t)return a[e]},gettouz:function(t,a){var e="";if("jc"===a)for(var i=0;i<t.length;i++)t.slice(i,i+1)!==t.slice(i,i+1).toUpperCase()&&(e+=t.slice(i,i+1));else for(var o=0;o<t.length;o++)t.slice(o,o+1)===t.slice(o,o+1).toUpperCase()&&(e+=t.slice(o,o+1).toLowerCase());return e},comAccMul:function(t,a){var e=0,i=t.toString(),o=a.toString();try{e+=i.split(".")[1].length}catch(s){console.error("e =",s)}try{e+=o.split(".")[1].length}catch(s){console.error("e =",s)}return Number(i.replace(".",""))*Number(o.replace(".",""))/Math.pow(10,e)},getDayOfWeek:function(){var t=new Date,a=t.getDay(),e=["周日","周一","周二","周三","周四","周五","周六"],i=e[a];return i},getTomorrowDayOfWeek:function(){var t=new Date,a=new Date;a.setDate(t.getDate()+1);var e=a.getDay(),i=["周日","周一","周二","周三","周四","周五","周六"],o=i[e];return o},getMaxValueByMatchId:function(t,a){for(var e=-100,i=0;i<t.length;i++)t[i].matchId===a&&e<parseFloat(t[i].data.profitRate)&&(e=parseFloat(t[i].data.profitRate));return e+"%"},dateFormat:function(t,a){var e={"M+":t.getMonth()+1,"d+":t.getDate(),"h+":t.getHours(),"H+":t.getHours(),"m+":t.getMinutes(),"s+":t.getSeconds(),"q+":Math.floor((t.getMonth()+3)/3),S:t.getMilliseconds()};for(var i in/(y+)/.test(a)&&(a=a.replace(RegExp.$1,(t.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+i+")").test(a)&&(a=a.replace(RegExp.$1,1===RegExp.$1.length?e[i]:("00"+e[i]).substr((""+e[i]).length)));return a},dealOtherProfit:function(t){for(var a=this,e=t.watData.bsktList.map((function(t){return Object(r["a"])(Object(r["a"])({},t),{},{profitRate:(parseFloat(t.profitRate.replace("%",""))+100*a.configData.JCPointSinLq-12).toFixed(2)+"%"})})),i=t.watData.fttgList.map((function(t){return Object(r["a"])(Object(r["a"])({},t),{},{profitRate:(parseFloat(t.profitRate.replace("%",""))+100*a.configData.JCPointSinTgg-12).toFixed(2)+"%"})})),o=t.watData.ftSinList.map((function(t){return Object(r["a"])(Object(r["a"])({},t),{},{profitRate:(parseFloat(t.profitRate.replace("%",""))+100*a.configData.JCPointSinHad-12).toFixed(2)+"%"})})),s=t.watData.ftChuanList.map((function(t){return Object(r["a"])(Object(r["a"])({},t),{},{profitRate:(parseFloat(t.profitRate.replace("%",""))+100*a.configData.JCPointChuanHad-14).toFixed(2)+"%"})})),n=t.watData.bqcList.map((function(t){return Object(r["a"])(Object(r["a"])({},t),{},{profitRate:(parseFloat(t.profitRate.replace("%",""))+100*a.configData.JCPointSinHalf-12).toFixed(2)+"%"})})),l=0;l<e.length;l++)parseFloat(e[l].profitRate.replace("%",""))<0&&(e.splice(l,1),l--);for(var c=0;c<i.length;c++)parseFloat(i[c].profitRate.replace("%",""))<0&&(i.splice(c,1),c--);for(var d=0;d<o.length;d++)parseFloat(o[d].profitRate.replace("%",""))<0&&(o.splice(d,1),d--);for(var h=0;h<s.length;h++)parseFloat(s[h].profitRate.replace("%",""))<0&&(s.splice(h,1),h--);for(var f=0;f<n.length;f++)parseFloat(n[f].profitRate.replace("%",""))<0&&(n.splice(f,1),f--);JSON.stringify(this.ftSinList)!=JSON.stringify(o)&&this.configData.danSwitch&&this.aplayAudio("tsy"+this.configData.danRadio),JSON.stringify(this.ftChuanList)!=JSON.stringify(s)&&this.configData.chuanSwitch&&this.aplayAudio("tsy"+this.configData.chuanRadio),JSON.stringify(this.fttgList)!=JSON.stringify(i)&&this.configData.zjqsSwitch&&this.aplayAudio("tsy"+this.configData.zjqsRadio),JSON.stringify(this.bqcList)!=JSON.stringify(n)&&this.configData.bqcSwitch&&this.aplayAudio("tsy"+this.configData.bqcRadio),this.tiptone=!0,this.ftChuanList=s,this.ftSinList=o,this.fttgList=i,this.bqcList=n},fetchData:function(){var t=this;return Object(n["a"])(Object(s["a"])().mark((function a(){var e,i;return Object(s["a"])().wrap((function(a){while(1)switch(a.prev=a.next){case 0:t.listLoading=!0,e="","today"===t.configData.scope?e=t.getDayOfWeek():"tom"===t.configData.scope&&(e=t.getTomorrowDayOfWeek()),i={JCPointSin:t.configData.JCPointSin,JCPointChuan:t.configData.JCPointChuan,HGPoint:t.configData.HGPoint,JCTzAmt:t.configData.JCTzAmt,scope:e,outMatch:t.outMatch,inMatch:t.inMatch},Object(l["b"])(i).then((function(a){var e=a.sinData,i=a.HGInfos,o=a.JCInfos;t.JCInfos={},t.HGInfos={},t.arrTimeMatchs=[],e=e.sort((function(t,a){return parseFloat(a.data.profitRate)-parseFloat(t.data.profitRate)}));for(var s=0;s<o.length;s++){var n=o[s],r=t.getArrObjByMacthId(n.matchId,i);if(r){n.jcodds=[],r.hgodds=[],n.mnl_a&&n.jcodds.push({type:"胜负",h:n.mnl_h,a:n.mnl_a,goalLine:"-"}),n.hdc_goalLine&&n.jcodds.push({type:"让分>>> "+n.hdc_goalLine,a:n.hdc_a,h:n.hdc_h,goalLine:n.hdc_goalLine}),r.mnl_a&&r.hgodds.push({type:"独赢",a:r.mnl_a,h:r.mnl_h,goalLine:"-"});for(var l=1;l<7;l++)""!==r["hdc_goalLine"+l]&&"-"!==r["hdc_goalLine"+l]&&"null"!==r["hdc_goalLine"+l]&&null!==r["hdc_goalLine"+l]&&r.hgodds.push({type:"让分>>>  "+r["hdc_goalLine"+l],a:r["hdc_a"+l],h:r["hdc_h"+l],goalLine:r["hdc_goalLine"+l]});n.hilo_a&&n.jcodds.push({type:"大小分>>> "+n.hilo_goalLine,a:n.hilo_a,h:n.hilo_h,goalLine:n.hilo_goalLine});for(var c=1;c<6;c++)""!==r["hilo_goalLine"+c]&&"-"!==r["hilo_goalLine"+c]&&r.hgodds.push({type:"大小分>>>  "+r["hilo_goalLine"+c],a:r["hilo_a"+c],h:r["hilo_h"+c],goalLine:r["hilo_goalLine"+c]});t.JCInfos[n.matchId]=n,t.HGInfos[r.matchId]=r;var d=void 0;for(d=0;d<t.arrTimeMatchs.length;d++)if(t.arrTimeMatchs[d].time===n.matchTimeFormat.slice(5,16)){t.arrTimeMatchs[d].arrMacths.push(n);break}d===t.arrTimeMatchs.length&&(t.arrTimeMatchs[d]={time:n.matchTimeFormat.slice(5,16),arrMacths:[n]})}}t.arrTimeMatchs=t.arrTimeMatchs.sort((function(t,a){return a.time-t.time}));for(var h=[],f=0;f<e.length;f++)"+"===e[f].data.JCgoalLine1.slice(0,1)?e[f].data.HGgoalLine1!==e[f].data.JCgoalLine1.slice(1)&&h.push(e[f]):e[f].data.HGgoalLine1!==e[f].data.JCgoalLine1&&h.push(e[f]);e=h;for(var u=0;u<e.length;u++)e[u].jctz={},e[u].hgtz={},"-"!==e[u].data.JCTouz1?e[u].jctz[e[u].data.JCgoalLine1]=e[u].data.JCTouz1:(e[u].data.JCgoalLine1="",e[u].data.JCTouz1="",e[u].data.jcOdds1=""),"-"!==e[u].data.JCTouz2?e[u].jctz[e[u].data.JCgoalLine2]=e[u].jctz[e[u].data.JCgoalLine2]?e[u].jctz[e[u].data.JCgoalLine2]+e[u].data.JCTouz2:e[u].data.JCTouz2:(e[u].data.JCgoalLine2="",e[u].data.JCTouz2="",e[u].data.jcOdds2=""),"-"!==e[u].data.HGTouz1?e[u].hgtz[e[u].data.HGgoalLine1]=e[u].data.HGTouz1:(e[u].data.HGgoalLine1="",e[u].data.HGTouz1="",e[u].data.hgOdds1=""),"-"!==e[u].data.HGTouz2?e[u].hgtz[e[u].data.HGgoalLine2]=e[u].hgtz[e[u].data.HGgoalLine2]?e[u].hgtz[e[u].data.HGgoalLine2]+e[u].data.HGTouz2:e[u].data.HGTouz2:(e[u].data.HGgoalLine2="",e[u].data.HGTouz2="",e[u].data.hgOdds2=""),"d"!==e[u].data.HGTouz1&&"x"!==e[u].data.HGTouz1||(e[u].gametype="dx");if(t.allList=e,t.seltedMatch){t.list=[];for(var g=0;g<t.allList.length;g++)t.allList[g].matchId===t.seltedMatch&&t.list.push(t.allList[g])}else t.list=e;for(var p in t.start=0,t.JCInfos)t.JCInfos[p].maxProfitRate=t.getMaxValueByMatchId(e,t.JCInfos[p].matchId);t.end>10&&(t.end=t.end-10),t.slice_bed_data_list=[],t.load(),t.listLoading=!1;var m=a.chuanData;m=m.sort((function(t,a){return parseFloat(a.JcProfit)-parseFloat(t.JcProfit)}));for(var _=[],v=0;v<m.length;v++){switch("-"===m[v].HGTouz1_1&&(m[v].HGTzOdd1_1="",m[v].HGgoalLine1_1="",m[v].HGTouz1_1=""),"-"===m[v].HGTouz1_2&&(m[v].HGTzOdd1_2="",m[v].HGgoalLine1_2="",m[v].HGTouz1_2=""),"-"===m[v].HGTouz2_1&&(m[v].HGTzOdd2_1="",m[v].HGgoalLine2_1="",m[v].HGTouz2_1=""),"-"===m[v].HGTouz2_2&&(m[v].HGTzOdd2_2="",m[v].HGgoalLine2_2="",m[v].HGTouz2_2=""),"-"===m[v].JCTouz1&&(m[v].JCTouz1="",m[v].JCgoalLine1="",m[v].JCTzOdd1=""),"-"===m[v].JCTouz2&&(m[v].JCTouz2="",m[v].JCgoalLine2="",m[v].JCTzOdd2=""),m[v].matchNumStr1=t.JCInfos[m[v].matchId1].matchNumStr,m[v].matchNumStr2=t.JCInfos[m[v].matchId2].matchNumStr,m[v].beis=t.comAccMul(m[v].JCTzOdd1,m[v].JCTzOdd2).toFixed(2),m[v].JCTouzName1="",m[v].JCTouzName2="",m[v].JCgoalLine1&&"-"!==m[v].JCgoalLine1?m[v].JCTouzName1="让":m[v].JCgoalLine1&&"-"===m[v].JCgoalLine1&&(m[v].JCTouzName1=""),m[v].JCTouz1){case"h":m[v].JCTouzName1+="胜";break;case"a":m[v].JCTouzName1+="负";break;case"d":m[v].JCTouzName1+="平";break}switch(m[v].JCgoalLine2&&"-"!==m[v].JCgoalLine2?m[v].JCTouzName2="让":m[v].JCgoalLine2&&"-"===m[v].JCgoalLine2&&(m[v].JCTouzName2=""),m[v].JCTouz2){case"h":m[v].JCTouzName2+="胜";break;case"a":m[v].JCTouzName2+="负";break;case"d":m[v].JCTouzName2+="平";break}parseFloat(m[v].JcProfitRate)>=t.configData.minrate&&_.push(m[v].JcProfitRate)}if(t.ccAllList=JSON.parse(JSON.stringify(m)),m=m.filter((function(a){return a.beis<t.configData.maxmultiple&&parseFloat(a.JcProfitRate)>=t.configData.minrate})),t.ccList=m.slice(0,100),_.join(",")!==t.ccSaveData.join(",")?(t.configData.otherSwitch&&t.aplayAudio("tsy"+t.configData.otherRadio),t.ccSaveData=_):t.ccSaveData=_,t.dealOtherProfit(a),clearTimeout(t.timer),t.configData.autoflash){if("篮球二串一"!==t.$route.name)return;t.timer=setTimeout((function(){t.fetchData()}),1e3*t.configData.interval)}})).catch((function(){if(clearTimeout(t.timer),t.configData.autoflash){if("篮球二串一"!==t.$route.name)return;t.timer=setTimeout((function(){t.fetchData()}),1e3*t.configData.interval)}}));case 5:case"end":return a.stop()}}),a)})))()}}}),h=d,f=(e("ab2d"),e("2877")),u=Object(f["a"])(h,i,o,!1,null,"202c78bf",null);a["default"]=u.exports},d998:function(t,a,e){"use strict";var i=e("342f");t.exports=/MSIE|Trident/.test(i)}}]);