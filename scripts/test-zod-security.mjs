import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {z}=require('zod');
test('oversized constrained collections reject before element validation',()=>{
 let reads=0;const value=z.string().superRefine(()=>{reads++;});
 for(const [schema,input] of [
  [z.array(value).max(4),Array(100000).fill('x')],
  [z.set(value).max(4),new Set(Array.from({length:10000},(_,i)=>String(i)))],
  [z.map(z.string(),value).max(4),new Map(Array.from({length:10000},(_,i)=>[String(i),'x']))],
 ]){
  const result=schema.safeParse(input);
  assert.equal(result.success,false);
  assert.equal(result.error.issues.length,1);
  assert.equal(result.error.issues[0].code,'too_big');
 }
 assert.equal(reads,0);
 assert.deepEqual(z.array(value).max(4).parse(['valid']),['valid']);
 assert.equal(reads,1);
});
test('OpenAI structured-output helper accepts the upgraded schema',()=>{
 const {zodResponseFormat}=require('openai/helpers/zod');
 const result=zodResponseFormat(z.object({name:z.string()}),'Person');
 assert.equal(result.json_schema.name,'Person');
 assert.equal(result.json_schema.schema.properties.name.type,'string');
 assert.equal(result.json_schema.schema.additionalProperties,false);
});
