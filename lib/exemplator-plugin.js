'use babel';

import ExemplatorPluginView from './exemplator-plugin-view';
import { CompositeDisposable } from 'atom';

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
  }

  showExamples() {

      var className = getFullClassName();
      var methodName = getMethodName();


  }

  getFullClassName() {
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

        if (row == currentPosition.row && col = currentPosition.column)
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

      for (var currentSegmentEnd = index; currentSegmentEnd < text.length; currentSegmentEnd++)
      {
         var c = text.chartAt(currentSegmentEnd);

      }

      currentRange =

      editor.getTextInBufferRange([
        editor.getCursorBufferPosition(),
        [editor.getCursorBufferPosition().row, editor.getCursorBufferPosition().column + 10]
      ])
    }

};
