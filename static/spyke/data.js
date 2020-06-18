/**
Data for use in Spyke
---------------------
*/


/**
UI constants
------------
These are constants used for general UI and aesthetic components
*/

const colorDict = {
        purple:  '#b10dc9',
        orange:  '#ff851b',
        navy:    '#001f3f',
        olive:   '#3d9970',
        yellow:  '#ffdc00',
        blue:    '#0074d9',
        silver:  '#dddddd',
        red:     '#ff4136',
        aqua:    '#7fdbff',
        fuchsia: '#f012be',
        lime:    '#01ff70',
        maroon:  '#85144b',
        teal:    '#39cccc',
        green:   '#2ecc40',
        gray:    '#aaaaaa',
        white:   '#ffffff',
        black:   '#111111',     
};

const colors = Object.values(colorDict);

/**
Label Data
----------
Data for providing helpful additional information about parameters.
E.g. labels, help text, units
*/

const chartKey = {
    'v': {'label': "Voltage",
          'ylab': "Voltage (mV)",
          'units': "mV"},
    'ina': {'label': "<i class='fas fa-bolt'></i> Na<sup>+</sup>",
          'ylab': "Sodium Current (nA)",
          'units': "nA"},
    'ik': {'label': "<i class='fas fa-bolt'></i> K<sup>+</sup>",
          'ylab': "Potassium Current (nA)",
          'units': "nA"},
    'nai': {'label': "<i class='fas fa-flask'></i> Na<sup>+</sup>",
          'ylab': "Sodium Concentration (milimolar)",
          'units': "mM"},
    'ki': {'label': "<i class='fas fa-flask'></i> K<sup>+</sup>",
          'ylab': "Potassium Concentration (milimolar)",
          'units': "mM"},
    'cai': {'label': "<i class='fas fa-flask'></i> Ca<sup>2+</sup>",
          'ylab': "Calcium Concentration (milimolar)",
          'units': "mM"},
    'ica': {'label': "<i class='fas fa-bolt'></i> Ca<sup>2+</sup>",
          'ylab': "Calcium Current (nA)",
          'units': "nA"},
    'amp': {'label': "Amplitude",
          'ylab': "Amplitude (nA)",
          'units': "nA"},
    'spikes': {'label': "Spikes",
          'ylab': "Action potentials",
          'units': ""},
};

const geometryLabels = 
    [
        {'label': 'Length',
         'helptext': 'Microns',
         'attribute': 'L'},
         {'label': 'Diameter',
         'helptext': 'Microns',
         'attribute': 'diam'}
    ];

const synapseLabels = {
    "AMPA": {
        "label": "AMPA",
        "con_type": "pointer",
         "params": [
            {'label': 'Threshold (mV)',
             'helptext': 'Voltage threshold for AMPA release',
             'attribute': 'Prethresh',
             'value': 0},
            {'label': 'Max Conductance (uS)',
             'helptext': 'Maximum conductance',
             'attribute': 'gmax',
             'value': 0.1}
             ]
        },
    "GABA": {
        "label": "GABA-A",
        "con_type": "pointer",
         "params": [
            {'label': 'Threshold (mV)',
             'helptext': 'Voltage threshold for GABA release',
             'attribute': 'Prethresh',
             'value': 0},
            {'label': 'Max Conductance (uS)',
             'helptext': 'Maximum conductance',
             'attribute': 'gmax',
             'value': 0.1}
             ]
        },
    "GABAB1": {
        "label": "GABA-B",
        "con_type": "pointer",
         "params": [
            {'label': 'Threshold (mV)',
             'helptext': 'Voltage threshold for GABA release',
             'attribute': 'Prethresh',
             'value': 0},
            {'label': 'Max Conductance (uS)',
             'helptext': 'Maximum conductance',
             'attribute': 'gmax',
             'value': 0.1}
             ]
        },
    "NMDA": {
        "label": "NMDA",
        "con_type": "pointer",
         "params": [
            {'label': 'Threshold (mV)',
             'helptext': 'Voltage threshold for NMDA release',
             'attribute': 'Prethresh',
             'value': 0},
            {'label': 'Max Conductance (uS)',
             'helptext': 'Maximum conductance',
             'attribute': 'gmax',
             'value': 0.1}
             ]
        },
    "ExpSyn": {
         "label": "Exponential",
         "con_type": "netcon",
         "params": [
            {'label': 'Tau (ms)',
             'helptext': 'Decay time constant of synapse',
             'attribute': 'tau',
             'value': 2},
            {'label': 'Reversal potential (mV)',
             'helptext': 'Reversal potential of synapse',
             'attribute': 'e',
             'value': 0}
             ]
        }

    };

function newSynapse(name) {
    let out = {
        "name": name,
        "con_type": synapseLabels[name].con_type,
        params: {}
    };
    let labs = synapseLabels[name];
    for (let param of labs.params) {
        out.params[param.attribute] = param.value;
    }
    return out;
}

const connectionLabels = 
    [
        {'label': 'Delay (ms)',
         'helptext': 'Time between threshold crossing and event delivery',
         'attribute': 'delay'},
         {'label': 'Weight',
         'helptext': 'Weight delivered to target',
         'attribute': 'weight'},
         {'label': 'Threshold (mV)',
         'helptext': 'Voltage at which event triggered',
         'attribute': 'threshold'}
         
    ];

const biophysicsLabels = 
    [
        {'label': 'Axial resistance',
         'helptext': 'Ohm * cm',
         'attribute': 'Ra'},
         {'label': 'Membrane capacitance',
         'helptext': 'Micro Farads / cm<sup>2</sup></small>',
         'attribute': 'cm'}
    ];

const simulationLabels = 
    [
            {'label': 'Time (ms)',
             'helptext': 'Time for simulation to run',
             'attribute': 'time'},
             {'label': 'Membrane Potential (mV)',
             'helptext': 'Initial voltage of membranes',
             'attribute': 'potential'},
             {'label': 'Temperature (C)',
             'helptext': 'Temperature of environment',
             'attribute': 'celsius'}
    ];

const optionLabels = 
    {
        geometry: geometryLabels,
        biophysics: biophysicsLabels,
        connections: connectionLabels,
        simulation: simulationLabels,
        synapse: synapseLabels
    };

const menus = {
            nrn: 
                [
                    {'label':'Edit',
                     func: function(){
                        return app.editNeuron;
                        }
                    },
                    {'label':'Duplicate',
                    func: function(){
                        return app.duplicateNeuron;
                        }
                    },
                    {'label':'Delete',
                     func: function(){
                        return app.removeNeuron;
                        }
                    },

                ]
    };

function stimuli() {
    let data = [
        {"name": "IClamp",
         "stim_type": "IClamp",
         "title": "Current Clamp",
         "neuron": 1,
         "section": "",
         "loc": 0.5,
         "parameters": 
            [
                {"name": "dur",
                 "title": "Duration (ms)",
                 "help": "Duration of stimulus",
                 "value": 5,
                 "step": 1},

                 {"name": "delay",
                 "title": "Delay (ms)",
                 "help": "Time before stimulus onset",
                 "value": 5,
                 "step": 1},

                 {"name": "amp",
                 "title": "Amplitude (nA)",
                 "help": "Current Amplitude",
                 "value": 0.1,
                 "step": 0.1}
            ]
        },

        {"name": "ACClamp",
         "stim_type": "ACClamp",
         "title": "AC Clamp",
         "neuron": 1,
         "section": "",
         "loc": 0.5,
         "parameters": 
            [
                {"name": "dur",
                 "title": "Duration (ms)",
                 "help": "Duration of stimulus",
                 "value": 100,
                 "step": 1},

                 {"name": "delay",
                 "title": "Delay (ms)",
                 "help": "Time before stimulus onset",
                 "value": 5,
                 "step": 1},

                 {"name": "amp_min",
                 "title": "Minimum Amplitude (nA)",
                 "help": "Minimum Amplitude of alternating current",
                 "value": -1,
                 "step": 1},

                 {"name": "amp_max",
                 "title": "Maximum Amplitude (nA)",
                 "help": "Maximum Amplitude of alternating current",
                 "value": 1,
                 "step": 1},

                 {"name": "freq0",
                 "title": "Initial Frequency (Hz)",
                 "help": "Initial frequency of current alternation",
                 "value": 100,
                 "step": 1},

                 {"name": "freq1",
                 "title": "Target Frequency (Hz)",
                 "help": "Frequency gradient from initial to target",
                 "value": 100,
                 "step": 1}
            ]
        }


    ];
    return data;
}

/**
Mechanisms
----------
*/

const channelData = 
    {
    pas:
        { 
            "name": "pas",
            "title": "Passive Leak Channel",
            "parameters":
                {
                    g:
                        {"name": "g",
                         "title": "Leak Conductance",
                         "help": "S/cm<sup>2</sup>",
                         "value": 0.001,
                         "step": 0.001},
                    e:

                         {"name": "e",
                         "title": "Reversal Potential",
                         "help": "mV",
                         "value": -70,
                         "step": 1}
                }
        },

    kd:
        {
        "name": "kd",
        "title": "Voltage-gated K channel",
        "parameters":
            {
                gkbar:
                     {"name": "gkbar",
                     "title": "Potassium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.0036,
                     "step": 0.001}
            }
        // "assigned": 
        //     {"ik": 0.1,
        //      "gk": 0.0036,
        //      "n": 1},
        // "ions": {
        //     "ik": 0.1,
        //     "dik_dv_": 0.5
        // }
        },

    Nap_Et2:
        {
        "name": "Nap_Et2",
        "title": "Voltage-gated Na channel",
        "parameters":
            {
                gNap_Et2bar:
                     {"name": "gNap_Et2bar",
                     "title": "Sodium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.0001,
                     "step": 0.0001}
            }
        // "assigned": 
        //     {"ik": 0.1,
        //      "gk": 0.0036,
        //      "n": 1},
        // "ions": {
        //     "ik": 0.1,
        //     "dik_dv_": 0.5
        // }
        },

    CaT: 
        {
            "name": "CaT",
            "title": "Voltage-gated Ca channel (T-type)",
            "parameters":
                {
                    gmax:
                        {"name": "gmax",
                         "title": "Maximum Conductance",
                         "help": "S/cm<sup>2</sup>",
                         "value": 0.002,
                         "step": 0.001}
                }
        },


    cagk:
         {
            "name": "cagk",
            "title": "Ca-activated K Channel",
            "parameters":
                {
                    gkbar:
                        {"name": "gkbar",
                         "title": "Potassium Conductance",
                         "help": "S/cm<sup>2</sup>",
                         "value": 0.01,
                         "step": 0.01}
                }
        },
    cadifus:
        {
            "name": "cadifus",
            "title": "Ca accumulation",
            "parameters":
                {}
        },

        // {
        //     "name": "hh2",
        //     "title": "Hippocampal HH channels",
        //     "parameters":
        //         [
        //             {"name": "gnabar",
        //              "title": "Sodium Conductance",
        //              "help": "S/cm<sup>2</sup>",
        //              "value": 0.003,
        //              "step": 0.001},

        //              {"name": "gkbar",
        //              "title": "Potassium Conductance",
        //              "help": "S/cm<sup>2</sup>",
        //              "value": 0.005,
        //              "step": 0.001},

        //              {"name": "vtraub",
        //              "title": "Threshold",
        //              "help": "mV",
        //              "value": -63,
        //              "step": 1}
        //         ]
        // },

        // {
        //     "name": "k3st",
        //     "title": "3-state kinetic v-gated K",
        //     "parameters":
        //         [
        //             {"name": "gbar",
        //              "title": "Potassium Conductance",
        //              "help": "mS/cm<sup>2</sup>",
        //              "value": 33,
        //              "step": 1}
        //         ]
        // },

    kext:
         {
            "name": "kext",
            "title": "K external accumulation",
            "parameters":
                {
                    fhspace:
                         {"name": "fhspace",
                         "title": "Effective thickness of F-H space",
                         "help": "Angstrom",
                         "value": 300,
                         "step": 1},
                    txfer:
                         {"name": "txfer",
                         "title": "Tau",
                         "help": "Equilibrium time constant (ms)",
                         "value": 50,
                         "step": 1}
                }
        },
    hh:
        {
            "name": "hh",
            "title": "Hodgkin-Huxley",
            "parameters":
                {
                    gnabar:
                        {"name": "gnabar",
                         "title": "Sodium Conductance",
                         "help": "S/cm<sup>2</sup>",
                         "value": 0.12,
                         "step": 0.1},
                    gkbar:
                         {"name": "gkbar",
                         "title": "Potassium Conductance",
                         "help": "S/cm<sup>2</sup>",
                         "value": 0.036,
                         "step": 0.001},
                    gl:
                         {"name": "gl",
                          "title": "Leak Conductance",
                          "help": "S/cm<sup>2</sup>",
                          "value": 0.0003,
                          "step": 0.0001},
                    el:
                         {"name": "el",
                         "title": "Reversal Potential",
                         "help": "mV",
                         "value": -54.3,
                         "step": 1}
                }
        }
};

function globalParams() {

    let data = {
        "cagk": {
            "d1_cagk": 0.84,
            "d2_cagk": 1.0,
            "k1_cagk": 0.18,
            "k2_cagk": 0.011,
            "bbar_cagk": 0.28,
            "abar_cagk": 0.48,
            "oinf_cagk": 0.0,
            "tau_cagk": 0.0
        },
        "hh2": {},
        "CaT": {
            "usetable_CaT": 1.0
        },
        "kd": {},
        "kext": {
            "kbath_kext": 10.0
        },
        "cadifus": {
            "DCa_cadifus": 0.6,
            "k1buf_cadifus": 100.0,
            "k2buf_cadifus": 0.1,
            "TotalBuffer_cadifus": 0.003,
            "vrat_cadifus": [0, 0, 0, 0]
        }
    };
    return data;
}

function ChannelParameter(channel, name, value) {
    this.name = value;
    this.data = function(key) {
        return channelData[channel].parameters[name][key];
    };

}

function Channel(name, params = null) {
    console.log('creating Channel: ', name);
    console.log(params);
    params = params || {};
    let data = channelData[name];
    for (param of Object.values(data.parameters)) {
        // Take provided param if available
        console.log(params[param.name]);
        if (param.name in params) {
            this[param.name] = params[param.name];
        } else {
        this[param.name] = param.value;
        }
    }
    this.data = function(key, param=null) {
        // console.log(`Channel ${name} data: ${key}, ${param}`)
        if (param != null) {
            let out = channelData[name].parameters[param][key];
            // console.log(out);
            return out;
        }
        let out = channelData[name][key];
        // console.log(out);
        return out;
    };
}



function stimulusTemplate() {
    let data = {
        delay:5,
        dur: 1,
        amp: 0.1,
        neuron: 1,
        section: 'dendrite-1',
        loc: 0.5,
        stim_type: "IClamp"
    };
    return data;
}

// Component getters

function getChannels(names) {
    let channels = {};
    for (name of names) {
        channels[name] = new Channel(name);
    }
    return channels;
}

function getStimulus(name, params = []) {
    let stimulus = stimuli().filter(x=>x.name==name).pop();
    for (var i=0; i < params.length; i++) {
        stimulus.parameters[i] = params[i];
    }
    return stimulus;
}

// Default Components


function connectionDefault() {
    let data = {
        gid: 0,
        source: 1,
        target: 0,
        delay: 5,
        section: 3,
        loc: 0.5,
        con: {
            delay: 1,
            weight: 0.05,
            threshold: 0,
        },
        syn_data: newSynapse("AMPA")
    };
    return data;
}

function Segment(parent, diam=1, cm=1, channels=null) {
    this.geometry = {};
    this.geometry.diam = diam;
    this.biophysics = {'cm': cm};
    this.channels = channels || {};

    // Simple function to harmonize updating across segs and secs;
    this.update = function(key, attr, val) {
        console.log("Running Segment Update");
        let keys = (key).split('.');
        let obj = this;
        for (let k of keys) {
            obj = obj[k];
        }
        obj[attr] = val;
    };

    this.parent = function(){
        return parent;
    };
}

Segment.prototype.type = "Segment";

function Geometry(L=200, diam=1, nseg=1) {
    this.L = L;
    this.diam = diam;
    this.nseg = nseg;
}

function Biophysics(Ra=100, cm=1) {
    this.Ra = Ra;
    this.cm = cm;
}

function Section(name, gid, geometry, biophysics,
                 channels, parent) {
        this.name = name;
        this.gid = gid;
        this._geometry = Object.assign(new Geometry(), geometry);
        this._biophysics = Object.assign(new Biophysics(), biophysics);
        channels = Object.assign({},channels);
        this._channels = {};
        for (var key in channels) {
            let newChannel = new Channel(key, channels[key]);
            this._channels[key] = newChannel;
        }
        
        this.parent = parent;
        this.segments = [];

        // Extract params from segments
        this.params = function(key) {
            let base = Object.assign({}, this['_'+key]);
            let segData = extractParams(this.segments, key);
            // Overwrite base data with segment data
            for (key in segData) {
                base[key] = segData[key];
            }
            return base;
        };

        // Propogate changes to segments
        this.update = function(key, attr, val) {
            console.log("Running Section Update");
            let keys = ('_' + key).split('.');
            let obj = this;
            for (let k of keys) {
                obj = obj[k];
            }
            // Update base obj
            obj[attr] = val;
            // Update segment vals
            this.segments.forEach(x=>x.update(key,attr,val));
        };

        // Clean data to send to simulation
        this.data = function() {
            return {
                name: this.name,
                gid: this.gid,
                geometry: this._geometry,
                biophysics: this._biophysics,
                channels: this._channels,
                parent: this.parent,
                segments: this.segments
            };
        };

        this.addSegment = function() {
            let segDiam = this._geometry.diam.valueOf();
            let cm = this._biophysics.cm.valueOf();
            let segChannels = Object.assign({}, this._channels);
            let segment = new Segment(this, segDiam, cm, segChannels);
            this.segments.push(segment);
        };
        this.removeSegment = function() {
            this.segments.pop();
        };
        this.updateSegments = function() {
            let nseg = this._geometry.nseg;
            let segLen = this.segments.length;
            if (nseg > segLen) {
                let diff = nseg - segLen;
                for (let i=0; i<diff; i++) {
                    this.addSegment();
                }
            } else {
                let diff = segLen - nseg;
                for (let i=0; i<diff; i++) {
                    this.removeSegment();
                }
            }
        };

        this.removeChannel = function(channelName) {
            delete this._channels[channelName];
            for (let seg of this.segments) {
                delete seg.channels[channelName];
            }
        };

        this.addChannel = function(channelName) {
            let channel = new Channel(channelName);
            this._channels[channelName] = channel;
            for (seg of this.segments) {
                let channel = new Channel(channelName);
                seg.channels[channelName] = channel;
            }
        };

        for (let i=0; i<this._geometry.nseg; i++) {
            this.addSegment();
        }
}
  // Set _ val
  // Set every seg

Section.prototype = {
    get geometry() { return this.params('geometry'); },
    get biophysics() { return this.params('biophysics'); },
    get channels() { 
      let channels = {};
      let segChannels = this.segments.map(x=>x.channels || {});
      for (let channelName in this._channels) {
          let newChannel = extractParams(segChannels, channelName);
          channels[channelName] = new Channel(channelName, newChannel);
      }
      return channels; 
    }
};

Section.prototype.type = "Section";

const defaultSections = function() {
    return [
    {"name": "Soma", "gid": 1, "_geometry": {"L": 12, "diam": 12},
     "_channels": getChannels(['hh'])},
    {"name": "Axon", "gid": 2, "_geometry": {"L": 200, "diam": 1},
     "_channels": getChannels(['hh']), "parent": 1},
    {"name": "Dendrite 1", "gid": 3, "_geometry": {"L": 200, "diam": 1},
     "_channels": getChannels(['pas']), "parent": 1},
    ];
};

class Neuron {
        constructor(name, gid, x=null, y=null, color=null, 
                    sections = null) {
             this.gid = gid || 0;
             this.name = name || "neuron_0";
             this.x = x || "150";
             this.y = y || "75";
             this.color = color || colors[0];
             this.sections = [];
             sections = sections || defaultSections();
             for (var s of sections) {
                let sec = new Section(s.name, s.gid, s._geometry,
                                      s._biophysics, s._channels,
                                      s.parent);
                console.log(sec);
                this.sections.push(sec);
             }
                // [
                //     new Section('Soma', 1, new Geometry(12,12), new Biophysics(), ),
                //     new Section('Axon', 2, new Geometry(200,1), new Biophysics(), getChannels(['hh']), 1),
                //     new Section('Dendrite 1', 3, new Geometry(200,1), new Biophysics(), getChannels(['pas']), 1)
                // ];


        this.data = function() {
            let out = {
                gid: this.gid,
                name: this.name,
                x: this.x,
                y: this.y,
                sections: this.sections.map(x=> x.data())
            };
            return out;
        };

        this.nameSection = function(parent) {
            let parentSec = this.sections.filter(x=>x.gid==parent)[0];
            let otherChildren = this.sections.filter(x=>x.parent == parent);
            let base;
            if (parentSec.parent == null) {
                base = "Dendrite";
                otherChildren = this.sections.filter(x=>x.name.startsWith("Dendrite"));
            } else {
                base = parentSec.name;
            }
            let name = base + "_" + (otherChildren.length + 1);
            return name;
        };
    }
}

// new (Function.prototype.bind.apply(Cls, arguments));

