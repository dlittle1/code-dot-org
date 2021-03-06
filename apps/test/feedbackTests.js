var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales();

var testCollectionUtils = require('./util/testCollectionUtils');
var sharedFunctionalBlocks = require('@cdo/apps/sharedFunctionalBlocks');

/**
 * Loads blocks into the workspace, then calls
 * checkForEmptyContainerBlockFailure_ and validates
 * that the result matches the expected result.
 */
describe("checkForEmptyContainerBlockFailure_", function () {
  var studioApp;
  var TestResults;

  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();
    TestResults = studioApp.TestResults;
  });

  var checkResultForBlocks = function (args) {
    studioApp.loadBlocks(args.blockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(
        Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(!args.blockXml || loaded, "either we didnt have  input xml" +
        "or we did, and we loaded something");

    assert.equal(args.result,
        studioApp.feedback_.checkForEmptyContainerBlockFailure_());
  };

  it("returns ALL_PASS when no blocks are present", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: ''
    });
  });

  it ("returns ALL_PASS when no container blocks are present", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml><block type="text_print"></block></xml>'
    });
  });

  it ("returns EMPTY_BLOCK_FAIL when an empty contianer block is present", function () {
    checkResultForBlocks({
      result: TestResults.EMPTY_BLOCK_FAIL,
      blockXml: '<xml>' +
                  '<block type="controls_repeat">' +
                    '<title name="TIMES">4</title>' +
                  '</block>' +
                '</xml>'
    });
  });

  it ("returns ALL_PASS when all container blocks are filled", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml>' +
                  '<block type="controls_repeat">' +
                    '<title name="TIMES">4</title>' +
                    '<statement name="DO">' +
                      '<block type="text_print"></block>' +
                    '</statement>' +
                  '</block>' +
                '</xml>'
    });
  });

  it ("returns EMPTY_FUNCTION_BLOCK_FAIL when an empty function block is present", function () {
    checkResultForBlocks({
      result: TestResults.EMPTY_FUNCTION_BLOCK_FAIL,
      blockXml: '<xml>' +
                  '<block type="procedures_defnoreturn">' +
                    '<mutation/>' +
                    '<title name="NAME">do something</title>' +
                  '</block>' +
                '</xml>'
    });
  });

  it ("returns ALL_PASS when all function blocks are filled", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml>' +
                  '<block type="procedures_defnoreturn">' +
                    '<mutation/>' +
                    '<title name="NAME">do something</title>' +
                    '<statement name="STACK">' +
                      '<block type="text_print"></block>' +
                    '</statement>' +
                  '</block>' +
                '</xml>'
    });
  });
});

/**
 * Loads blocks into the workspace, then calls
 * checkForEmptyContainerBlockFailure_ and validates
 * that the result matches the expected result.
 */
describe("throwOnInvalidExampleBlocks", function () {
  var studioApp;

  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();
    sharedFunctionalBlocks.install(Blockly, Blockly.JavaScript, null);
  });

  it("throws on unfilled result", function () {
    studioApp.loadBlocks('<xml>' +
        '  <block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="aqua-star">' +
        '        <arg name="radius" type="Number"></arg>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '    <block type="functional_plus" inline="false"></block>' +
        '  </functional_input>' +
        ' </block>' +
        '</xml>');
    assert.throws(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error, "Result has unfilled inputs");
  });

  it("throws on unfilled call", function () {
    studioApp.loadBlocks('<xml>' +
        '<block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="aqua-star">' +
        '        <arg name="radius" type="Number"></arg>' +
        '      </mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '    <block type="functional_plus" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>');
    assert.throws(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error, "Call has unfilled inputs");
  });

  it("doesn't throw on filled call and result blocks", function () {
    studioApp.loadBlocks('<xml>' +
        '  <block type="functional_example" inline="false">' +
        '    <functional_input name="ACTUAL">' +
        '      <block type="functional_call" inline="false">' +
        '        <mutation name="aqua-star">' +
        '          <arg name="radius" type="Number"></arg>' +
        '        </mutation>' +
        '        <functional_input name="ARG0">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '    <functional_input name="EXPECTED">' +
        '      <block type="functional_plus" inline="false">' +
        '        <functional_input name="ARG1">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '        <functional_input name="ARG2">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '  </block>' +
        '</xml>');
    assert.doesNotThrow(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error);
  });
});

describe("getUserBlocks_", function () {
  var studioApp;

  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();
  });

  function validateNumUserBlocks(blockXml, expectedNum) {
    studioApp.loadBlocks(blockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(loaded, "we didn't correctly load our test blocks");

    var userBlocks = studioApp.feedback_.getUserBlocks_();
    assert.equal(userBlocks.length, expectedNum);
  }

  it("usually ignores noneditable blocks", function () {
    var testBlockXml = [
      '<xml>',
      '<block editable="false" type="text_print"></block>',
      '<block editable="false" type="text"><title name="TEXT">TextContent</title></block>',
      '<block editable="false" type="math_number"><title name="NUM">10</title></block>',
      '</xml>'
    ];

    validateNumUserBlocks(testBlockXml.join(''), 0);
  });

  it("considers noneditable blocks when Blockly.readOnly === true", function () {
    var testBlockXml = [
      '<xml>',
      '<block editable="false" type="text_print"></block>',
      '<block editable="false" type="text"><title name="TEXT">TextContent</title></block>',
      '<block editable="false" type="math_number"><title name="NUM">10</title></block>',
      '</xml>'
    ];

    var readOnly = Blockly.readOnly;
    Blockly.readOnly = true;
    validateNumUserBlocks(testBlockXml.join(''), 3);
    Blockly.readOnly = readOnly;
  });
});


/**
 * Loads options.startBlocks into the workspace, then calls
 * getMissingBlocks and validates that the result matches the
 * options.expectedResult
 */
describe("getMissingBlocks_ tests", function () {
  var studioApp;

  /**
   * getMissingBlocks_ will return us an array of blocks.  We can't
   * validate these using a simple assert.deepEqual because some blocks
   * contain a members generated functions.  These functions are the
   * same in terms of contents, but do not share the same space in
   * memory, and thus will report as not equal when we want them to
   * report as equal.  This method exists to validate equality in a way
   * that treats those functions as equal.
   */
  function validateMissingBlocks(result, expectedResult) {
    var block, expectedBlock;

    if (result.length !== expectedResult.length) {
      // if we get here, we'll always fail, but this has the benefit of showing
      // us the diff in the failure
      assert.deepEqual(result, expectedResult);
    }

    // Convert a function to a string and remove whitespace
    function functionText(f) {
      return f.toString().replace(/\s/gm,"");
    }

    function validateKey (key) {
      assert.equal(typeof(block[key]), typeof(expectedBlock[key]),
        "members are of same type");
      if (typeof(block[key]) === "function") {
        // compare contents of functions rather than whether they are the same
        // object in memory
        assert.equal(functionText(block[key]), functionText(expectedBlock[key]));
      } else {
        assert.deepEqual(block[key], expectedBlock[key],
          "values for '" + key + "' are equal");
      }
    }

    for (var i = 0; i < result.length; i++) {
      block = result[i];
      expectedBlock = expectedResult[i];
      assert.deepEqual(Object.keys(block), Object.keys(expectedBlock),
        "Blocks have same keys");
      Object.keys(block).forEach(validateKey);
    }
  }

  function validateBlocks(options) {
    assert.notEqual(options.requiredBlocks, undefined);
    assert.notEqual(options.numToFlag, undefined);
    assert.notEqual(options.userBlockXml, undefined);
    assert.notEqual(options.expectedResult, undefined);

    studioApp.loadBlocks(options.userBlockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(!options.userBlockXml || loaded, "either we didnt have  input xml" +
      "or we did, and we loaded something");

    var missing = studioApp.feedback_.getMissingBlocks_(
        options.requiredBlocks, options.numToFlag);
    validateMissingBlocks(missing.blocksToDisplay, options.expectedResult);
  }

  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();
  });

  // missing multiple blocks

  describe("required blocks look for existence of string in code", function () {
    var testBlocks = [
      {
        'test': 'window.alert',
        'type': 'text_print'
      },
      {
        'test': 'TextContent',
        'type': 'text'
      },
      {
        'test': '10;',
        'type': 'math_number'
      }
    ];

    var testBlockXml = [
      '<block type="text_print"></block>',
      '<block type="text"><title name="TEXT">TextContent</title></block>',
      '<block type="math_number"><title name="NUM">10</title></block>'
    ];
    runTests(testBlocks, testBlockXml);
  });

  describe("required blocks use function to check for existence", function () {
    var testBlocks = [
      {
        'test': function (block) {
          return block.type === 'text_print';
        },
        'type': 'text_print'
      },
      {
        'test': function (block) {
          return block.type === 'text';
        },
        'type': 'text'
      },
      {
        'test': function (block) {
          return block.type === 'math_number';
        },
        'type': 'math_number'
      }
    ];

    var testBlockXml = [
      '<block type="text_print"></block>',
      '<block type="text"><title name="TEXT">TextContent</title></block>',
      '<block type="math_number"><title name="NUM">10</title></block>'
    ];

    runTests(testBlocks, testBlockXml);
  });

  function runTests(testBlocks, testBlockXml) {
    it ("expect 1 block, empty workspace, told block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[0]],
      });
    });

    it ("expect 1 block, wrong block present, told block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[1] + '</xml>',
        expectedResult: [testBlocks[0]]
      });
    });

    it ("expect 1 block, block is there, told no blocks missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[0] + '</xml>',
        expectedResult: []
      });
    });

    it ("expect 2 blocks, numToFlag = 1, both missing, told first block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[0]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, both missing, told both missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "",
        expectedResult: [testBlocks[0], testBlocks[1]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, first block missing, told second block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "<xml>" + testBlockXml[0] + '</xml>',
        expectedResult: [testBlocks[1]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, second block missing, told first block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "<xml>" + testBlockXml[0] + testBlockXml[1] + '</xml>',
        expectedResult: [],
        assertMessage: "no blocks missing"
      });
    });

    // todo - maybe also do a combo of both a single a double missing

    it ("expect 1 of 2 blocks, empty workspace, told of both missing blocks", function () {
      // empty workspace
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[1]]
      });
    });

    it ("expect 1 of 2 blocks, first block there, told none missing", function () {
      // should work with either block
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[1] + "</xml>",
        expectedResult: []
      });
    });

    it ("expect 1 of 2 blocks, second block there, told none missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[2] + "</xml>",
        expectedResult: []
      });
    });
  }

  // Hack to compile files into browserify. Don't call this function!
  function ಠ_ಠ() {
    require('@cdo/apps/maze/blocks');
    require('@cdo/apps/flappy/blocks');
    require('@cdo/apps/turtle/blocks');
    require('@cdo/apps/eval/blocks');
    require('@cdo/apps/studio/blocks');
    require('@cdo/apps/calc/blocks');
    require('@cdo/apps/bounce/blocks');
    require('@cdo/apps/applab/blocks');

    require('@cdo/apps/maze/skins');
    require('@cdo/apps/flappy/skins');
    require('@cdo/apps/turtle/skins');
    require('@cdo/apps/studio/skins');
    require('@cdo/apps/bounce/skins');
    require('@cdo/apps/applab/skins');
  }

  function validateMissingBlocksFromLevelTest(testCollection, testData, dataItem) {
    var level = testCollectionUtils.getLevelFromCollection(testCollection,
      testData, dataItem);
    assert(global.Blockly, "Blockly is in global namespace");

    var skinForTests;
    if (testCollection.skinId) {
      var appSkins = require('@cdo/apps/' + testCollection.app + '/skins');
      skinForTests = appSkins.load(studioApp.assetUrl, testCollection.skinId);
    } else {
      skinForTests = {
        assetUrl: function (str) {
          return str;
        }
      };
    }

    var blockInstallOptions = { skin: skinForTests, isK1: false };
    var blocksCommon = require('@cdo/apps/blocksCommon');
    blocksCommon.install(Blockly, blockInstallOptions);
    var blocks = require('@cdo/apps/' + testCollection.app + '/blocks');
    assert(blocks);
    blocks.install(Blockly, blockInstallOptions);
    validateBlocks({
      requiredBlocks: level.requiredBlocks,
      numToFlag: 1,
      userBlockXml: testData.xml,
      expectedResult: testData.missingBlocks,
    });
  }

  describe("required blocks for specific levels", function () {
    var collections = testCollectionUtils.getCollections();
    collections.forEach(function (item) {
      var testCollection = item.data;
      var app = testCollection.app;

      testCollection.tests.forEach(function (testData, index) {
        testUtils.setupLocale(app);
        var dataItem = require('./util/data')(app);

        if (testData.missingBlocks) {
          it('MissingBlocks: ' + testData.description, function () {
            validateMissingBlocksFromLevelTest(testCollection, testData, dataItem);
          });
        }
      });
    });
  });
});
