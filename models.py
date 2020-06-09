"""
Neuron models
-------------
General purpose classes for modelling neurons.

The classes are heavily based on the NEURON tutorial:
https://neuron.yale.edu/neuron/docs/ball-and-stick-model-part-1

Update: the classes are now heavily based on Andrew P. Davison's nrnutils
https://bitbucket.org/apdavison/nrnutils/src/default/nrnutils.py
"""

import logging
from pprint import pprint

import numpy as np
from neuron import h, nrn, load_mechanisms
from neuron.units import ms, mV

from spyke import glial
h.load_file('stdrun.hoc')

load_mechanisms('spyke/data/models/')

logger = logging.getLogger('django')

"""
Constants
---------
"""
# Section location shortcuts
PROXIMAL = 0
DISTAL = 1

# Stimulus parameters
TEMPORAL_RESOLUTION = 10  # frames per ms
BUFFER = 5  # ms of 0 current to prevent interpolation errors

"""
Global variables
"""
# MECHANISM
# h.oinf_cagk = 1
# h.tau_cagk = 2
# vrat_cadifus = h.vrat_cadifus
# vrat_cadifus[3] = 0.5
# h.vrat_cadifus = vrat_cadifus


class Mechanism(object):
    """
    Examples:
    >>> leak = Mechanism('pas', {'e': -65, 'g': 0.0002})
    >>> hh = Mechanism('hh')
    """
    def __init__(self, name, **parameters):
        self.name = name
        self.parameters = parameters

    def insert_into(self, section):
        """Insert self into all segs of section"""
        section.insert(self.name)
        for name, value in self.parameters.items():
            for segment in section:
                mech = getattr(segment, self.name)
                setattr(mech, name, value)


def alternating_current(amp_min, amp_max, dur, delay, freq0, freq1=None):
    """
    Create an sin wave from amp_min to amp_max at freq0 for dur ms

    returns tuple(t_vec, amp_vec)
        t_vec (h.Vector) time vector
        amp_vec (h.Vector) vector of amplitude values

    """

    # TODO: Prevent rounding of oscillations, period

    if freq1 is None:
        freq1 = freq0

    # convert freq to ms
    freq0 = freq0 / 1000
    freq1 = freq1 / 1000

    # Find mean freq, period, and no. oscillations
    freq_mean = np.mean([freq0, freq1])
    period_mean = 1/freq_mean
    dur = int(dur)
    oscillations = int(dur / period_mean)

    # gradient from freq0 to freq1
    freqs = np.linspace(freq0, freq1, oscillations)
    # pad to circumvent rounding down
    freqs = np.append(freqs, freqs[-1])

    # create sin wave
    pi_vals = np.array([])
    for freq in freqs:
        period = int((1/freq) * TEMPORAL_RESOLUTION)  # no. frames
        pi_vals = np.append(pi_vals, np.linspace(0, 2 * np.pi, period))

    vals = np.sin(pi_vals)[:dur * TEMPORAL_RESOLUTION]

    # add buffer time to prevent interpolation errors
    vals = np.append(vals, np.zeros(BUFFER * TEMPORAL_RESOLUTION))
    # add delay zeros at beginning
    vals = np.append(np.zeros(int(delay) * TEMPORAL_RESOLUTION), vals)

    # normalize current
    amp_diff = amp_max - amp_min
    vals = (vals + 1) / 2  # normalize between 0 and 1
    vals = vals * amp_diff  # normalize between 0 and amp_diff
    vals = vals + amp_min  # normalize between amp_min and amp_max

    # create time vector
    dur = dur + BUFFER  # add buffer time to prevent interpolation errors
    t_vec = h.Vector(np.linspace(0, int(delay) + dur + BUFFER, len(vals)))
    amp_vec = h.Vector(vals)

    return t_vec, amp_vec


class ACClamp():
    """
    Wrapper for h.IClamp with alternating current

    Parameters
    ----------

    """
    def __init__(self, seg, name, delay, amp_min, amp_max, dur, freq0, freq1=None):
        self.name = name
        self.stim = h.IClamp(seg)
        self.t_vec, self.amp_vec = alternating_current(amp_min, amp_max, dur,
                                                       delay, freq0, freq1)
        self.stim.dur = dur
        self.stim.delay = delay
        self.amp_vec.play(self.stim._ref_amp, self.t_vec, 1)

        self.records = {}
        self.records['i'] = h.Vector().record(self.stim._ref_i)
        self.records['amp'] = h.Vector().record(self.stim._ref_amp)


class Stimulus():
    """
    Helper class to create nrn Point Processes

    """
    def __init__(self, seg, stim_type, name, **params):
        self.name = name
        self.stim = getattr(h, stim_type)(seg)
        for k, v in params.items():
            setattr(self.stim, k, v)

        self.records = {}
        self.records['i'] = h.Vector().record(self.stim._ref_i)
        self.records['amp'] = h.Vector().record(self.stim._ref_amp)


class Section(nrn.Section):
    """
    Examples:
    >>> soma = Section(L=30, diam=30, mechanisms=[hh, leak])
    >>> apical = Section(L=600, diam=2, nseg=5, mechanisms=[leak],
    ...                  parent=soma, connection_point=DISTAL)
    """
    def __init__(self, gid, name="", geometry=None, biophysics=None,
                 channels=None, parent=None, connection_point=DISTAL,
                 cell=None, segments=None):
        nrn.Section.__init__(self, name=name, cell=cell)
        self.gid = gid
        self.name = name
        self._setup_geometry(**geometry or {})
        # set cable properties
        self._setup_biophysics(**biophysics or {})
        # connect to parent section
        if parent:
            self.connect(parent, connection_point, PROXIMAL)
        # add ion channels
        self.add_mechanisms(channels)

        self.setup_segments(segments)

        self._setup_recording()

        self.print()

    def _setup_geometry(self, L=100, diam=1, nseg=1):
        """Set basic geometric properties"""
        self.L = L
        self.nseg = int(nseg)
        # TODO: superfluous? Remove?
        if diam is not None:
            self.diam = diam

    def _setup_biophysics(self, Ra=100, cm=1):
        """Set basic biophysics properties"""
        self.Ra = Ra
        if cm is not None:
            self.cm = cm

    def setup_segments(self, segments):
        """Set specific parameters per segment"""
        assert self.nseg == len(segments)
        for i, seg in enumerate(self):
            seg_params = segments[i]
            seg.diam = seg_params['geometry']['diam']
            seg.cm = seg_params['biophysics']['cm']
            for name, params in seg_params['channels'].items():
                channel = getattr(seg, name)
                for attr, val in params.items():
                    setattr(channel, attr, val)

    def print(self):
        """Pprint section's psection method"""
        pprint(self.psection())

    def add_mechanisms(self, mechanisms):
        """Create Mechanism objects from params and insert"""
        self.mechanisms = []
        mechanisms = mechanisms or {}
        for name, params in mechanisms.items():
            mech = Mechanism(name, **params)
            mech.insert_into(self)
            self.mechanisms.append(mech)

    # def add_synapses(self, label, type, locations=[0.5], **parameters):
    #     if hasattr(self, label):
    #         raise Exception("Can't overwrite synapse labels (to keep things simple)")
    #     synapse_group = []
    #     for location in locations:
    #         synapse = getattr(h, type)(location, sec=self)
    #         for name, value in parameters.items():
    #             setattr(synapse, name, value)
    #         synapse_group.append(synapse)
    #     if len(synapse_group) == 1:
    #         synapse_group = synapse_group[0]
    #     setattr(self, label, synapse_group)
    # add_synapse = add_synapses  # for backwards compatibility

    def record_spikes(self, threshold=-30):
        """Setup recording for action potentials"""
        self.spiketimes = h.Vector()
        self.spikecount = h.APCount(0.5, sec=self)
        self.spikecount.thresh = threshold
        self.spikecount.record(self.spiketimes)
        self.records['spikes'] = self.spiketimes

    def _setup_recording(self):
        self.records = {}
        self.records['v'] = h.Vector().record(self(0.5)._ref_v)
        data = self.psection()
        for ion, vals in data['ions'].items():
            # loop through current and internal concentration
            for key in [f"i{ion}", f"{ion}i"]:
                if key in vals:
                    ref = getattr(self(0.5), f"_ref_{key}")
                    self.records[key] = h.Vector().record(ref)
        self.record_spikes()


class Cell(object):

    """General purpose class to model neurons

    Parameters
    ----------
    gid : int
        Unique identifier for the cell  TODO: generate from class
    x : numeric
        x co-ordinate of the cell's location
    y : numeric
        y co-ordinate of the cell's location
    z : numeric
        z co-ordinate of the cell's location
    theta : numeric
        Angle through which cell is rotated
    params : dict
        Optional biophysical and morphological parameters to specify
        cell features
    """

    def __init__(self, gid, x, y, z, theta, params=None):
        """Initiates the cell instance."""

        logger.info('creating cell %s', gid)

        # Initialise basic and default attributes
        self.params = params or {}
        self._gid = gid
        self.name = params.get('name', f"Neuron {gid}")
        self.stimuli = []
        self.syns = []
        self.data = {}
        self.sections = {}
        self.roots = []
        self.vectors = []

        logger.info('setting up morphology')
        # Setup morphology and biophysics
        self._setup_morphology()
        self.all = self.root.wholetree()

        logger.info('setting position')
        # set position of cell
        self.x = self.y = self.z = 0
        h.define_shape()
        self._rotate_z(theta)
        self._set_position(x, y, z)

    def _setup_morphology(self):
        """Placeholder method"""
        pass

    def __repr__(self):
        return '{}[{}]'.format(self.name, self._gid)

    def __getattribute__(self, attr):
        """Allow dot notation access to sections"""
        # TODO: Implement
        return object.__getattribute__(self, attr)

    def _set_position(self, x, y, z):
        """Set the cell's 3d position in space."""
        for sec in self.all:
            for i in range(sec.n3d()):
                sec.pt3dchange(i,
                               x - self.x + sec.x3d(i),
                               y - self.y + sec.y3d(i),
                               z - self.z + sec.z3d(i),
                               sec.diam3d(i))
        self.x, self.y, self.z = x, y, z

    def _rotate_z(self, theta):
        """Rotate the cell about the Z axis."""
        for sec in self.all:
            for i in range(sec.n3d()):
                x = sec.x3d(i)
                y = sec.y3d(i)
                c = h.cos(theta)
                s = h.sin(theta)
                xprime = x * c - y * s
                yprime = x * s + y * c
                sec.pt3dchange(i, xprime, yprime, sec.z3d(i), sec.diam3d(i))

    @property
    def records(self):
        """Format and return recording data."""

        data = self.data

        for name, sec in self.sections.items():
            for key, record in sec.records.items():
                cell_record = data.get(key, {})
                cell_record[name] = glial.compress_array(record.as_numpy())
                data[key] = cell_record

        return data

    def get_sec(self, gid):
        """Retrieve section by gid or return None"""
        candidates = [sec for sec in self.sections.values() if sec.gid == gid]
        if len(candidates) == 1:
            return candidates[0]
        return None


class SimpleNeuron(Cell):
    """Simple neuron with a soma and one dendrite."""

    def name_sec(self):
        """To be improved"""
        return f"section-{len(self.sections) + 1}"

    def _add_section(self, params):
        """Add a section to the cell"""
        sec = Section(cell=self, **params)
        self.sections[sec.name] = sec

        # add to roots if no parent
        if params['parent'] is None:
            self.roots.append(sec)

        return sec

    def _setup_morphology(self):
        """Create sections from provided parameters"""
        sections = self.params.get('sections', [])
        for section in sections:
            logger.info('setting up %s', section['name'])
            print(section)

            # Retrieve parent section and pass to constructor
            if 'parent' in section and section['parent']:

                parent = self.get_sec(section['parent'])
                if parent is None:
                    msg = f"Parent for section '{section['name']}': "
                    msg += f"'{section['parent']}' does not exist"
                    raise ValueError(msg)
                section['parent'] = parent
            else:
                section['parent'] = None
            self._add_section(section)

        # Ensure exactly one root
        if not self.roots:
            raise ValueError("No root sections. At least one section" +
                             " must have no parent.")
        if len(self.roots) > 1:
            raise ValueError("Only 1 section can have no parents, " +
                             "not %s: %s", len(self.roots), self.roots)

        self.root = self.roots[0]

    def add_stimulus(self, section, loc, stim_type, name, parameters):
        """Add a new Point Process to the cell.

        Parameters
        ----------
        section : h.Section
            section to add stim
        loc : float
            Location on section to add stim
        stim_type: str
            Name of h.PointProcess or helper class
        params : kwargs
            Parameters for stim type

        """
        sec = self.sections[section]
        seg = sec(loc)

        if stim_type == "ACClamp":
            stim = ACClamp(seg, name, **parameters)

        else:
            stim = Stimulus(seg, stim_type, name, **parameters)

        self.stimuli.append(stim)


class Simulation:
    """Class to run and record a simulation of multiple cells.

    Attributes
    ----------
    cells : list of Cell objects
        Cells to be run in the simulation.
    """

    def __init__(self, cells=None, celsius=6.3):
        """Initialises simulation"""
        self.cells = cells or {}
        self.timevec = h.Vector().record(h._ref_t)
        self.ncs = []
        self.nc_spikes = []
        h.celsius = celsius
        logger.info("simulation cells: : %s", self.cells)

    @property
    def stimuli(self):
        """Return a list of all stimuli for all sections"""
        stims = []
        for cell in self.cells:
            stims += cell.stimuli
        return stims

    def run(self, potential=-65, runtime=25):
        """Run the simulation

        Parameters
        ----------
        potential : int, optional
            Resting membrane potential (mV)
        runtime : int, optional
            Time for simulation to run in ms
        """
        h.finitialize(potential * mV)
        data = {}
        for mech in ['cagk', 'hh2', 'CaT', 'kd', 'kext', 'cadifus']:
            data[mech] = glial.get_mech_globals(mech)

        h.continuerun(runtime * ms)

    def add_connection(self, source, target, section, loc, netcon,
                       syn_data):
        """Add a connection to the model"""
        # Get target section
        sec = target.get_sec(section)
        # Add synapse
        syn = getattr(h, syn_data['name'])
        syn = syn(sec(loc))
        for param, val in syn_data['params'].items():
            setattr(syn, param, val)
        target.syns.append(syn)

        source_sec = source.sections.get("Axon", source.root)
        con_type = syn_data['con_type']
        if con_type == 'netcon':
            con = h.NetCon(source_sec(1)._ref_v, syn, sec=source_sec)
            con.weight[0] = netcon['weight']
            con.delay = netcon['delay']
            con.threshold = netcon['threshold']
            nc_spike = h.Vector()
            con.record(nc_spike)
            self.nc_spikes.append(nc_spike)
            self.ncs.append(con)
        elif con_type == 'pointer':
            h.setpointer(source_sec(1)._ref_v, 'pre', syn)
        else:
            raise ValueError("Invalid connection type: {con_type}")

    @property
    def output(self):
        """Format output of simulation for plotting"""
        output = {}
        output['t'] = glial.compress_array(self.timevec.as_numpy())

        # TODO Output spikes
        output['nc_spikes'] = []
        for nc_spike in self.nc_spikes:
            output['nc_spikes'].append(nc_spike.to_python())

        # Views
        views = {}
        amp = {}
        for cell in self.cells.values():
            for key, record in cell.records.items():
                sim_record = views.get(key, {})
                sim_record[cell.name] = record
                views[key] = sim_record

            cell_stims = {}
            for stim in cell.stimuli:
                rec = glial.compress_array(stim.records['amp'].as_numpy())
                cell_stims[stim.name] = rec
            amp[cell.name] = cell_stims

        views['amp'] = amp

        output['views'] = views
        return output
