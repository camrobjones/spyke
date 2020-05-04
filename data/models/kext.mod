: Extracellular potassium ion accumulation
NEURON {
 SUFFIX kext
 USEION k READ ik WRITE ko
 GLOBAL kbath
 RANGE fhspace, txfer
}
UNITS {
 (mV) = (millivolt)
 (mA) = (milliamp)
 FARADAY = (faraday) (coulombs)
 (molar) = (1/liter)
 (mM) = (millimolar)
}
PARAMETER {
 kbath = 10 (mM) : seawater (squid axon!)
 fhspace = 300 (angstrom) : effective thickness of F-H space
 txfer = 50 (ms) : tau for F-H space <-> bath exchange = 30-100
}
ASSIGNED { ik (mA/cm2) }
STATE { ko (mM) }
BREAKPOINT { SOLVE state METHOD cnexp }
DERIVATIVE state {
 ko' = (1e8)*ik/(fhspace*FARADAY) + (kbath - ko)/txfer
}