import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,readdirSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(import.meta.url);
function installed(name){
 const paths=[];const lock=join(root,'package-lock.json');
 if(existsSync(lock))for(const path of Object.keys(JSON.parse(readFileSync(lock)).packages??{})){
  if(path===`node_modules/${name}`||path.endsWith(`/node_modules/${name}`))paths.push(join(root,path));
 }
 const store=join(root,'node_modules/.pnpm');
 if(existsSync(store))for(const nameAndVersion of readdirSync(store)){
  if(nameAndVersion.startsWith(name+'@'))paths.push(join(store,nameAndVersion,'node_modules',name));
 }
 return [...new Set(paths.filter(existsSync).map(path=>realpathSync(path)))];
}
const reviewedLegacy={
 '3.1.5':'746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d',
 '5.1.9':'1339bca8b70e33847860daa8fc3ccfa62487e143670da01a3b718d40d5fd424f',
};
const matchers=installed('minimatch');
test('the installed dependency tree contains the matchers under review',()=>assert.ok(matchers.length));
for(const path of matchers){
 const {version}=JSON.parse(readFileSync(join(path,'package.json')));
 test(`minimatch ${version}: source safety and matching compatibility`,()=>{
  if(reviewedLegacy[version]){
   const bytes=readFileSync(join(path,'minimatch.js'));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),reviewedLegacy[version]);
   assert.equal(bytes.includes(Buffer.from('firstPhasePreProcess')),false);
   const legacy=require(path);
   assert.equal(typeof legacy,'function');
   assert.equal(legacy('app/page.tsx','**/*.{ts,tsx}'),true);
   assert.equal(legacy.makeRe('*.js').test('example.js'),true);
  }else{
   const [major,minor,patch]=version.split('.').map(Number);
   assert.ok(major>11||(major===11&&(minor>0||patch>=1)),`Unreviewed matcher ${version}`);
   const result=spawnSync(process.execPath,['--max-old-space-size=128','-e',`
    const assert=require('node:assert/strict');const {Minimatch}=require(process.argv[1]);
    const pattern=Array(30).fill('**/../a/b').join('/');
    assert.equal(new Minimatch(pattern,{optimizationLevel:2,braceExpandMax:64}).set.length,64);
    const ordinary=new Minimatch('{x,*}/{0..999}',{optimizationLevel:2});
    assert.equal(ordinary.set.length,2000);assert.equal(ordinary.match('y/999'),true);
   `,path],{cwd:root,encoding:'utf8',timeout:5000});
   assert.equal(result.error,undefined,result.error?.message);assert.equal(result.status,0,result.stderr);
  }
 });
}
for(const path of installed('glob')){
 const {version}=JSON.parse(readFileSync(join(path,'package.json')));
 if(Number(version.split('.')[0])<9)continue;
 test(`glob ${version}: pre-aborted traversal performs no filesystem reads`,async()=>{
  const [major,minor,patch]=version.split('.').map(Number);
  assert.ok(major>14||(major===14&&(minor>0||patch>=2)),`Unpatched glob ${version}`);
  const glob=require(path);const fs=require('node:fs');let reads=0;
  const controller=new AbortController();controller.abort(new Error('audit-probe-abort'));
  const filesystem={...fs,readdir(...args){reads++;return fs.readdir(...args);},readdirSync(...args){reads++;return fs.readdirSync(...args);}};
  await assert.rejects(glob.glob('**/*',{cwd:root,signal:controller.signal,fs:filesystem}),/audit-probe-abort/);
  await new Promise(resolve=>setTimeout(resolve,25));assert.equal(reads,0);
 });
}
