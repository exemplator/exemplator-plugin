'use babel';

import {allowUnsafeNewFunction} from 'loophole';
import hljs from 'highlight.js';
import $ from 'jquery';


let Handlebars;
allowUnsafeNewFunction(() => {
    Handlebars = require('handlebars');
});

var tpl = `
  {{#list examples}}
  <div>
    <heading>
      <a href="{{userurl}}">Repo</a> |
      <a href="{{rawUrl}}">Datei</a>
    </heading>
    <pre class="code" style="display: block">
      <code>
        <span class="codePart java">{{{codeTop}}}</span>
        <span class="codePart java highlightedCode">{{{highlightedCode}}}</span>
        <span class="codePart java">{{{codeBottom}}}</span>
      </code>
    </pre>
  </div>
  {{/list}}`;

export default class ExemplatorPluginView {

    constructor(serializedState) {

        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('Exemplator');

        // Create message element
        const message = document.createElement('div');
        message.textContent = 'The ExemplatorPlugin package is Alive!';
        message.classList.add('message');
    }

    setData(data) {
        allowUnsafeNewFunction(() => {
            Handlebars.registerHelper('list', function (items, options) {
                console.log(items);
                var out = "<ul>";

                for (var i = 0, l = items.length; i < l; i++) {
                    out += "<li>" + options.fn(items[i]) + "</li>";
                }

                return out + "</ul>";
            });
            temp = Handlebars.compile(tpl);
            allowUnsafeNewFunction(() => {
                test = temp(data);
            });
        })

        this.element.innerHTML = test;

        $('pre code').each(function (i, block) {
            if (i < 10) {
                hljs.highlightBlock(block);
            }
        });
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