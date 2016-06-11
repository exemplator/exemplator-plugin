'use babel';
// import tpl from './code-example.html';

import {allowUnsafeNewFunction} from 'loophole';

let Handlebars;
allowUnsafeNewFunction(() => {
  Handlebars = require('handlebars');
});

var tpl = `
  {{#list examples}}
  <div>
    <heading>
      <h2 class="user">{{user}}</h2>
      <span class="score">{{score}}</span>
    </heading>
    <pre>
      <code>
        {{{code}}}
      </code>
    </pre>
  </div>
  {{/list}}
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
    
    var data = {
      examples: [
      {
        user: 'Nico',
        score: '283.23',
        code: `package com.kirkk.hello;
              import ratpack.server.RatpackServer;

              public class HelloRatpack {
               public static void main(String... args) throws Exception {
                 RatpackServer.start(server -> server  <- starts here
                   .handlers(chain -> chain
                     .get(ctx -> ctx.render("Hello World!"))
                     .get(":name", ctx -> ctx.render("Hello " + ctx.getPathTokens().get("name") + "!"))     
                   )
                 );
               }
              }`
      },{
        user: 'Nico',
        score: '22.23',
        code: '${abc}[123]'
      }
      ]
    };

    
    allowUnsafeNewFunction(() => {
      Handlebars.registerHelper('list', function(items, options) {
        var out = "<ul>";

        for(var i=0, l=items.length; i<l; i++) {
          out = out + "<li>" + options.fn(items[i]) + "</li>";
        }

        return out + "</ul>";
      });
      temp = Handlebars.compile(tpl);
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