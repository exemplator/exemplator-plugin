'use babel';
// import tpl from './code-example.html';

import {allowUnsafeNewFunction} from 'loophole';

let Handlebars;
allowUnsafeNewFunction(() => {
  Handlebars = require('handlebars');
});

var tpl = `
  <div>
    <p><span>{{user}}</span></p>
    <pre>
      <code>
        {{code}}
      </code>
    </pre>
  </div>
`;

export default class ExemplatorPluginView {

  constructor(serializedState) {
    // Create root element
    console.log("test");
    this.element = document.createElement('div');
    this.element.classList.add('exemplator-plugin');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The ExemplatorPlugin package is Alive!';
    message.classList.add('message');
    
    allowUnsafeNewFunction(() => {
      temp = Handlebars.compile(tpl);
      var data = {
        user: 'test',
        code: 'abc',
        time: new Date
      };
      allowUnsafeNewFunction(() => {
        test = temp(data);
      });
    })

    console.log("test",this.element,test)

    this.element.innerHTML = test;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}