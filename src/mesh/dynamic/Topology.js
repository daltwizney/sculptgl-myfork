define([
  'mesh/dynamic/Subdivision',
  'mesh/dynamic/Decimation'
], function (Subdivision, Decimation) {

  'use strict';

  var Topology = function (mesh) {
    this.mesh_ = mesh;
    this.subdivision_ = new Subdivision(mesh);
    this.decimation_ = new Decimation(mesh);
  };

  Topology.subFactor = 75; // subdivision factor
  Topology.decFactor = 50; // decimation factor

  Topology.prototype = {
    getSubdivisionFactor: function () {
      return Topology.subFactor * 0.01;
    },
    getDecimationFactor: function () {
      return Topology.decFactor * 0.01;
    },
    subdivision: function (iTris, center, radius2, detail2, states) {
      return this.subdivision_.subdivision(iTris, center, radius2, detail2, states);
    },
    decimation: function (iTris, center, radius2, detail2, states) {
      return this.decimation_.decimation(iTris, center, radius2, detail2, states);
    }
  };

  return Topology;
});