(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-d4c1d6f4"],{"0155":function(e,t,o){"use strict";o("0bb1")},"0bb1":function(e,t,o){},"2d16":function(e,t,o){},"9ed6":function(e,t,o){"use strict";o.r(t);var n=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("div",{staticClass:"home-page"},[e.loginFlag?o("div",{staticClass:"login-container"},[o("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:e.loginForm,rules:e.loginRules,"auto-complete":"on","label-position":"left"}},[o("div",{staticClass:"title-container"},[o("h3",{staticClass:"title"},[e._v(" Login Form ")])]),o("el-form-item",{attrs:{prop:"username"}},[o("span",{staticClass:"svg-container"},[o("svg-icon",{attrs:{"icon-class":"user"}})],1),o("el-input",{ref:"username",attrs:{placeholder:"Username",name:"username",type:"text",tabindex:"1","auto-complete":"on"},model:{value:e.loginForm.account,callback:function(t){e.$set(e.loginForm,"account",t)},expression:"loginForm.account"}})],1),o("el-form-item",{attrs:{prop:"password"}},[o("span",{staticClass:"svg-container"},[o("svg-icon",{attrs:{"icon-class":"password"}})],1),o("el-input",{key:e.passwordType,ref:"password",attrs:{type:e.passwordType,placeholder:"Password",name:"password",tabindex:"2","auto-complete":"on"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleLogin(t)}},model:{value:e.loginForm.password,callback:function(t){e.$set(e.loginForm,"password",t)},expression:"loginForm.password"}}),o("span",{staticClass:"show-pwd",on:{click:e.showPwd}},[o("svg-icon",{attrs:{"icon-class":"password"===e.passwordType?"eye":"eye-open"}})],1)],1),o("el-button",{staticStyle:{width:"100%","margin-bottom":"30px"},attrs:{loading:e.loading,type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.handleLogin(t)}}},[e._v(" Login ")])],1)],1):e._e(),e.infoContain?o("div",{staticClass:"info-container"},[o("el-card",{staticClass:"box-card"},[o("div",{staticClass:"clearfix",attrs:{slot:"header"},slot:"header"},[o("span",[e._v("卡片名称")])]),e._l(4,(function(t){return o("div",{key:t,staticClass:"text item"},[e._v(" "+e._s("列表内容 "+t)+" ")])}))],2)],1):e._e()])},s=[],a=(o("d9e2"),o("14d9"),o("61f7")),r={name:"Login",data:function(){var e=function(e,t,o){Object(a["b"])(t)?o():o(new Error("Please enter the correct user name"))},t=function(e,t,o){t.length<6?o(new Error("The password can not be less than 6 digits")):o()};return{loginForm:{account:"",password:""},loginRules:{account:[{required:!0,trigger:"blur",validator:e}],password:[{required:!0,trigger:"blur",validator:t}]},loading:!1,loginFlag:!0,infoContain:!1,activeIndex:"1",passwordType:"password",redirect:void 0}},watch:{$route:{handler:function(e){this.redirect=e.query&&e.query.redirect},immediate:!0}},methods:{showPwd:function(){var e=this;"password"===this.passwordType?this.passwordType="":this.passwordType="password",this.$nextTick((function(){e.$refs.password.focus()}))},handleLogin:function(){var e=this;this.$refs.loginForm.validate((function(t){if(!t)return console.log("error submit!!"),!1;e.loading=!0,e.$store.dispatch("user/login",e.loginForm).then((function(){e.$router.push({path:e.redirect||"/"}),e.loading=!1})).catch((function(){e.loading=!1}))}))}}},i=r,l=(o("0155"),o("e14e"),o("2877")),c=Object(l["a"])(i,n,s,!1,null,"1fd21fd4",null);t["default"]=c.exports},e14e:function(e,t,o){"use strict";o("2d16")}}]);