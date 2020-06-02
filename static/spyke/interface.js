
Vue.config.delimiters = ["[[", "]]"];

var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        settingsTab: 'simulation',
        colors: colors,
        status: {
            runningSim: false
        },
        popups: {
            save: false,
            load: false,
            editor: false,
            monitor: false,
            tutorial: false
        },
        load: {
            selected: "",
        },
        save: {
            filename: "",
        },
        editor: {
            gid: 1, 
            primary: "",
            neuron:{},
            selection:[],
            lastSelected:"",
            selectedChannel:"",
            newSection: {
                name: "",
                parent: "",
            }

        },
        tutorial: {},
        tutorials: tutorials,
        monitor: {
            chart: false,
            visible: ["Neuron 1_Soma"],
            axes: {
                x: {
                    title:"X Axis",
                    lock: false,
                    min:0,
                    max:0
                },
                y: {
                    title:"Y Axis",
                    lock: false,
                    min:0,
                    max:0
                }
            }
        },
        menus: menus,
        monitorTab: '',
        neurons: [],
        dendriteGid:1,
        svgData:{},
        simulation: {
            'time': 25,
            'potential': -65,
            'celsius': 6.3
        },
        stimuli: [],
        availableStimuli: stimuli(),
        selectedStimulus: "IClamp",
        labels: optionLabels,
        channels: channelData,
        connections: [],
        recording: {},
        views: [],
        chartKey: chartKey,
        neuronTemplate: {},
        toasts: [],
        savedFiles: [],
        editorOptions: ["Sections", "Connections", "Channels"]
    },
    filters: {

    },
    computed: {
        editorNeuron: function() {
            return this.getNeuron(this.editor.gid);
        },

        editorSections: function() {
            return this.getSections(this.editor.neuron);
        },

        editorSection: function() {
            let secs = this.editor.selection;
            if (secs.length == 1 && Section.prototype.isPrototypeOf(secs[0])) {
                return secs[0];
            }
            return null;
        },

        editorSectionFlag: function() {
            let secs = this.editor.selection;
            if (secs.length > 0 && secs[0].type=="Section") {
                return true;
            }
            return false;
        },

        editorAvailableChannels: function() {
            let used = Object.keys(this.editorParams.channels);
            let avail = Object.values(this.channels).filter(x=> !(used.includes(x.name)));
            return avail;
        },

        editorParams: function() {
            // Find all params which exist in all active sections
            let params = {};
            let all = this.editor.selection;
            if (all.length == 0) {
                return {};
            }

            if (all.length == 1 && Section.prototype.isPrototypeOf(all[0])) {
                let sec = all[0];
                let general = {};
                general.name = sec.name;
                general.parent = sec.parent;
                params.general = general;
            }

            // Geometry
            let geom = extractParams(all, 'geometry');
            if (Object.keys(geom).length) {
                params.geometry = geom;
            }
            // Biophysics
            let biop = extractParams(all, 'biophysics');
            if (Object.keys(biop).length) {
                params.biophysics = biop;
            }
            // Channels
            let channels = {};
            let allChannels = all.map(x=>x.channels || {});
            let shared = sharedKeys(allChannels);
            for (var channelName of shared) {
                let newChannel = extractParams(allChannels, channelName);
                channels[channelName] = newChannel;
            }
            params.channels = channels;
            
            return params;
        },

        maxTime: function() {
             if ('t' in this.recording) {
                return Math.max(...this.recording.t);
             }
             else {
                return 1;
             }
        },

        xticks: function() {
            return niceTicks(this.maxTime);
        },

        maxTick: function() {
            return this.xticks.pop();
        },

        tutorialStep: function() {
            if (this.tutorial.steps) {
                return this.tutorial.steps[this.tutorial.step];
            }
            return false;
        },

        tutorialPercentage: function() {
            let frac = this.tutorial.step / (this.tutorial.steps.length - 1);
            return Math.round(frac * 100);
        }

    },
    methods: {
        // Utils

        percentage: function(frac) {
            return Math.round(frac * 100);
        },

        getMaxGid: function(component) {
            if (typeof(component) == "string") {
                component = this[component];
            }
            let gids = component.map(x => parseInt(x.gid));
            gids.push(0)
            return Math.max(...gids)
        },

        getTimeProp: function(time) {
            return parseInt((time / this.maxTick) * 100) + "%";
        },

        getChannelData: function(channels) {
            let cd = Object.keys(channels).map(x=> 
                {''
                channelData[x];
            });
            return cd;
        },

        // Editor

        editorChange: function(group, param, e) {
            console.log("editorChange ", group, param, e);
            let val = e.target.value;
            for (let sec of this.editor.selection) {
                sec.update(group, param, val);
            }
        },

        updateEditorSegments: function(e){
            console.log("Updating editor segments...")
            let val = e.target.value;
            for (let sec of this.editor.selection) {
                Vue.set(sec._geometry, 'nseg', val);
                sec.updateSegments();
            }
        },

        editNeuron: function(neuronGid) {
            console.log("editing: ", neuronGid);
            this.closePopups();
            this.popups.editor = true;
            let neuron = this.getNeuron(neuronGid);
            this.editor.neuron = neuronGid;
            $('.pop-menu-container').removeClass('show');
        },

        secsCompatible: function(a, b) {
            if (a.type != b.type) {
                    return false;
                }
            if (a.type == "Segment") {
                return a.parent().gid == b.parent().gid;
            }
            return true;
        },

        editClear: function(section=null) {
            this.editor.selection = this.editor.selection.filter(x=>x==section);
        },

        editClearType: function(section) {
            this.editor.selection = this.editor.selection.filter(
                x=>this.secsCompatible(section, x));
            if (!this.secsCompatible(section, this.editor.lastSelected)){
                this.editor.lastSelected = null;
            }
        },

        editorToggle: function(section) {
            let idx = this.editor.selection.indexOf(section);
            if (idx >= 0) {
                this.editor.selection.splice(idx, 1);

            } else {
                this.editor.selection.push(section);
            }
        },

        editorRefresh: function() {
            // TODO: Hacky fix to reload channels
            let selection = this.editor.selection;
            this.editor.selection = "";
            this.editor.selection = selection;
        },

        editorSelectBetween(a, b) {
            let secList;
            if (a.type == "Segment") {
                secList = a.parent().segments;
            } else {
                secList = this.editorSections;
            }
            let indexA = secList.indexOf(a);
            let indexB = secList.indexOf(b);
            if (indexA < 0 || indexB < 0) {
                console.log("Sections not found: ", a, b)
                return false;
            }
            // Ensure indexA smaller
            if (indexB < indexA) {
                [indexA, indexB] = [indexB, indexA];
            }

            for (var i=indexA; i<= indexB; i++) {
                let sec = secList[i];
                if (!this.editor.selection.includes(sec)) {
                    this.editor.selection.push(sec);
                }
                
            }
        },

        editorSelect: function(section, e) {
            this.editClearType(section);
            if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
                this.editClear(section);
            }
            if (e.shiftKey) {
                this.editorSelectBetween(section, this.editor.lastSelected)
            } else {
                this.editorToggle(section);
            }
            this.editor.lastSelected = section;
        },

        editorRemoveChannel: function(channelName) {
            for (let sec of this.editor.selection) {
                console.log(this.editorNeuron, sec.name, channelName);
                this.removeChannel(this.editorNeuron, sec.name, channelName);
            }
            this.editorRefresh();
        },

        editorAddChannel: function() {
            let channelName = this.editor.selectedChannel;
            for (let sec of this.editor.selection) {
                console.log(this.editorNeuron, sec.name, channelName);
                sec.addChannel(channelName);
            }
            this.editorRefresh();
        },

        editorUpdateSection: function() {
            let parent = this.editor.newSection.parent;
            if (parent) {
                let name = this.editorNeuron.nameSection(parent);
                this.editor.newSection.name = name;
            }
        },

        editorClearNewSection: function() {
            this.editor.newSection.parent = "";
            this.editor.newSection.name = "";
        },

        // Layout

        changeSettingsTab: function(tabname) {
            this.settingsTab = tabname;
        },

        changeMonitorTab: function(tabname) {
            this.monitorTab = tabname;
            this.$nextTick(function(){
                if (tabname != "spikes") {
                    app.drawChart(tabname);
                }  
            });
        },

        // Add/Remove

        addStimulus: function(name) {
            let stim = getStimulus(name);
            stim.gid = this.getMaxGid('stimuli') + 1;
            stim_type_idx = this.stimuli.filter(
                x=>x.stim_type == name).length + 1;
            stim.name = stim.stim_type + " " + stim_type_idx;

            // Pre-select section
            let section = this.getSections(stim.neuron)[0] || {};
            stim.section = section.name || "";
            this.stimuli.push(stim);
        },

        removeStimulus: function(index) {
            this.stimuli.splice(index,1);
        },

        addConnection: function() {
            let copy = Object.assign({},connectionDefault);

            copy.gid = this.getMaxGid('connections') + 1;
            this.connections.push(copy);
        },

        removeConnection: function(index) {
            let connection = this.connections[index];
            $('#connection-' + connection.gid).remove();
            this.connections.splice(index,1);
        },

        nameSection: function(neuronGid){
            let secNames = this.getSections(neuronGid).map(x=>x.name);
            for (n of ['Soma', "Axon", "Dendrite 1"]) {
                if (!(secNames.includes(n))) {
                    return n;
                }
            }
            let dendrites = secNames.filter(x=>x.startsWith("Dendrite"));
            return ("Dendrite " + (dendrites.length + 1));
        },

        addSection: function(neuronGid, name=null, parent=null) {
            name = name || this.nameSection(neuronGid);
            let secs = this.getSections(neuronGid);
            let gid = this.getMaxGid(secs) + 1;
            let sec = new Section(name, gid);
            if (secs.length > 0) {
                sec.parent = parent || secs[0].gid;
            }
            // dend.gid = this.getMaxGid(this.neurons[index].dendrites) + 1;
            let neuron = this.getNeuron(neuronGid);
            neuron.sections.push(sec);
        },

        removeSection: function(neuronGid, sectionIndex, e) {
            console.log(e);
            e.stopPropagation();
            let neuron = this.getNeuron(neuronGid);
            neuron.sections.splice(sectionIndex, 1);
        },

        addChannel: function(neuron, section) {
            console.log("Adding channel: ", neuron, section);
            let sec = this.getSection(neuron.gid, section);
            let chanId = "#" + neuron.gid + '-' + sec.name + '-newChannel';
            console.log(chanId);
            let name = $(chanId).val();
            console.log(name);

            sec.addChannel(name);
            app.$forceUpdate();
        },

        removeChannel: function(neuron, section, channel) {
            let sec = this.getSection(neuron.gid, section);
            sec.removeChannel(channel);
        },

        // Neurons

        // Neuron Selection

        getNeuron: function(neuronGid) {
            return this.neurons.filter(x=> x.gid == neuronGid).pop();
        },

        getSections: function(neuronGid) {
            let neuron = this.getNeuron(neuronGid);
            if (neuron == undefined) {
                return [];
            }
            return neuron.sections;

        },

        getSection: function(gid, section) {
            let neuron = this.getNeuron(gid);
            if (neuron == undefined) {
                return neuron;
            }
            return neuron.sections.filter(x=>x.name == section).pop();
        },

        availableChannels: function(gid, section) {
            let sec = this.getSection(gid, section)
            if (sec == undefined) {
                console.log("ERROR: no section found in available channels: ", gid, section)
                return [];
            }
            let used = Object.keys(sec.channels);
            let avail = Object.values(this.channels).filter(x=> !(used.includes(x.name)));
            let names = avail.map(x=>x.name);
            // if (names.length > 0){
                // if (!(names.includes(sec.data.selectedChannel))) {
                    // sec.data.selectedChannel = names[0] || "";
                // }
            // }
            return avail;
        },

        neuronTextWidth: function(gid, mult=6, marg=20) {
            let el = document.getElementById('neuron-text-'+gid);
            // TODO: fix width update timing
            // if (el) {
            //     return el.getBBox().width + 20 + "px";
            // } else {
            let neuron = this.getNeuron(gid);
            return neuron.name.length * mult + marg + "px";
            // }
        },

        selectNeuron: function(gid) {
            this.changeSettingsTab('neuron');
            this.$nextTick(function() {
                $('.config-item-header-container').removeClass('show');
                $('.config-item-body-container').removeClass('show');
                let hid = "#neuron-header-" + gid;
                let bid = "#neuron-body-" + gid;
                $(hid).addClass('show');
                $(bid).addClass('show');
            })
        },

        // Add/remove neurons

        addNeuron: function(sections=null) {
            console.log('adding Neuron');
            console.log(sections);
            
            let gid = this.getMaxGid('neurons') + 1;
            console.log(gid);
            let color = colors[gid-1];
            let name = "Neuron " + gid;
            let x = (gid * 170) + 50;
            let y = (gid * 2) + 75;
            let neuron = new Neuron(name, gid, x, y, color, sections);
            this.neurons.push(neuron);
            this.monitor.visible.push(neuron.name + '_Soma');

            setTimeout(function() {
                makeDraggable();
                axonExtend();
            }, 100);

            return neuron;
            
        },

        duplicateNeuron: function(gid) {
            let old = this.getNeuron(gid);
            let neuron = this.addNeuron(old.sections);
            // neuron.sections = old.sections;
        },

        removeNeuron: function(neuronGid) {
            console.log(`removing neuron ${neuronGid}`);
            let neuron = this.getNeuron(neuronGid);
            // Destroy connections
            let connections = this.neuronConnections(neuron.gid);
            for (conn of connections) {
                let connIndex = this.connections.indexOf(conn);
                this.removeConnection(connIndex);
            }
            // Destron neuron element
            // $('#neuron-' + neuron.gid).remove();
            // Remove data element
            let index = this.neurons.indexOf(neuron);
            this.neurons.splice(index,1);
        },

        showHideNeuron: function(index) {
            this.neurons[index].open = !this.neurons[index].open;
        },

        neuronConnections: function(neuronGid) {
            let conns = [];
            for (let con of this.connections) {
                if (con.source == neuronGid | con.target == neuronGid) {
                    conns.push(con)
                }
            }
            return conns;

        },

        drawConnections: function() {
            for (let con of this.connections) {
                if (con.source > 0 & con.target > 0) {
                    drawConnection(con.source, con.target, con.gid)
                }
            }
        },

        getNeuronLocs: function() {
            let neurons = this.neurons;
            for (var i=0; i < neurons.length; i++) {
                let neuron = neurons[i];
                let neuronElement = $('#neuron-' + neuron.gid)[0];
                this.neurons[i].x = parseInt(neuronElement.getAttribute('x'))
                this.neurons[i].y = parseInt(neuronElement.getAttribute('y'))
            }
        },

        updateSec: function(sec, group, param, e) {
            let val = e.target.value;
            sec.update(group, param, val);
        },

        // Load and Save

        getSaved: function() {
            let url = '/spyke/get_saved'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            axios.get(url,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  this.savedFiles = response.data.savedFiles;
            });
        },

        saveSimulation: function() {
            let url = '/spyke/save'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            this.getNeuronLocs();
            let data = {};
            data.neurons = this.neurons;
            data.simulation = this.simulation;
            data.stimuli = this.stimuli;
            data.connections = this.connections;
            data.filename = this.save.filename;
            let monitor = Object.assign({}, this.monitor);
            delete monitor.chart;
            data.monitor = monitor;
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data);
                  this.toastObj(response.data);
            });
            this.savePopup(false);
        },

        loadSimulation: function() {
            this.save.filename = this.load.selected;
            let url = '/spyke/load';
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            let data = {'filename': this.load.selected};
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data);
                  let conf = response.data;
                  let keys = Object.keys(conf);
                  this.neurons = [];
                  for (let n of conf.neurons) {
                    let newNeuron = new Neuron(n.name, n.gid, n.x, n.y,
                                               n.color, n.sections);
                    this.neurons.push(newNeuron);
                  }
                  this.simulation = conf.simulation;
                  this.stimuli = conf.stimuli;
                  this.connections = conf.connections;
                  let monitor = conf.monitor;
                  monitor.chart = this.monitor.chart;
                  this.monitor = monitor;

                  this.$nextTick(function () {
                    this.drawConnections();
                });
                  this.toastObj(conf.message)
            });
            this.loadPopup(false);
        },

        runSimulation: function() {
            console.log('running simulation')
            let t0 = Date.now()

            this.status.runningSim = true;

            let url = '/spyke/simulation'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};

            this.getNeuronLocs();

            let data = {'time': this.simulation.time,
                        'potential': this.simulation.potential,
                        'celsius': this.simulation.celsius,
                        'stimuli': this.stimuli,
                        'neurons': this.neurons.map(x=>x.data()),
                        'connections': this.connections
                        };
            console.log(data)
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log("response ", Date.now() - t0)
                  console.log(response.data)
                  // Clone and delete message
                  let message = Object.assign({}, response.data.message);
                  message.messages = Object.assign({}, message.messages);
                  console.log(message)
                  this.toastObj(message);
                  delete response.data.message;
                  if (response.data.views) {
                      // let neuron_keys = Object.keys(response.data.cells);
                      app.views = Object.keys(response.data.views);
                      app.recording = response.data;
                      console.log("drawing chart ", Date.now() - t0)
                      app.changeMonitorTab("v")
                    }
                  app.status.runningSim = false;
                  console.log("updated ", Date.now() - t0)
            })
            .catch(function (error) {
                // handle error
                console.log("Error: ", error);
                app.addToast("Error Running Simulation", "500 response",
                              error, {}, "error");
                app.status.runningSim = false;
              });
        },

        drawChart: function(view) {
            console.log(`plotting new chart: ${view}`);
            var ctx = document.getElementById('monitor-canvas');
            console.log(ctx);
            ctx.height = "300px";
            if (this.monitor.chart) {
                this.monitor.chart.destroy();
            }
            if (!('views' in this.recording)) {
                console.log("No data to create chart.");
                return null;
            }
            let cells = Object.keys(this.recording.views[view]);

            var yLabel = this.chartKey[view].ylab;
            let datasets = [];
            var primaryColor = "#36005d";

            // Loop through cells
            for (var i=0; i < cells.length; i++) {
                const cell = cells[i];
                let neuron = this.neurons.filter(x=> {
                        const a = cell;
                        return x.name == a;
                    })[0];
                let sections = this.recording.views[view][cell];
                // Loop through sections
                for (var section in sections) {

                    let yData = sections[section];
                    let xydata = [];
                    for (j=0; j < yData.length; j++) {
                        xydata.push({
                            "x": this.recording.t[j],
                            "y": yData[j]
                        });
                    }
                    let color = neuron.color;
                    let name = cell;
                    console.log(cell + '_' + section);
                    if (this.monitor.visible.includes(cell + '_' + section)) {
                        if (section != "Soma") {
                            color = hexToRgba(color, 0.5);
                            name = cell + ": " + section;
                        } else if (view == 'amp') {
                            // Hacky fix for stims TODO: clean up
                            name = section;
                            color = colors[datasets.length];
                        }
                        let cellData = {
                        'label': name,
                        'data': xydata,
                        'fill': false,
                        "borderColor" :color,
                        "lineTension" :0.1,
                        "pointRadius": 0
                        };
                        datasets.push(cellData);
                    }
                }
            }

            let options = {
                maintainAspectRatio: false,
                scales: {
                   yAxes: 
                       [{
                         scaleLabel: 
                            {
                           display: true,
                           labelString: yLabel
                            },
                        ticks: {
                            precision: 0
                        }
                        }],
                   xAxes: 
                        [{
                         type: "linear",
                         scaleLabel: 
                            {
                               display: true,
                               labelString: "Time (ms)"
                            },
                         ticks: {
                            precision: 0
                            // stepSize: 1,
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += Math.round(tooltipItem.yLabel * 100) / 100;
                            return label;
                        },
                        title: function(tooltipItem, data) {
                            tooltipItem = tooltipItem[0];
                            label = Math.round(tooltipItem.xLabel * 100) / 100;
                            label += "ms"
                            return label;
                        }
                    }
                },
                legend: {
                    onClick: newLegendClickHandler,
                    labels: {
                        filter: function(item, chart) {
                            return !item.text.includes(':');
                        }
                    },
                }
            };

            if (this.monitor.axes.x.lock) {
                options.scales.xAxes[0].ticks.min = this.monitor.axes.x.min;
                options.scales.xAxes[0].ticks.max = this.monitor.axes.x.max;

            }

            if (this.monitor.axes.y.lock) {
                options.scales.yAxes[0].ticks.min = this.monitor.axes.y.min;
                options.scales.yAxes[0].ticks.max = this.monitor.axes.y.max;

            }

            this.monitor.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.recording.t,
                    datasets: datasets,
                },
                options: options
            });
        },

        // Popups

        closePopups: function() {
            for (k of Object.keys(this.popups)) {
                this.popups[k] = false;
            }

        },

        savePopup: function(status='toggle') {
            this.closePopups();
            if (status == "toggle") {
                this.popups.save = !this.popups.save;
            } else {
                this.popups.save = status;
            }
        },

        loadPopup: function(status='toggle') {
            this.closePopups();
            if (status == "toggle") {
                this.popups.load = !this.popups.load;
            } else {
                this.popups.load = status;
            }
                this.load.selected = ""
                this.getSaved();
        },

        monitorPopup: function() {
            this.closePopups();
            this.popups.monitor = true;
        },

        monitorApplySettings: function() {
            // this.closePopups();
            this.drawChart(this.monitorTab);
        },

        addToast: function(title, subtitle="", message="", messages=Object(), level="info") {
            let gid = this.getMaxGid('toasts') + 1
            let toast = {
                'title': title,
                'subtitle': subtitle,
                'message': message,
                'messages': messages,
                'level': level,
                'gid': gid
            }
            this.toasts.push(toast);
            this.$nextTick(function () {
                    $('#toast-' + gid).toast({autohide:false});
                    $('#toast-' + gid).toast('show');
                });
            if (level == 'success') {
                setTimeout(function() {
                    let idx = app.toasts.map(x=>x.gid).indexOf(gid);
                    app.toasts.splice(idx, 1);
                }, 5000);
            }
        },

        toastObj: function(message) {
            this.addToast(message.title, message.subtitle, message.message, message.messages, message.level);
        },

        // Tutorials

        tutorialNext: function() {
            this.tutorial.step ++;
            $('.flashing').removeClass('flashing');
            for (var f of this.tutorialStep.flashing) {
                $(f).addClass('flashing');
            }
            if (!(this.tutorialStep.btn)) {
                this.tutorialPoll(this.tutorialStep.condition);
            }
        },

        tutorialFinish: function() {
            $('.flashing').removeClass('flashing');
            this.closePopups();
        },

        tutorialPoll: function(condition) {
            console.log("Polling...");
            if (condition()) {
                console.log("Advancing...");
                this.tutorialNext();
            } else {
                setTimeout(function(){app.tutorialPoll(condition);}, 500);
            }
        },

        changeTutorial: function(tut) {
            this.tutorial = tut;
            this.closePopups();
            this.popups.tutorial = true;
            $('#tutorial-list-container').removeClass('show');
            this.$nextTick(function(){
                $( "#tutorial-popup-container" ).draggable({
                      handle: "#tutorial-header"
                    });
            });
        }

        
    },
    mounted: function() {
        // Load neuron svg 
        var response = $.get("/static/spyke/neuron-grey-prod.svg").then(function(xml) {
            app.svgData = xml.documentElement;
            // app.addNeuron();
            // app.addStimulus('IClamp')
        });

        // Get saved files
        this.getSaved();

        // Create panzoom in neuron canvas
        var element = document.querySelector('#svg-canvas-inner')
        // And pass it to panzoom
        this.pz = panzoom(element, {
            maxZoom: 10,
            minZoom: 0.1,
            zoomSpeed: 0.02,
            bounds: true,
            boundsPadding: 0.2,
            // Prevent panzoom panning while dragging neuron
            beforeMouseDown: function(e) {
            if (e.target.parentElement.parentElement.classList.contains('neuron-container')) {
                return true;
            }
            return false;
            }
            
        });
        // Unhide popups
        document.getElementById('popup-container').classList.remove('hide');
    }
});

var pz = "";

// Keep track of co-ordinates in the neuron canvas
function updateCoords(event) {
    let tf = app.pz.getTransform();
    let canvas = $('#svg-canvas').offset();
    let clientX = event.pageX;
    let clientY = event.pageY;
    let relX = clientX - canvas.left;
    let relY = clientY - canvas.top;
    let scaledX = ((relX - tf.x) /tf.scale).toFixed(1)
    let scaledY = ((relY - tf.y) /tf.scale).toFixed(1)
    $('#canvas-coords').text(`(${scaledX},${scaledY})`)
}

function makeDraggable() {
    $('.neuron-container').draggable({
        containment: "parent",
        scroll: "false",
        cursor: "move",
        cancel: ".axon-terminal"
    })
      .bind('mousedown', function(event, ui){
        // ignore terminals
        if (event.target.classList.contains('axon-terminal')) {
            return false
        }
        // console.log('neuron click')
        // bring target to front
        $(event.target.parentElement).append( event.target );
      })
      // .bind('dragstart', function(event, ui){
      //   console.log('dragstart!')
      //   console.log(event.target)
      //   if (event.target.classList.contains('axon-terminal')) {
      //       console.log('stopping dragstart!')
      //       event.preventDefault();
      //       event.stopPropagation();
      //       return false
      //   }
    // })
      .bind('drag', function(event, ui){
        // ignore terminals
        if (event.target.classList.contains('axon-terminal')) {
            // console.log('stopping drag!')
            // event.preventDefault();
            // event.stopPropagation();
            return false
        }
        // console.log('dragging neuron with: ', event.target)
        let container = $('#canvas-container');
        let containerOffset = container.offset();
        
        let targetBox = event.target.getBBox();
        let targetWidth = targetBox.width;
        let targetHeight = targetBox.height;

        let tf = app.pz.getTransform();

        let rawX = event.pageX
        let rawY = event.pageY

        let relX = rawX - containerOffset.left
        let relY = rawY - containerOffset.top

        let scaledX = (relX - tf.x) / tf.scale
        let scaledY = (relY - tf.y) / tf.scale

        scaledX = scaledX - (2 * targetWidth)
        scaledY = scaledY - (targetHeight/2)

        event.target.setAttribute('x', scaledX);
        event.target.setAttribute('y', scaledY);

        // Find attached connections
        let gid = parseInt(event.target.id.slice(7));
        let conns = app.neuronConnections(gid);
        let neuron = app.getNeuron(gid);
        neuron.x = scaledX;
        neuron.y = scaledY;
        // Redraw attached connections
        for (con of conns) {
            drawConnection(con.source, con.target, con.gid)
        }
    });
}

function convertXY(rawX, rawY) {
    let tf = app.pz.getTransform();
    let canvas = $('#svg-canvas').offset();
    let relX = rawX - canvas.left;
    let relY = rawY - canvas.top;
    let scaledX = ((relX - tf.x) /tf.scale)
    let scaledY = ((relY - tf.y) /tf.scale)
    return [scaledX, scaledY]
}

function getCentre(el) {
    let rect = el.getBoundingClientRect();
    let x = rect.x + rect.width / 2;
    let y = rect.y + rect.height / 2;
    return [x, y]

}

function drawConnection(sourceGid, targetGid, connectionGid) {
    let source = $('#neuron-' + sourceGid);
    let sourceCentre = source.find('.axon-center');
    let [sourceX, sourceY] = getCentre(sourceCentre[0]);
    let [sx, sy] = convertXY(sourceX, sourceY);

    let target = $('#neuron-' + targetGid);
    let targetCentre = target.find('.soma');
    let [targetX, targetY] = getCentre(targetCentre[0]);
    let [tx, ty] = convertXY(targetX, targetY)

    let dx = tx - sx
    let dy = ty - sy
    if (Math.abs(dx) > Math.abs(dy)) {
        var x1 = dx / 2 + sx
        var y1 = sy
        var x2 = x1
        var y2 = ty
    } else {
        var x1 = sx
        var y1 = dy / 2 + sy
        var x2 = tx
        var y2 = y1
    }
    let connection = $('#connection-' + connectionGid)[0] 
    if ($('#connection-' + connectionGid).length < 1) {
        connection = document.createElementNS("http://www.w3.org/2000/svg", "path");
        connection.setAttribute('fill', 'transparent')
        connection.setAttribute('stroke', '#808080')
        connection.setAttribute('stroke-width', '0.5mm')
        connection.setAttribute('stroke-linecap', 'round')
        connection.id = 'connection-' + connectionGid;
        $('#svg-canvas-inner').prepend(connection);
    }

    // console.log(`M${sx} ${sy} C ${x1} ${y1}, ${x2} ${y2}, ${tx} ${ty}`)
    connection.setAttribute('d', `M${sx} ${sy} C ${x1} ${y1}, ${x2} ${y2}, ${tx} ${ty}`)
}

function axonExtend() {
    $('.axon-terminal')
    .bind('mousedown', function(event, ui){
        // bring target to front
        let terminal = event.target
        let terminalRect = terminal.getBoundingClientRect();
        let extension = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // get click coords
        let container = $('#canvas-container');
        let containerOffset = container.offset();
        let tf = app.pz.getTransform();

        // let rawX = event.pageX
        // let rawY = event.pageY
        let rawX = terminalRect.x 
        let rawY = terminalRect.y 

        let relX = rawX - containerOffset.left
        let relY = rawY - containerOffset.top

        let scaledX = ((relX - tf.x) / tf.scale) + ((terminalRect.width / 2) / tf.scale) - 0.1
        let scaledY = ((relY - tf.y) / tf.scale) + ((terminalRect.height / 2) / tf.scale) - 0.1
        // let scaledX = event.target.getAttribute('cx')
        // let scaledY = event.target.getAttribute('cy')
        // create path from that point
        app.extendStartX = parseFloat(scaledX)
        app.extendStartY = parseFloat(scaledY)
        extension.setAttribute('d', `M${scaledX} ${scaledY}`)
        extension.setAttribute('fill', 'transparent')
        extension.setAttribute('stroke', '#808080')
        extension.setAttribute('stroke-width', '0.5mm')
        extension.setAttribute('stroke-linecap', 'round')

        extension.id = 'axon-extension'
        // add to doc
        $('#svg-canvas-inner').append(extension);
        // 
        $('#svg-canvas').on('mousemove', function(event, ui){
            // get click coords
            let container = $('#canvas-container');
            let containerOffset = container.offset();
            let tf = app.pz.getTransform();

            let rawX = event.pageX
            let rawY = event.pageY

            let relX = rawX - containerOffset.left
            let relY = rawY - containerOffset.top

            let scaledX = (relX - tf.x) / tf.scale
            let scaledY = (relY - tf.y) / tf.scale

            let mx = app.extendStartX
            let my = app.extendStartY
            let dx = scaledX - mx
            let dy = scaledY - my
            if (Math.abs(dx) > Math.abs(dy)) {
                var x1 = dx / 2 + mx
                var y1 = my
                var x2 = x1
                var y2 = scaledY
            } else {
                var x1 = mx
                var y1 = dy / 2 + my
                var x2 = scaledX
                var y2 = y1
            }
            let x = scaledX
            let y = scaledY
            // create path from that point
            let extension = $('#axon-extension')[0]
            extension.setAttribute('d', `M${mx} ${my} C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
            // add to doc
            $('#svg-canvas').on('mouseup', function(event, ui) {
                   $(this).off("mousemove");
                   $('#axon-extension').remove();
            });
            $('#svg-canvas').on('mouseleave', function(event, ui) {
                   $(this).off("mousemove");
                   $('#axon-extension').remove();
            });

        });
    })
      
}

function toggleHideNext(el) {
    $(el).toggleClass('show')
    $(el).next().collapse('toggle');
    // TODO: hacky fix, replace
    app.$forceUpdate();
}

window.onload = function() {
    // Make neurons draggable
    makeDraggable();
    axonExtend();
    $('.toast').toast({autohide:false});
    document.getElementById('editor-popup-sidebar-container')
        .onselectstart = function() {
        return false;
    };
}



