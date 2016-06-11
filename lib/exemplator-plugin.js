'use babel';

import ExemplatorPluginView from './exemplator-plugin-view';
import { CompositeDisposable } from 'atom';

console.log("test")

export default {

  exemplatorPluginView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.exemplatorPluginView = new ExemplatorPluginView(state.exemplatorPluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.exemplatorPluginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'exemplator-plugin:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.exemplatorPluginView.destroy();
  },

  serialize() {
    return {
      exemplatorPluginViewState: this.exemplatorPluginView.serialize()
    };
  },

  toggle() {
    console.log('ExemplatorPlugin was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  showExamples() {
      console.log('kljasdasgasg');
      return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
          );
  }
};

/*
var getFullClassName = function() {
    editor = atom.workspace.getActiveTextEditor();
    text = editor.getText();

    currentPosition = editor.getCursorBufferPosition();


    var row = 0;
    var col = 0;
    var index;
    // translate row and column into an index for text
    for (index = 0; index < text.length; index++)
    {
      if (text.chartAt(index) == '\n')
      {
        row++;
        col = 0;
      } else {
        col++;
      }

      if (row == currentPosition.row && col == currentPosition.column)
        break;
    }

    // is cursor on method or type/variable name?
    var currentSegmentStart;
    var currentSegmentEnd;

    for (var currentSegmentStart = index; currentSegmentStart >= 0; currentSegmentStart--)
    {
        if (text.chartAt(currentSegmentStart) == ' ')
          currentSegmentStart++;
          break;
    }

    enum Type {
      FUNCTION,
      TYPE,
      OTHER
    };

    var type;

    for (var currentSegmentEnd = index; currentSegmentEnd < text.length; currentSegmentEnd++)
    {
       var c = text.chartAt(currentSegmentEnd);

       switch (c)
       {
         case '(' : type = FUNCTION;
            break;
         case ' ' : currentSegmentEnd--;
            break;
       }
    }

    if (type != FUNCTION)
    {
         // type declaration if capitalized
         if (text.chartAt(currentSegmentStart) >= 'A' && text.chartAt(currentSegmentStart) <= 'Z')
             type = TYPE;
         else
             type = OTHER;
    }

    if (type == OTHER)
      return null;
    else if (type == TYPE)
    {
        lines = text.split('\n');
        // find package name
        for (var i = 0; i < lines.length; i++)
        {
            if (lines[i].startsWith('import'))
            {
                var fullPackage = fullPackageName(lines[i])
                if (fullPackage != null)
                  return fullPackage;
            }
        }
    }

    return null;
  }

  var fullPackageName = function(importLine, typeName)
  {
      // only return if it matches typeName
      var packageStart = importLine.indexOf(' ');
      var p = importLine.substr(packageStart);
      var comps = p.split('.');
      if (comps[comps.length-1] !== typeName)
           return null;
      else
           return p;
  }*/
