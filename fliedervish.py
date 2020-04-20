"""Python + NEURON implementation of Fleidervish et al, 2010.

Fleidervish IA, Lasser-Ross N, Gutnick MJ, Ross WN (2010) Na+ imaging reveals
little difference in action potential-evoked Na+ influx between axon and soma.
Nat Neurosci 13:852-60. doi:10.1038/nn.2574

Based on the model implemented with NEURON's GUI tools available at:
http://modeldb.yale.edu/136715
"""

from neuron import h, rxd, gui

# initial values for concentrations, voltage; fixed value for temperature
h.nai0_na_ion = 4
h.nao0_na_ion = 151
# h.v_init = -75
h.celsius = 30


class FleidervishNeuron:
    """Neuron of Fleidervish et al, 2010 without Na+ diffusion or accumulation"""
    def __init__(self, _id=None, x=0, y=0, z=0):
        '''Instantiate FleidervishNeuron.

        Parameters:
            x, y, z -- position offset
            _id -- cell id
        '''
        self._x, self._y, self._z = x, y, z
        self._id = _id
        self._setup_morphology()
        self._insert_mechanisms()
        self._discretize_model()
        self._set_mechanism_parameters()

    def __str__(self):
        if self._id is None:
            return 'FleidervishNeuron'
        return 'FleidervishNeuron[{}]'.format(self._id)

    def _setup_morphology(self):
        self._create_sections()
        self._shape_sections()
        self._connect_sections()

    def _insert_mechanisms(self):
        # electrophysiology
        for sec in self.all:
            for mechanism in ('pas', 'Kv1', 'kv'):
                sec.insert(mechanism)
        for sec in self.unmyelinated:
            sec.insert('nacurrent')

    def _set_mechanism_parameters(self):
        for sec in self.all:
            sec.Ra = 125
            sec.g_pas = 6.6e-05
            sec.e_pas = -75
            sec.ek = -85
        for sec in self.unmyelinated:
            sec.cm = 0.9
        for sec in self.myelin:
            sec.cm = 0.02
        for sec in self.low_kv_secs:
            sec.gbar_Kv1 = 0.01
            sec.gbar_kv = 20
        for sec in self.BasD:
            sec.gnabar_nacurrent = 0.004
        self.node.gbar_Kv1 = 0.2
        self.node.gnabar_nacurrent = 0.12
        self.node.gbar_kv = 2000
        self.ApD.gnabar_nacurrent = 0.02
        self.soma.gnabar_nacurrent = 0.025
        self.AIS.gnabar_nacurrent = 0.08
        for seg in self.AIS:
            seg.gbar_Kv1 = 0.002 + 0.2 * seg.x
            seg.gbar_kv = 20 + 2000 * seg.x

    def _create_sections(self):
        self.soma = h.Section(cell=self, name="soma")
        self.AIS = h.Section(cell=self, name="AIS")
        self.ApD = h.Section(cell=self, name="ApD")
        self.node = h.Section(cell=self, name="node")
        self.BasD = [h.Section(cell=self, name="BasD[%d]" % i) for i in range(2)]
        self.myelin = [h.Section(cell=self, name="myelin[%d]" % i) for i in range(2)]
        self.unmyelinated = [self.AIS, self.ApD, self.node, self.soma] + self.BasD
        self.low_kv_secs = [self.ApD, self.soma] + self.BasD + self.myelin
        self.all = self.low_kv_secs + [self.AIS, self.node]

    def _shape_sections(self):
        for sec, pt1, pt2, diam in (
                (self.AIS, (-125.911, -0.702), (-75.912, -0.453), 1.2),
                (self.ApD, (-160.807, 1.993),  (-860.807, 1.993), 3.5),
                (self.ApD, (-160.807, 1.993),  (-860.807, 1.993), 3.5),
                (self.BasD[0], (-125.911, -0.702), (-40.192, 179.997), 1.2),
                (self.BasD[1], (-125.911, -0.702), (-22.308, -171.776), 1.2),
                (self.myelin[0], (-75.912, -0.453), (-25.912, -0.453), 1.2),
                (self.myelin[1], (-24.912, -0.453), (25.088, -0.453), 1.2),
                (self.node, (-25.912, -0.453), (-24.912, -0.453), 1.2),
                (self.soma, (-125.911, -0.702), (-160.807, 1.993), 23)):
            sec.pt3dclear()
            for pt in (pt1, pt2):
                x, y = pt
                sec.pt3dadd(x + self._x, y + self._y, self._z, diam)

    def _connect_sections(self):
        self.ApD.connect(self.soma)
        for sec in self.BasD:
            sec.connect(self.AIS(0))
        self.soma.connect(self.AIS(0))
        self.myelin[0].connect(self.AIS)
        self.node.connect(self.myelin[0])
        self.myelin[1].connect(self.node)

    def _discretize_model(self):
        # NOTE: use of an odd number of segments is recommended to allow
        #       computing values at the center of a section but some evens
        #       used here to match the original study
        self.soma.nseg = 35
        self.AIS.nseg = 50
        self.ApD.nseg = 100
        self.node.nseg = 5
        for sec in self.BasD:
            sec.nseg = 200
        for sec in self.myelin:
            sec.nseg = 50


def fig3a(cell, voltage_graph, concentration_graph):
    """setup to run Fig 3A"""
    h.cvode_active(True)

    # setup the graphs
    voltage_graph.view(0, -90, 3000, 150, 518, 27, 549, 267.4)
    voltage_graph.addvar('soma(0.5).v', cell.soma(0.5)._ref_v)

    concentration_graph.view(0, 4, 3000, 0.4, 517, 457, 548.1, 238.6)
    concentration_graph.addvar('soma(0.5).nai', cell.soma(0.5)._ref_nai)
    concentration_graph.addvar('AIS(0.4).nai', cell.AIS(0.4)._ref_nai, 2, 1)
    concentration_graph.addvar('myelin[0](0.2).nai', cell.myelin[0](0.2)._ref_nai, 3, 1)
    concentration_graph.addvar('AIS(0.8).nai', cell.AIS(0.8)._ref_nai, 4, 1)

    # start time of current pulse
    cell.ic.delay = 1000
    # default simulation length
    h.tstop = 3000


def fig6b(cell, voltage_graph, concentration_graph):
    """setup to run Fig 6B

    The model is the same as in Fig 3A except some of the sections are
    different lengths and the discretization is different.

    The cell receives a different stimulus and different time series are
    plotted. An additional graph plots sodium concentration as a function of
    position."""
    # differences to the morphology and discretization from Fig 3A
    cell.myelin[0].L = 51
    cell.myelin[1].L = 60
    cell.myelin[0].nseg = 255
    cell.myelin[1].nseg = 300
    cell.AIS.L = 48
    cell.AIS.nseg = 240

    h.cvode_active(True)

    # setup the graphs

    voltage_graph.view(0, -80, 50, 140, 528, 440, 549, 267.4)
    voltage_graph.addvar('soma(0.5).v', cell.soma(0.5)._ref_v)
    voltage_graph.addvar('AIS(0.5).v', cell.AIS(0.5)._ref_v, 2, 1)
    voltage_graph.addvar('node(0.5).v', cell.node(0.5)._ref_v, 4, 1)

    concentration_graph.view(-1, 4, 51, 0.58, 528, 870, 548.1, 238.6)
    concentration_graph.addvar('soma(0.5).nai', cell.soma(0.5)._ref_nai)
    concentration_graph.addvar('AIS(0.25).nai', cell.AIS(0.25)._ref_nai, 2, 1)
    concentration_graph.addvar('node(0.5).nai', cell.node(0.5)._ref_nai, 4, 1)

    # additional graph plotting sodium concentration along a path
    rvp = h.Graph(False)
    rvp.size(-40, 160, 4, 4.58)
    rvp.view(-40, 4, 200, 0.58, 534, 18, 544.5, 262)
    h.flush_list.append(rvp)
    rvp_ = h.RangeVarPlot("nai")
    rvp_.begin(cell.ApD(0))
    rvp_.end(cell.myelin[1](1))
    rvp.addobject(rvp_, 1, 1, 0.8, 0.9)

    # start time of current pulse
    cell.ic.delay = 10
    # default simulation length
    h.tstop = 50


def do_sim(simulation, sim_control=None):
    """setup a simulation"""
    global na, cell

    # hide the simulation control panel, if there was one
    if sim_control:
        sim_control.unmap()

    cell = FleidervishNeuron()

    # add sodium diffusion everywhere
    allsec = rxd.Region(h.allsec(), nrn_region='i')
    na = rxd.Species(allsec, d=0.6, name='na', charge=1)

    # create a current clamp and add it to the cell
    cell.ic = h.IClamp(cell.soma(0.5))
    cell.ic.dur = 3       # ms
    cell.ic.amp = 1.5     # nA

    # setup graphs needed by both simulations
    concentration_graph = h.Graph(False)
    concentration_graph.size(0, 3000, 4, 4.4)
    voltage_graph = h.Graph(False)
    voltage_graph.size(0, 3000, -90, 60)
    h.graphList[0].append(voltage_graph)
    h.graphList[1].append(concentration_graph)

    # pop up the run control
    h.nrncontrolmenu()

    # call the funciton which actually sets up the specific simulation
    simulation(cell, voltage_graph, concentration_graph)

if __name__ == '__main__':
    # display a control panel to allow users to choose a simulation
    sim_control = h.VBox()
    sim_control.intercept(True)
    h.xpanel('')
    h.xlabel('Choose a simulation to run')
    h.xbutton('Fig 3A', lambda: do_sim(fig3a, sim_control))
    h.xbutton('Fig 6B', lambda: do_sim(fig6b, sim_control))
    h.xpanel()
    sim_control.intercept(False)
    sim_control.map('Choose simulation', 100, 100, 200, 100)