
import { GoogleGenAI, Type } from "@google/genai";
import { KvpDs, SvcTp, ExtSysInf, NavRspDta, UsrIdyCtx, AeNavConfigReg } from "../types";

const CMP_NME = "Citibank demo business Inc";
const BSC_URL = "citibankdemobusiness.dev";

// Base interface class for simulated external calls
class SysIntfCtl {
  protected _sID: string;
  protected _sNm: string;

  constructor(sID: string, sNm: string) {
    this._sID = sID;
    this._sNm = sNm;
  }

  protected async simExtCl(prm: { ePNm: string; pLD?: any; pMs?: number }): Promise<any> {
    const { ePNm, pLD, pMs = 50 } = prm;
    const sTm = Math.floor(Math.random() * pMs) + 20;
    return new Promise(rs => setTimeout(() => { rs({ ePNm, pLD, tknMs: sTm, status: 'OK' }); }, sTm));
  }
}

// Observability System
export class ObsrvSysCpt extends SysIntfCtl {
  private static _i: ObsrvSysCpt;
  private _eLog: Array<{ tS: string; eNm: string; dTls?: any }> = [];
  private _eEnb: boolean;
  public extSvcRgs: ExtSysInf[] = [];

  private constructor(eEnb: boolean) {
    super("OBS_SYS_CPT_01", "Observability System Capture");
    this._eEnb = eEnb;
    this._intExtSvcRgs();
  }

  private _intExtSvcRgs(): void {
    this.extSvcRgs = [
      { sID: "ADOB_ANL", sNm: "Adobe Analytics", sTp: SvcTp.DTA_SGN, sEP: "https://logs.adobe.com/anl", sAct: true },
      { sID: "GOGL_ANL", sNm: "Google Analytics", sTp: SvcTp.DTA_SGN, sEP: "https://analytics.google.com/data", sAct: true },
      { sID: "GOGL_CLD_LOG", sNm: "Google Cloud Logging", sTp: SvcTp.CLD_INFRA, sEP: "https://logging.gcp.com/ingest", sAct: true },
      { sID: "AZUR_MNTR", sNm: "Azure Monitor", sTp: SvcTp.CLD_INFRA, sEP: "https://monitor.azure.com/log", sAct: true },
      { sID: "PIPD_DRM_EV", sNm: "Pipedream Event Bus", sTp: SvcTp.DEV_OPS, sEP: "https://api.pipedream.com/event", sAct: true },
      { sID: "GEMINI_AI", sNm: "Gemini Reasoning Engine", sTp: SvcTp.AIT_INT, sEP: "https://api.gemini.ai", sAct: true },
    ];
  }

  public static gInst(eEnb: boolean = true): ObsrvSysCpt {
    if (!ObsrvSysCpt._i) ObsrvSysCpt._i = new ObsrvSysCpt(eEnb);
    else ObsrvSysCpt._i._eEnb = eEnb;
    return ObsrvSysCpt._i;
  }

  public async recEv(eNm: string, dTls?: any): Promise<void> {
    const lEnt = { tS: new Date().toISOString(), eNm, dTls };
    this._eLog.push(lEnt);
    if (this._eLog.length > 100) this._eLog.shift();
    if (this._eEnb) {
      // Simulate remote logging
      await this.simExtCl({ ePNm: `https://${BSC_URL}/obsrv/log`, pLD: lEnt });
    }
  }

  public gRcntEv(cNt: number = 20): Array<any> {
    return this._eLog.slice(-cNt).reverse();
  }

  public async upSvcSt(sID: string, sAct: boolean): Promise<void> {
    const svc = this.extSvcRgs.find(s => s.sID === sID);
    if (svc) {
      const oSt = svc.sAct;
      svc.sAct = sAct;
      svc.lST = new Date().toISOString();
      await this.recEv("SVC_STAT_UPD", { sID, oSt, nSt: sAct });
    }
  }
}

// Auth Policy Enforcer
export class AuthPlcyEnf extends SysIntfCtl {
  private static _i: AuthPlcyEnf;
  private _eEnb: boolean;
  private _oSC: ObsrvSysCpt;

  private constructor(eEnb: boolean, oSC: ObsrvSysCpt) {
    super("AUTH_PLC_ENF_01", "Authorization Policy Enforcer");
    this._eEnb = eEnb;
    this._oSC = oSC;
  }

  public static gInst(eEnb: boolean = true, oSC?: ObsrvSysCpt): AuthPlcyEnf {
    if (!AuthPlcyEnf._i) {
      if (!oSC) throw new Error("ObsrvSysCpt must be provided");
      AuthPlcyEnf._i = new AuthPlcyEnf(eEnb, oSC);
    }
    return AuthPlcyEnf._i;
  }

  public async chkAuth(act: string, uCtx: UsrIdyCtx): Promise<boolean> {
    await this._oSC.recEv("AUTH_CHECK", { act, uID: uCtx.uID });
    if (!uCtx.uID) return false;
    const isPrm = uCtx.rLs?.includes("prm_usr") || uCtx.rLs?.includes("adm");
    return isPrm ? true : Math.random() > 0.2;
  }

  public async chkCmp(dTp: string, uLoc?: string): Promise<boolean> {
    await this._oSC.recEv("CMPL_CHECK", { dTp, uLoc });
    if (uLoc === "EU" && dTp === "nav_dta_prcs") return Math.random() > 0.1;
    return true;
  }
}

// Learning and Decision Engine
export class CtxLrnEng extends SysIntfCtl {
  private static _i: CtxLrnEng;
  private _oSC: ObsrvSysCpt;
  public systemLoad: number = 0.42;

  private constructor(oSC: ObsrvSysCpt) {
    super("CTX_LRN_ENG_01", "Context Learning Engine");
    this._oSC = oSC;
  }

  public static gInst(oSC?: ObsrvSysCpt): CtxLrnEng {
    if (!CtxLrnEng._i) {
      if (!oSC) throw new Error("ObsrvSysCpt required");
      CtxLrnEng._i = new CtxLrnEng(oSC);
    }
    return CtxLrnEng._i;
  }

  public async adptNPrd(cTx: any): Promise<AeNavConfigReg> {
    this.systemLoad = Math.random();
    await this._oSC.recEv("CTX_ADAPT_INIT", { load: this.systemLoad });
    return {
      fTrLs: { "nuNav": this.systemLoad < 0.9, "ab_tst_v": true },
      pthPrr: { "dash": 10, "rpt": 8, "stgs": 5 },
      obsrvEnb: true,
      scrChckEnb: true,
      dynPthEnb: true,
      aIBaSdRt: { "def": "/dash" },
    };
  }
}

// Predictive Reasoning System using Gemini API
export class PrdctRsnSys extends SysIntfCtl {
  private static _i: PrdctRsnSys;

  private constructor(private cM: CtxLrnEng, private oSC: ObsrvSysCpt, private aPE: AuthPlcyEnf) {
    super("PRD_RSN_SYS_01", "Predictive Reasoning System");
  }

  public static gInst(cM?: CtxLrnEng, oSC?: ObsrvSysCpt, aPE?: AuthPlcyEnf): PrdctRsnSys {
    if (!PrdctRsnSys._i) {
      if (!cM || !oSC || !aPE) throw new Error("AetherNav agents must be provided");
      PrdctRsnSys._i = new PrdctRsnSys(cM, oSC, aPE);
    }
    return PrdctRsnSys._i;
  }

  public async mkNavDs(prmpt: string, uCtx: UsrIdyCtx): Promise<NavRspDta> {
    await this.oSC.recEv("NAV_DS_INIT", { uID: uCtx.uID });
    
    const auth = await this.aPE.chkAuth("acsNuNav", uCtx);
    const cmp = await this.aPE.chkCmp("nav_dta_prcs", uCtx.loc);
    const rules = await this.cM.adptNPrd({ uID: uCtx.uID });

    if (!auth || !cmp) {
      return { 
        isNwNavAct: false, 
        dSc: "Security or Compliance policy denied new navigation access.", 
        cnfdSc: 0.95 
      };
    }

    // Call Gemini for complex reasoning simulation
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure use of the correct API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Evaluate system context: User Role: ${uCtx.rLs?.join(',')}, Location: ${uCtx.loc}, System Load: ${this.cM.systemLoad}. Determine if 'New Navigation Experience' should be enabled. Return a short JSON object with 'decision' (boolean) and 'reasoning' (string).`,
        config: { 
          responseMimeType: "application/json",
          // Use responseSchema for predictable structured output as per guidelines.
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              decision: {
                type: Type.BOOLEAN,
                description: 'Final decision on enabling new navigation.'
              },
              reasoning: {
                type: Type.STRING,
                description: 'Explanation for the navigation decision.'
              }
            },
            required: ["decision", "reasoning"]
          }
        }
      });
      
      // Accessing text as a property on the response object.
      const aiResponse = JSON.parse(result.text || '{"decision": true, "reasoning": "Standard system approval"}');
      
      const ds = {
        isNwNavAct: aiResponse.decision && rules.fTrLs["nuNav"],
        dSc: aiResponse.reasoning,
        cnfdSc: 0.85,
        fTrCtx: { load: this.cM.systemLoad, auth: "GRANTED" }
      };
      await this.oSC.recEv("NAV_DS_COMPLETE", ds);
      return ds;
    } catch (e) {
      return {
        isNwNavAct: rules.fTrLs["nuNav"],
        dSc: "AI reasoning failed. Defaulting to local heuristics.",
        cnfdSc: 0.5
      };
    }
  }
}

// Orchestrator Service
export class AetherNavSrv extends SysIntfCtl {
  private static _i: AetherNavSrv;
  public dE: PrdctRsnSys;
  public cM: CtxLrnEng;
  public oSC: ObsrvSysCpt;
  public aPE: AuthPlcyEnf;

  private constructor() {
    super("AETH_NAV_SRV_01", "Aether Navigation Service");
    this.oSC = ObsrvSysCpt.gInst();
    this.cM = CtxLrnEng.gInst(this.oSC);
    this.aPE = AuthPlcyEnf.gInst(true, this.oSC);
    this.dE = PrdctRsnSys.gInst(this.cM, this.oSC, this.aPE);
  }

  public static gInst(): AetherNavSrv {
    if (!AetherNavSrv._i) AetherNavSrv._i = new AetherNavSrv();
    return AetherNavSrv._i;
  }

  public async gNavSt(uCtx: UsrIdyCtx): Promise<NavRspDta> {
    return this.dE.mkNavDs("Evaluate New Nav Eligibility", uCtx);
  }
}
