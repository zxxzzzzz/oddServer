(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3f0588fc"],{6308:function(t,a,e){},"94b0":function(t,a,e){"use strict";e.d(a,"b",(function(){return r})),e.d(a,"a",(function(){return c}));var n=e("b775");function r(t){return Object(n["a"])({url:"/water/analysis/tcAdapter",method:"post",data:t})}function c(t){return Object(n["a"])({url:"/water/analysis/hgAdapter",method:"post",data:t})}},a031:function(t,a,e){"use strict";e.r(a);var n=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",[t.arrNotices?e("el-alert",{staticStyle:{"margin-top":"150px"},attrs:{center:"",title:t.arrNotices,type:"info"}}):t._e()],1)},r=[],c=e("94b0"),i={filters:{statusFilter:function(t){var a={published:"success",draft:"gray",deleted:"danger"};return a[t]}},props:{configData:Object,planList:Array,hisPlanList:Array,flashFlag:Boolean,selectMactch:String},data:function(){return{arrNotices:"----后续会陆续更新，如果有需要功能可以提出建议(会分析决定是否增加)。",danAdapter:!0,chuanAdapter:!1,danData:{JCPoint:0,HGPoint:0,jcOdds1:0,jcOdds2:0,hgOdds1:0,hgOdds2:0,jcBet1:0,hgBet1:0,JCRePoint1:0,HGRePoint1:0,jcAmount1:0,hgAmount1:0,profit:0},chuanData:{JCPoint:0,HGPoint:0,jcOdds1:0,jcOdds2:0,hgOdds1:0,hgOdds2:0,jcBet1:0,hgBet1:0,JCRePoint1:0,HGRePoint1:0,jcAmount1:0,hgAmount1:0,profit:0},adapterList:[{value:0,label:"单关"},{value:1,label:"二串一"}],currChose:0}},watch:{},created:function(){},mounted:function(){},beforeDestroy:function(){clearTimeout(this.timer)},methods:{changeMethod:function(t){0==t?(this.danAdapter=!0,this.chuanAdapter=!1):1==t&&(this.danAdapter=!1,this.chuanAdapter=!0)},computeData:function(t){var a=this;1==t?Object(c["b"])({type:1,data:this.chuanData}).then((function(t){a.chuanData=t.data})):Object(c["b"])({type:0,data:this.danData}).then((function(t){a.danData=t.data}))}}},o=i,s=(e("ae81"),e("2877")),d=Object(s["a"])(o,n,r,!1,null,"15a440cb",null);a["default"]=d.exports},ae81:function(t,a,e){"use strict";e("6308")}}]);