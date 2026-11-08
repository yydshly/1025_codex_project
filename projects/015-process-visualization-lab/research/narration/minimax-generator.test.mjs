import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEnv,speechEndpoint,inspectWave,decodeResponse} from '../../scripts/generate-minimax-narration.mjs';

function pcm({silent=false,sampleRate=32000}={}){
 const samples=sampleRate*2, bytes=Buffer.alloc(44+samples*2);
 bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVE',8);bytes.write('fmt ',12);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(sampleRate,24);bytes.writeUInt32LE(sampleRate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(samples*2,40);
 if(!silent)for(let index=0;index<samples;index++)bytes.writeInt16LE(Math.round(8000*Math.sin(index*2*Math.PI*220/sampleRate)),44+index*2);
 return bytes;
}
test('configuration parser handles quoted values and comments without executing text',()=>{
 const parsed=parseEnv('\uFEFF# ignored\nexport DEMO_KEY = "test-only"\nDEMO_VOICE=Chinese (Mandarin)_Gentle_Senior # stock voice\nVALUE=\'$(literal)\'\n');
 assert.deepEqual(parsed,{DEMO_KEY:'test-only',DEMO_VOICE:'Chinese (Mandarin)_Gentle_Senior',VALUE:'$(literal)'});
});
test('credentials can only target approved HTTPS MiniMax endpoints',()=>{
 assert.equal(speechEndpoint('https://api.minimax.cn/v1').href,'https://api.minimax.cn/v1/t2a_v2');
 for(const invalid of ['http://api.minimax.cn','https://example.com/v1','https://api.minimax.cn.evil.invalid','https://user:pass@api.minimax.cn','https://api.minimax.cn/v1?redirect=example.com','https://api.minimax.cn:8443','https://api.minimax.cn/redirect'])assert.throws(()=>speechEndpoint(invalid));
});
test('WAV verification detects silence, corrupt RIFF lengths and incompatible audio',()=>{
 const bytes=pcm(),audio=inspectWave(bytes);
 assert.equal(audio.durationSeconds,2);assert.equal(audio.sampleRate,32000);assert.equal(audio.channels,1);assert.equal(audio.bits,16);assert.ok(audio.rms>5000);assert.ok(audio.peak>=7999);
 assert.throws(()=>inspectWave(pcm({silent:true})),/near-silent/);
 assert.throws(()=>inspectWave(bytes.subarray(0,bytes.length-1)),/RIFF length/);
 assert.throws(()=>inspectWave(pcm({sampleRate:16000})),/32-kHz/);
 const truncated=Buffer.from(bytes);truncated.writeUInt32LE(bytes.length,40);assert.throws(()=>inspectWave(truncated),/truncated/);
});
test('provider errors expose only numeric status and retry only explicit transient failures',()=>{
 for(const [code,retryable]of [[1002,true],[1039,false],[1004,false]]){
  try{decodeResponse({base_resp:{status_code:code,status_msg:'DO-NOT-EXPOSE'},debug:'DO-NOT-EXPOSE'});assert.fail('must throw');}catch(error){assert.equal(error.retryable,retryable);assert.equal(error.message,'MiniMax provider error '+code);}
 }
 assert.throws(()=>decodeResponse(null,401),{message:'MiniMax HTTP 401'});
 assert.throws(()=>decodeResponse({base_resp:{status_code:0},data:{status:1,audio:pcm().toString('hex')}}),/incomplete/);
 assert.throws(()=>decodeResponse({base_resp:{status_code:0},data:{status:2,audio:'invalid-hex'}}),/invalid audio/);
});
test('completed response preserves verified audio and only whitelisted usage metadata',()=>{
 const bytes=pcm(),decoded=decodeResponse({base_resp:{status_code:0},data:{status:2,audio:bytes.toString('hex')},trace_id:'trace_12345678',extra_info:{usage_characters:81,audio_length:2000,audio_sample_rate:32000,secret:'DO-NOT-EXPOSE'}});
 assert.deepEqual(decoded.bytes,bytes);assert.equal(decoded.audio.durationSeconds,2);
 assert.deepEqual(decoded.provider,{statusCode:0,completed:true,traceId:'trace_12345678',usage_characters:81,audio_length:2000,audio_sample_rate:32000});
});
