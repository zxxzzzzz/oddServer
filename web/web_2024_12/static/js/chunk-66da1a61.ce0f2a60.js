(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-66da1a61"],{"2bd1":function(t,i,e){"use strict";e.r(i);var a=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"home-page"},[t.loginFlag?e("div",{staticClass:"login-container"},[e("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:t.loginForm,rules:t.loginRules,"auto-complete":"on","label-position":"left"}},[e("div",{staticClass:"title-container"},[e("h3",{staticClass:"title"},[t._v("请选择体验时间:")])]),e("div",{staticClass:"title",staticStyle:{"margin-left":"180px","margin-top":"20px"}},[e("el-button",{attrs:{type:"info"},on:{click:function(i){return t.authUser(1)}}},[t._v("1小时")])],1),e("div",{staticClass:"title",staticStyle:{"margin-left":"180px","margin-top":"20px"}},[e("el-button",{attrs:{type:"info"},on:{click:function(i){return t.authUser(2)}}},[t._v("2小时")])],1),e("div",{staticClass:"title",staticStyle:{"margin-left":"180px","margin-top":"20px"}},[e("el-button",{attrs:{type:"info"},on:{click:function(i){return t.authUser(4)}}},[t._v("4小时")])],1),e("div",{staticClass:"title-container"},[e("h3",{staticClass:"title"},[t._v("总计: "+t._s(this.total)+" h")])])]),e("el-dialog",{attrs:{title:"请输入验证码：",visible:t.dialogVisible,width:"30%"},on:{"update:visible":function(i){t.dialogVisible=i}}},[e("el-form",{attrs:{"label-position":"right","label-width":"80px"}},[e("el-form-item",{attrs:{label:"验证码"}},[e("el-input",{model:{value:t.code,callback:function(i){t.code=i},expression:"code"}})],1)],1),e("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[e("el-button",{on:{click:function(i){t.dialogVisible=!1}}},[t._v("取 消")]),e("el-button",{attrs:{type:"primary"},on:{click:function(i){return t.createUser()}}},[t._v("确 定")])],1)],1)],1):t._e(),t.infoContain?e("div",{staticClass:"info-container"},[e("el-card",{staticClass:"box-card"},[e("div",{staticClass:"clearfix",attrs:{slot:"header"},slot:"header"},[e("span",[t._v("卡片名称")])]),t._l(4,(function(i){return e("div",{key:i,staticClass:"text item"},[t._v(" "+t._s("列表内容 "+i)+" ")])}))],2)],1):t._e()])},o=[],s=(e("d9e2"),e("14d9"),e("61f7")),n=e("c24f"),l={name:"Login",timeFlag:0,data:function(){var t=function(t,i,e){Object(s["b"])(i)?e():e(new Error("Please enter the correct user name"))},i=function(t,i,e){i.length<6?e(new Error("The password can not be less than 6 digits")):e()};return{total:0,code:"",dialogVisible:!1,loginForm:{account:"",password:""},loginRules:{account:[{required:!0,trigger:"blur",validator:t}],password:[{required:!0,trigger:"blur",validator:i}]},loading:!1,loginFlag:!0,infoContain:!1,activeIndex:"1",passwordType:"password",redirect:void 0}},watch:{$route:{handler:function(t){this.redirect=t.query&&t.query.redirect},immediate:!0}},created:function(){var t=this;Object(n["a"])({timeFlag:this.timeFlag,code:"109527",create:0}).then((function(i){t.dialogVisible=!1,t.total=i.total}))},methods:{createUser:function(){var t=this;"109527"==this.code?Object(n["a"])({timeFlag:this.timeFlag,code:this.code,create:1}).then((function(i){t.dialogVisible=!1,console.log(i),t.total=i.total,t.$alert(i.data.account+" / "+i.data.account,"创建成功，账号密码为:",{confirmButtonText:"确定",callback:function(i){t.$message({type:"info",message:"action: ".concat(i)})}})})):this.$message({message:"验证码错误",type:"warning"}),this.dialogVisible=!1},authUser:function(t){this.dialogVisible=!0,this.timeFlag=t},showPwd:function(){var t=this;"password"===this.passwordType?this.passwordType="":this.passwordType="password",this.$nextTick((function(){t.$refs.password.focus()}))},handleLogin:function(){var t=this;this.$refs.loginForm.validate((function(i){if(!i)return console.log("error submit!!"),!1;t.loading=!0,t.$store.dispatch("user/login",t.loginForm).then((function(){t.$router.push({path:t.redirect||"/"}),t.loading=!1})).catch((function(){t.loading=!1}))}))}}},r=l,c=(e("ecb6"),e("f380"),e("2877")),d=Object(c["a"])(r,a,o,!1,null,"2d48506e",null);i["default"]=d.exports},"782f":function(t,i,e){},"9c39":function(t,i,e){},ecb6:function(t,i,e){"use strict";e("782f")},f380:function(t,i,e){"use strict";e("9c39")}}]);