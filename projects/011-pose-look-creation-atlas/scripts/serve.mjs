import {fileURLToPath} from 'node:url';
import {loadLocalLibrary,defaultLibraryRoot} from './local-library.mjs';
import {createLocalServer} from './local-server.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.env.POSE_LOOK_PORT||8011);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid POSE_LOOK_PORT');
let library=null,libraryError=null;
try{library=await loadLocalLibrary(process.env.POSE_LOOK_LIBRARY||defaultLibraryRoot);console.log(`Mounted ${library.payload.images} original images / ${library.payload.groupCount} pose groups (read only).`);}
catch(error){libraryError='无法读取原图目录。请在启动前设置 POSE_LOOK_LIBRARY，指向包含 manifest.json 与 original-images 的备份目录。';console.warn(libraryError);console.warn(error.message);}
createLocalServer({root,library,libraryError}).listen(port,'127.0.0.1',()=>console.log(`Pose / Look: http://127.0.0.1:${port}/app/#gallery`));
