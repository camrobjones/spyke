: Calcium ion accumulation with radial and longitudinal diffusion
NEURON {
SUFFIX cadifus
USEION ca READ cai, ica WRITE cai
GLOBAL vrat, TotalBuffer : vrat must be GLOBAL--see INITIAL block
 : however TotalBuffer may be RANGE
}
DEFINE Nannuli 4

UNITS {
(molar) = (1/liter)
(mM) = (millimolar)
(um) = (micron)
(mA) = (milliamp)
FARADAY = (faraday) (10000 coulomb)
PI = (pi) (1)
}
PARAMETER {
DCa = 0.6 (um2/ms)
k1buf = 100 (/mM-ms) : Yamada et al. 1989
k2buf = 0.1 (/ms)
TotalBuffer = 0.003 (mM)
}
ASSIGNED {
diam (um)
ica (mA/cm2)
cai (mM)
vrat[Nannuli] : numeric value of vrat[i] equals the volume
 : of annulus i of a 1um diameter cylinder
 : multiply by diam^2 to get volume per um length
Kd (/mM)
B0 (mM)
}
STATE {
: ca[0] is equivalent to cai
: ca[] are very small, so specify absolute tolerance
ca[Nannuli] (mM) <1e-10>
CaBuffer[Nannuli] (mM)
Buffer[Nannuli] (mM)
}
BREAKPOINT { SOLVE state METHOD sparse }
LOCAL factors_done
INITIAL {
 if (factors_done == 0) { : flag becomes 1 in the first segment
 factors_done = 1 : all subsequent segments will have
 factors() : vrat = 0 unless vrat is GLOBAL
 }
Kd = k1buf/k2buf
B0 = TotalBuffer/(1 + Kd*cai)
FROM i=0 TO Nannuli-1 {
ca[i] = cai
Buffer[i] = B0
CaBuffer[i] = TotalBuffer - B0
}
}

LOCAL frat[Nannuli] : scales the rate constants for model geometry
PROCEDURE factors() {
LOCAL r, dr2
r = 1/2 : starts at edge (half diam)
dr2 = r/(Nannuli-1)/2 : full thickness of outermost annulus,
 : half thickness of all other annuli
vrat[0] = 0
frat[0] = 2*r
FROM i=0 TO Nannuli-2 {
vrat[i] = vrat[i] + PI*(r-dr2/2)*2*dr2 : interior half
r = r - dr2
frat[i+1] = 2*PI*r/(2*dr2) : outer radius of annulus
 : div by distance between centers
r = r - dr2
vrat[i+1] = PI*(r+dr2/2)*2*dr2 : outer half of annulus
}
}
LOCAL dsq, dsqvol : can't define local variable in KINETIC block
 : or use in COMPARTMENT statement
KINETIC state {
COMPARTMENT i, diam*diam*vrat[i] {ca CaBuffer Buffer}
LONGITUDINAL_DIFFUSION i, DCa*diam*diam*vrat[i] {ca}
~ ca[0] << (-ica*PI*diam/(2*FARADAY)) : ica is Ca efflux
FROM i=0 TO Nannuli-2 {
~ ca[i] <-> ca[i+1] (DCa*frat[i+1], DCa*frat[i+1])
}
dsq = diam*diam
FROM i=0 TO Nannuli-1 {
dsqvol = dsq*vrat[i]
~ ca[i] + Buffer[i] <-> CaBuffer[i] (k1buf*dsqvol, k2buf*dsqvol)
}
cai = ca[0]
}