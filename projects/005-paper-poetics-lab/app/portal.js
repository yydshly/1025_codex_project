import './styles.css';
import {principles} from './data.js';
const $=selector=>document.querySelector(selector);
document.querySelectorAll('[data-principle]').forEach(button=>button.addEventListener('click',()=>{
  const item=principles[button.dataset.principle];
  document.querySelectorAll('[data-principle]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('#principle-title').textContent=item.title;
  $('#principle-copy').textContent=item.copy;
  $('#principle-example').textContent=item.example;
}));
