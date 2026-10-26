// A pinned reading visit owns one snapshot across all of its paragraphs.
// The caller supplies camera, playback and context-specific operations.
export class ReadingSession {
  constructor({capture,pause=()=>{},release=()=>{},restore=()=>{},isCurrent=()=>true}={}){
    if(typeof capture!=='function')throw new TypeError('ReadingSession requires capture().');
    this.capture=capture;this.pause=pause;this.release=release;
    this.restore=restore;this.isCurrent=isCurrent;
    this.context=null;this._active=false;
  }
  get active(){return this._active;}
  begin(){
    if(this._active)return this.context;
    const context=this.capture();
    this.context=context;this._active=true;
    this.pause(context);
    return context;
  }
  finish({restore=false}={}){
    if(!this._active)return false;
    const context=this.context;
    // Clear ownership before callbacks: a resume hook may close inspection again.
    this.context=null;this._active=false;
    this.release(context);
    if(!restore||!this.isCurrent(context))return false;
    this.restore(context);
    return true;
  }
}
