: Calcium activated K channel
NEURON {
SUFFIX cagk
USEION ca READ cai
USEION k READ ek WRITE ik
RANGE gkbar
GLOBAL oinf, tau
}
UNITS {
(mV) = (millivolt)
(mA) = (milliamp)
(S) = (siemens)
(molar) = (1/liter)
(mM) = (millimolar)
FARADAY = (faraday) (kilocoulombs)
R = (k-mole) (joule/degC)
}

PARAMETER {
gkbar = 0.01 (S/cm2)
d1 = 0.84
d2 = 1.0
k1 = 0.18 (mM)
k2 = 0.011 (mM)
bbar = 0.28 (/ms)
abar = 0.48 (/ms)
}
ASSIGNED {
cai (mM) : typically 0.001
celsius (degC) : typically 20
v (mV)
ek (mV)
ik (mA/cm2)
oinf
tau (ms)
}
STATE { o } : fraction of channels that are open
BREAKPOINT {
SOLVE state METHOD cnexp
ik = gkbar*o*(v - ek)
}
DERIVATIVE state {
rate(v, cai)
o' = (oinf - o)/tau
}
INITIAL {
rate(v, cai)
o = oinf
}
: the following are all callable from hoc
FUNCTION alp(v (mV), ca (mM)) (/ms) {
alp = abar/(1 + exp1(k1,d1,v)/ca)
}
FUNCTION bet(v (mV), ca (mM)) (/ms) {
bet = bbar/(1 + ca/exp1(k2,d2,v))
}
FUNCTION exp1(k (mM), d, v (mV)) (mM) {
: numeric constants in an addition or subtraction
: expression automatically take on the unit values
: of the other term
exp1 = k*exp(-2*d*FARADAY*v/R/(273.15 + celsius))
}

PROCEDURE rate(v (mV), ca (mM)) {
LOCAL a
: LOCAL variable takes on units of right hand side
a = alp(v,ca)
tau = 1/(a + bet(v, ca))
oinf = a*tau
}