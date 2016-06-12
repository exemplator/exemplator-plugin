'use babel';
// import tpl from './code-example.html';

import {allowUnsafeNewFunction} from 'loophole';
import * as Highlights from 'highlight.js';


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
    <pre style="display: block">
      <code class="code html">
        {{{code}}}
      </code>
    </pre>
  </div>
  {{/list}}`;

export default class ExemplatorPluginView {

    constructor(serializedState) {

        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('Exemplator');

        Highlights.initHighlightingOnLoad();

        // Create message element
        const message = document.createElement('div');
        message.textContent = 'The ExemplatorPlugin package is Alive!';
        message.classList.add('message');

        var emptyData = {
            examples: [
                {
                    user: '',
                    score: '',
                    code: ''
                }, {
                    user: '',
                    score: '',
                    code: ''
                }
            ]
        };


        this.setData(emptyData);
    }
    
    setData(data) {
        allowUnsafeNewFunction(() => {
            Handlebars.registerHelper('list', function (items, options) {
                var out = "<ul>";

                for (var i = 0, l = items.length; i < l; i++) {
                    out = out + "<li>" + options.fn(items[i]) + "</li>";
                }

                return out + "</ul>";
            });
            temp = Handlebars.compile(tpl);
            allowUnsafeNewFunction(() => {
                test = temp(data);
            });
        })

        this.element.innerHTML = test;
    }
    
    // Returns an object that can be retrieved when package is activated
    serialize() {
    }

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

}