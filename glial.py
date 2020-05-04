"""
Glial
-----
Support functions for neuron (get it?)
"""
import json

import numpy as np
from neuron import h

"""
Data wrangling
-------------
"""


def compress_array(a, size=1000, frmt='list'):
    """Reduce length of array to size by interpolating"""
    frac = len(a) / size
    if frac < 1:
        out = a
    else:
        x_inds = np.arange(len(a))
        selected = x_inds[::int(frac)]
        out = np.interp(selected, x_inds, a)
    if frmt == "list":
        out = list(out)
    return out


"""
Mechanisms
----------
"""


def get_mech_globals(mechname, var=-1):
    ms = h.MechanismStandard(mechname, var)
    name = h.ref('')
    mech_globals = {}
    for j in range(ms.count()):
        ms.name(name, j)
        mech_globals[name[0]] = getattr(h, name[0])
    return mech_globals


def mech_global_params(outfile="spyke/static/spyke/globalparams.json"):
    """Create dict of all global parameters"""
    data = {}
    for mech in ['cagk', 'hh2', 'CaT', 'kd', 'kext', 'cadifus']:
        data[mech] = get_mech_globals(mech)
    if outfile:
        with open(outfile) as f:
            json.dump(data, f, indent=4)
    return data