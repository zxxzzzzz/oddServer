(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-ce5c3a5c"],{ca43:function(t,e,a){},d712:function(t,e,a){"use strict";a("ca43")},fbae:function(t,e,a){"use strict";a.r(e);var l=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"app-container"},[a("el-table",{staticStyle:{width:"100%"},attrs:{data:t.tableData}},[a("el-table-column",{attrs:{prop:"type",label:"公告类型"},scopedSlots:t._u([{key:"default",fn:function(e){return[t._v(" "+t._s("0"===e.row.state?"维护公告":"普通公告")+" ")]}}])}),a("el-table-column",{attrs:{prop:"text",label:"公告"}}),a("el-table-column",{attrs:{label:"状态"},scopedSlots:t._u([{key:"default",fn:function(e){return[t._v(" "+t._s("open"===e.row.state?"开启":"关闭")+" ")]}}])}),a("el-table-column",{attrs:{fixed:"right",label:"操作"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{attrs:{type:"text",size:"small"},on:{click:function(a){return t.handleEdit(e.row)}}},[t._v(" 编辑 ")]),a("el-button",{attrs:{type:"text",size:"small"},on:{click:function(a){return t.handleDelete(e.row)}}},[t._v(" 删除 ")])]}}])})],1),a("el-row",{staticStyle:{"margin-top":"20px"},attrs:{gutter:24}},[a("el-col",{attrs:{span:12}},[a("el-button",{attrs:{type:"primary"},on:{click:function(e){t.dialogVisible=!0}}},[t._v(" 添加公告 ")])],1),a("el-col",{staticStyle:{"text-align":"right"},attrs:{span:12}},[a("el-pagination",{attrs:{background:"","page-size":20,layout:"prev, pager, next",total:t.total},on:{"current-change":t.toPage}})],1)],1),a("el-dialog",{attrs:{title:"添加公告",visible:t.dialogVisible,width:"30%"},on:{"update:visible":function(e){t.dialogVisible=e}}},[a("el-form",{attrs:{"label-position":"right","label-width":"80px",model:t.form}},[a("el-form-item",{attrs:{label:"公告类型"}},[a("el-select",{attrs:{placeholder:"请选择"},model:{value:t.form.type,callback:function(e){t.$set(t.form,"type",e)},expression:"form.type"}},[a("el-option",{attrs:{label:"维护公告",value:"0"}}),a("el-option",{attrs:{label:"普通公告",value:"1"}})],1)],1),a("el-form-item",{attrs:{label:"公告内容"}},[a("el-input",{attrs:{type:"textarea",rows:2},model:{value:t.form.text,callback:function(e){t.$set(t.form,"text",e)},expression:"form.text"}})],1),a("el-form-item",{attrs:{label:"状态"}},[a("el-select",{attrs:{placeholder:"请选择"},model:{value:t.form.state,callback:function(e){t.$set(t.form,"state",e)},expression:"form.state"}},[a("el-option",{attrs:{label:"开启",value:"open"}}),a("el-option",{attrs:{label:"关闭",value:"close"}})],1)],1)],1),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(e){t.dialogVisible=!1}}},[t._v("取 消")]),a("el-button",{attrs:{type:"primary"},on:{click:function(e){return t.saveNotice(t.form)}}},[t._v("确 定")])],1)],1)],1)},o=[],n=a("0bb4"),i={data:function(){return{total:0,tableData:[],form:{state:"开启"},dialogVisible:!1}},created:function(){this.toPage(0)},methods:{onSubmit:function(){this.$message("submit!")},onCancel:function(){this.$message({message:"cancel!",type:"warning"})},toPage:function(t){var e=this;Object(n["b"])({page:t,limit:20}).then((function(t){e.tableData=t.data,e.total=t.count}))},saveNotice:function(t){var e=this;Object(n["c"])(t).then((function(t){e.dialogVisible=!1,e.form={state:"open"},e.toPage(0)}))},handleEdit:function(t){this.form=t,this.dialogVisible=!0},handleDelete:function(t){var e=this;Object(n["a"])(t).then((function(t){e.toPage(0)}))}}},s=i,r=(a("d712"),a("2877")),c=Object(r["a"])(s,l,o,!1,null,"2732ed66",null);e["default"]=c.exports}}]);