import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEnv,speechEndpoint,decodeResponse,inspectWave} from './generate-minimax-voice.mjs';

function wave(){
  const bytes=Buffer.alloc(44+6400);
  bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);
  bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(32000,24);bytes.writeUInt32LE(64000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
  bytes.write('data',36);bytes.writeUInt32LE(6400,40);
  return bytes;
}
test('environment values stay literal and official API origins normalize safely',()=>{
  const env=parseEnv('\uFEFF# example\nexport MINIMAX_API_KEY="literal-$()-token"\nMINIMAX_API_BASE=https://api.minimax.cn # official\n');
  assert.equal(env.MINIMAX_API_KEY,'literal-$()-token');
  assert.equal(speechEndpoint(env.MINIMAX_API_BASE).href,'https://api.minimax.cn/v1/t2a_v2');
  assert.equal(speechEndpoint('https://api.minimax.cn/v1/').href,'https://api.minimax.cn/v1/t2a_v2');
  for(const bad of ['http://api.minimax.cn','https://api.minimax.cn.evil.test','https://secret@api.minimax.cn','https://api.minimax.cn?key=secret'])assert.throws(()=>speechEndpoint(bad));
});
test('provider errors and incomplete responses never become audio or echo response content',()=>{
  const failure={base_resp:{status_code:1004,status_msg:'private-response-content'},data:{status:2,audio:wave().toString('hex')}};
  assert.throws(()=>decodeResponse(failure),error=>error.message==='MiniMax provider error 1004'&&!error.message.includes('private-response-content'));
  assert.throws(()=>decodeResponse({...failure,base_resp:{status_code:0},data:{status:1,audio:'aabb'}}));
  assert.throws(()=>decodeResponse({...failure,base_resp:{status_code:0},data:{status:2,audio:'not-hex'}}));
  assert.throws(()=>decodeResponse(failure,401),/HTTP 401/);
});
test('successful hex audio is decoded and measured; truncated WAV is rejected',()=>{
  const bytes=wave(),result=decodeResponse({base_resp:{status_code:0},data:{status:2,audio:bytes.toString('hex')}});
  assert.deepEqual(result.bytes,bytes);
  assert.equal(result.audio.sampleRate,32000);assert.equal(result.audio.channels,1);
  assert.equal(result.audio.durationSeconds,.1);
  assert.throws(()=>inspectWave(bytes.subarray(0,bytes.length-1)),/truncated/);
  const malformed=Buffer.from(bytes);malformed.writeUInt16LE(0,22);
  assert.throws(()=>inspectWave(malformed),/invalid or unsupported/);
  const wrongRate=Buffer.from(bytes);wrongRate.writeUInt32LE(16000,24);wrongRate.writeUInt32LE(32000,28);
  assert.throws(()=>decodeResponse({base_resp:{status_code:0},data:{status:2,audio:wrongRate.toString('hex')}}),/requested sample rate/);
});
