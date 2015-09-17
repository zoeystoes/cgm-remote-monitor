'use strict';

var _ = require('lodash');

var sandbox = require('./sandbox')();
var units = require('./units')();
var iob = require('./plugins/iob')();
var bwp = require('./plugins/boluswizardpreview')();
var delta = require('./plugins/delta')();

var DIRECTIONS = {
  NONE: 0
  , DoubleUp: 1
  , SingleUp: 2
  , FortyFiveUp: 3
  , Flat: 4
  , FortyFiveDown: 5
  , SingleDown: 6
  , DoubleDown: 7
  , 'NOT COMPUTABLE': 8
  , 'RATE OUT OF RANGE': 9
};

function directionToTrend (direction) {
  var trend = 8;
  if (direction in DIRECTIONS) {
    trend = DIRECTIONS[direction];
  }
  return trend;
}

function reverseAndSlice (entries, req) {
  var reversed = entries.slice(0);
  reversed.reverse();
  return reversed.slice(0, req.count);
}


function mapSGVs(req, sbx) {
  function scaleMgdlAPebbleLegacyHackThatWillNotGoAway (bg) {
    if (req.mmol) {
      return units.mgdlToMMOL(bg);
    } else {
      return bg.toString();
    }
  }

  var cal = sbx.lastEntry(sbx.data.cals);

  return _.map(reverseAndSlice(sbx.data.sgvs, req), function transformSGV(sgv) {
    var transformed = {
      sgv: scaleMgdlAPebbleLegacyHackThatWillNotGoAway(sgv.mgdl), trend: directionToTrend(sgv.direction), direction: sgv.direction, datetime: sgv.mills
    };

    if (req.rawbg && cal) {
      transformed.filtered = sgv.filtered;
      transformed.unfiltered = sgv.unfiltered;
      transformed.noise = sgv.noise;
    }

    return transformed;
  });

}

function addExtraData (first, req, sbx) {
  //for compatibility we're keeping battery and iob on the first bg, but they would be better somewhere else

  var data = sbx.data;

  function addDelta() {
    var prev = data.sgvs.length >= 2 ? data.sgvs[data.sgvs.length - 2] : null;
    var current = sbx.lastSGVEntry();

    //for legacy reasons we need to return a 0 for delta if it can't be calculated
    var deltaResult = delta.calc(prev, current, sbx);
    first.bgdelta = deltaResult && deltaResult.scaled || 0;
    if (req.mmol) {
      first.bgdelta = first.bgdelta.toFixed(1);
    }
  }

  function addBattery() {
    if (data.devicestatus && data.devicestatus.uploaderBattery && data.devicestatus.uploaderBattery >= 0) {
      first.battery = data.devicestatus.uploaderBattery.toString();
    }
  }

  function addIOB() {
    if (req.iob) {
      var iobResult = iob.calcTotal(data.treatments, data.profile, Date.now());
      if (iobResult) {
        first.iob = iobResult.display;
      }
      
      sbx.properties.iob = iobResult;
      var bwpResult = bwp.calc(sbx);

      if (bwpResult) {
        first.bwp = bwpResult.bolusEstimateDisplay;
        first.bwpo = bwpResult.outcomeDisplay;
      }
      
    }
  }

  addDelta();
  addBattery();
  addIOB();
}

function prepareBGs (req, sbx) {
  if (sbx.data.sgvs.length === 0) {
    return [];
  }

  var bgs = mapSGVs(req, sbx);
  addExtraData(bgs[0], req, sbx);

  return bgs;
}

function prepareCals (req, sbx) {
  var data = sbx.data;

  if (req.rawbg && data.cals && data.cals.length > 0) {
    return _.map(reverseAndSlice(data.cals, req), function transformCal (cal) {
      return _.pick(cal, ['slope', 'intercept', 'scale']);
    });
  } else {
    return [];
  }
}

function prepareSandbox (req) {
  var clonedEnv = _.cloneDeep(req.env);
  if (req.mmol) {
    clonedEnv.settings.units = 'mmol';
  }
  return sandbox.serverInit(clonedEnv, req.ctx);
}

function pebble (req, res) {
  var sbx = prepareSandbox(req);

  res.setHeader('content-type', 'application/json');
  res.write(JSON.stringify({
    status: [ {now: Date.now()} ]
    , bgs: prepareBGs(req, sbx)
    , cals: prepareCals(req, sbx)
  }));

  res.end( );
}

function configure (env, ctx) {
  function middle (req, res, next) {
    req.env = env;
    req.ctx = ctx;
    req.rawbg = env.settings.isEnabled('rawbg');
    req.iob = env.settings.isEnabled('iob');
    req.mmol = (req.query.units || env.DISPLAY_UNITS) === 'mmol';
    req.count = parseInt(req.query.count) || 1;

    next( );
  }
  return [middle, pebble];
}

configure.pebble = pebble;

module.exports = configure;
