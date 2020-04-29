#include <stdio.h>
#include "hocdec.h"
extern int nrnmpi_myid;
extern int nrn_nobanner_;

extern void _Nap_Et2_reg(void);
extern void _caL3d_reg(void);
extern void _cadifus_reg(void);
extern void _cagk_reg(void);
extern void _cat_reg(void);
extern void _hh2_reg(void);
extern void _k3st_reg(void);
extern void _kd_reg(void);
extern void _kext_reg(void);

void modl_reg(){
  if (!nrn_nobanner_) if (nrnmpi_myid < 1) {
    fprintf(stderr, "Additional mechanisms from files\n");

    fprintf(stderr," Nap_Et2.mod");
    fprintf(stderr," caL3d.mod");
    fprintf(stderr," cadifus.mod");
    fprintf(stderr," cagk.mod");
    fprintf(stderr," cat.mod");
    fprintf(stderr," hh2.mod");
    fprintf(stderr," k3st.mod");
    fprintf(stderr," kd.mod");
    fprintf(stderr," kext.mod");
    fprintf(stderr, "\n");
  }
  _Nap_Et2_reg();
  _caL3d_reg();
  _cadifus_reg();
  _cagk_reg();
  _cat_reg();
  _hh2_reg();
  _k3st_reg();
  _kd_reg();
  _kext_reg();
}
