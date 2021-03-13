/*============================================================
常规的热更新方案有内置json的方法，这是另外一种思路
将js字符串转化为AST，比对，修改，转化执行，执行的时候用了hermes引擎
============================================================*/

const esprima = require("esprima");//将js代码转化为ast
//放在哪个平台上就需要哪个平台的文档读取能力
const fs = require('fs');//node的文档模块
const estraverse = require("estraverse");//对ast进行遍历
const escodegen = require("escodegen");//重新将ast转化为js
const hermes = require("hermes");//js引擎
//nodejs的拓展，重新包装了child_process
const shell = require('shelljs');//shell



const filename = "myjs.js";
if(fs.existsSync(filename)){
    //1.读取整个文件，默认输出是一个Buffer，但是这里直接将它转换成字符串
    //热更新的时候可以接收一个js字符串
    const content = fs.readFileSync(filename).toString();

    //2.然后将字符串转换为AST
    const AST = esprima.parseScript(content);


    //3.然后对AST进行遍历修改
    walkTheAst(AST);


    //4.将修改后的AST转化为js字符串
    const code = escodegen.generate(AST);


    //5将js字符串写入myjs.js吧
    fs.writeFileSync(filename, code);

    //6.用hermes执行完事
    justDoIt();



}else{
    console.log('-----out');
}

//对AST进行遍历修改,返回一个新的AST
function walkTheAst(ast){
    return estraverse.traverse(ast,{
        enter:(node)=>{
            if(node.type == "CallExpression" 
                && node.callee.type == "MemberExpression"
                && node.arguments.length == 3){
                node.arguments.push( { type: 'Literal', value: '===', raw: '"==="' }) 
            }
        }
    });
}

//用本地安装的hermes引擎执行，hermes来自RN
function justDoIt(){

    shell.exec('hermes myjs.js', (err, stdout, stderr)=>{
        if(err){
            console.log('err',err);
        }
        if(stdout){
            console.log("stdout",stdout);
        }
        if(stderr){
            console.log("stderr",stderr);
        }
    })

}