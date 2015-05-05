/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals () {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="app"></div>';
  // locale file requires Blockly as a global
  try {
    window.Blockly = require('blockly');
    // TODO (brent) removed top two lines from this file. check with tanya
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }


  // TODO (brent) - do we need getBBox here anymore?
}
module.exports = setGlobals;
