'use babel';

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
      <code class="code java">{{{code}}}</code>
    </pre>
  </div>
  {{/list}}`;

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

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
        //hljs.initHighlightingOnLoad();
        // loadScript("./highlight.pack.js", function () {
        //     hljs.initHighlightingOnLoad();
        // })
        
        // load css
        // var element = document.createElement('link');
        // element.href = './styles/github-gist.css';
        // element.rel = 'stylesheet';
        // element.type = 'text/css';

        // Fill with data
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