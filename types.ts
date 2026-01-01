
export interface KvpDs { [k: string]: string | string[] | undefined; }

export enum SvcTp {
  AIT_INT = "ait_int",
  DTA_SGN = "dta_sgn",
  SEC_PLI = "sec_pli",
  FIN_OPR = "fin_opr",
  E_COM_INT = "e_com_int",
  CLD_INFRA = "cld_infra",
  DEV_OPS = "dev_ops",
  CRM_SVC = "crm_svc",
  COM_NTF = "com_ntf",
  OTH_SVC = "oth_svc"
}

export interface ExtSysInf {
  sID: string;
  sNm: string;
  sTp: SvcTp;
  sEP: string;
  sAct: boolean;
  lST?: string;
  latency?: number;
}

export interface NavRspDta {
  isNwNavAct: boolean;
  dSc: string;
  sugPth?: string;
  cnfdSc: number;
  fTrCtx?: { [k: string]: any };
}

export interface UsrIdyCtx {
  uID?: string;
  rLs?: string[];
  tID?: string;
  loc?: string;
  sID?: string;
}

export interface AeNavConfigReg {
  fTrLs: { [k: string]: boolean };
  pthPrr: { [k: string]: number };
  obsrvEnb: boolean;
  scrChckEnb: boolean;
  dynPthEnb: boolean;
  aIBaSdRt: { [k: string]: string };
}
