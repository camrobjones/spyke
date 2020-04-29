const stimulus_default = {
    delay:5,
    dur: 1,
    amp: 0.1,
    neuron: 0,
    section: 'dendrite-1',
    loc: 0.5,
}

const connectionDefault = {
    gid: 0,
    source: 0,
    target: 0,
    delay: 5,
    section: 'dendrite-1',
    loc: 0.5,
    weight: 0.05,
    threshold: 10,
    tau: 2
}

const dendriteDefault = {
    gid: 0,
    L: 200,
    diam: 1,
    g: 0.001,
    e: -65,
    "channels": []
}

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
        
}

const colors = Object.values(colorDict)

// Data for spyke JS

function general(L=100, diam=10) {
   let data = { "name": "general",
                "title": "General",
                "parameters":
                    [
                        {"name": "L",
                         "title": "Length",
                         "help": "Microns",
                         "value": L,
                         "step": 1,
                         "min": 0},

                         {"name": "diam",
                         "title": "Diameter",
                         "help": "Microns",
                         "value": diam,
                         "step": 1,
                         "min": 0},
                    ]
            }
    return data
}

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
    }
    return data
}

function channels() {

    let data = [
    { 
            "name": "pas",
            "title": "Passive Leak Channel",
            "parameters":
                [
                    {"name": "g",
                     "title": "Leak Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.001,
                     "step": 0.001},

                     {"name": "e",
                     "title": "Reversal Potential",
                     "help": "mV",
                     "value": -70,
                     "step": 1}
                ]
        },

        {
            "name": "kd",
            "title": "Voltage-gated K channel",
            "parameters":
                [
                     {"name": "gkbar",
                     "title": "Potassium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.0036,
                     "step": 0.001},
                ],
            // "assigned": 
            //     {"ik": 0.1,
            //      "gk": 0.0036,
            //      "n": 1},
            // "ions": {
            //     "ik": 0.1,
            //     "dik_dv_": 0.5
            // }
        },

        {
            "name": "Nap_Et2",
            "title": "Voltage-gated Na channel",
            "parameters":
                [
                     {"name": "gNap_Et2bar",
                     "title": "Sodium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.0001,
                     "step": 0.0001},
                ],
            // "assigned": 
            //     {"ik": 0.1,
            //      "gk": 0.0036,
            //      "n": 1},
            // "ions": {
            //     "ik": 0.1,
            //     "dik_dv_": 0.5
            // }
        },

        {
            "name": "CaT",
            "title": "Voltage-gated Ca channel (T-type)",
            "parameters":
                [
                    {"name": "gmax",
                     "title": "Maximum Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.002,
                     "step": 0.001}
                ]
        },


         {
            "name": "cagk",
            "title": "Ca-activated K Channel",
            "parameters":
                [
                    {"name": "gkbar",
                     "title": "Potassium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.01,
                     "step": 0.01}
                ]
        },

        {
            "name": "cadifus",
            "title": "Ca accumulation",
            "parameters":
                []
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

         {
            "name": "kext",
            "title": "K external accumulation",
            "parameters":
                [
                     {"name": "fhspace",
                     "title": "Effective thickness of F-H space",
                     "help": "Angstrom",
                     "value": 300,
                     "step": 1},

                     {"name": "txfer",
                     "title": "Tau",
                     "help": "Equilibrium time constant (ms)",
                     "value": 50,
                     "step": 1}
                ]
        },

        {
            "name": "hh",
            "title": "Hodgkin-Huxley",
            "parameters":
                [
                    {"name": "gnabar",
                     "title": "Sodium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.12,
                     "step": 0.1},

                     {"name": "gkbar",
                     "title": "Potassium Conductance",
                     "help": "S/cm<sup>2</sup>",
                     "value": 0.036,
                     "step": 0.001},

                     {"name": "gl",
                      "title": "Leak Conductance",
                      "help": "S/cm<sup>2</sup>",
                      "value": 0.0003,
                      "step": 0.0001},

                     {"name": "el",
                     "title": "Reversal Potential",
                     "help": "mV",
                     "value": -54.3,
                     "step": 1}
                ]
        },
    ]
    return data
}

function getChannel(name, params = []) {
    let channel = channels().filter(x=>x.name==name).pop()
    for (var i=0; i < params.length; i++) {
        channel.parameters[i] = params[i];
    };
    return channel
}

function dendriteTemplate() {
    let dendrite = {
        gid: 1,
        L: 200,
        diam: 1,
        // g: 0.001,
        // e: -65,
        "channels": [
            getChannel('pas')
        ],
        "data":
            {'selectedChannel': ""}
    }
    return dendrite;
}

function neuronTemplate() {
        var neuron = {'open':false,
                 'gid': 0,
                 'name': 'neuron_0', 
                 'x': "150",
                 'y': "75",
                'soma':
                    {
                        'L': 12,
                        'diam': 12,
                        // 'gnabar': 0.12,
                        // 'gkbar': 0.036,
                        // 'gl': 0.0003,
                        // 'el': -54.3,
                        "channels": [
                            getChannel('hh')
                        ],
                        "data": {'selectedChannel': ""}
                    },
                'dendrites': 
                    [
                        dendriteTemplate()
                    ],
                'axon': {
                    'L': 200,
                    'diam': 1,
                    // 'g': 0.001,
                    // 'e': -65,
                    "channels": [
                        getChannel('hh')
                    ],
                    "data": {'selectedChannel': ""}
                },
                'general':
                    {
                        'Ra': 100,
                        'cm': 1
                    },
                'synapse':
                    {
                        'tau': 2
                    }
                }
        return neuron
}