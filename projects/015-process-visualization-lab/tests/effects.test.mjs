import test from 'node:test';
import assert from 'node:assert/strict';
import {compute} from '../app/models.js';
import {createTyphoonLayer} from '../app/effect-typhoon.js';

test('台风在减弱段保持同向旋转，重复同一时刻不改变云层和风迹',()=>{
 const effect=createTyphoonLayer(2);
 const cloud=effect.group.getObjectByName('cloud-shell-0');
 const trails=effect.group.getObjectByName('counterclockwise-wind-trails');
 for(const wind of [25,46,70]){
  let previous=-Infinity;
  for(let i=0;i<=100;i++){
   const progress=i/100,data=compute('typhoon',progress,{wind,radius:100});
   effect.update(data,progress);
   const phase=cloud.material.uniforms.uPhase.value;
   assert(phase>previous,'减弱阶段不能使旋转相位倒退');previous=phase;
   const positions=Array.from(trails.geometry.attributes.position.array);
   effect.update(data,progress);
   assert.equal(cloud.material.uniforms.uPhase.value,phase);
   assert.deepEqual(Array.from(trails.geometry.attributes.position.array),positions);
  }
 }
});
