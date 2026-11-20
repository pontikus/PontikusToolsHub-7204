// Scoped styles for the Starter widgets. Everything sits under .pkst so the snippet
// cannot restyle the Brilliant Directories page it is pasted into.
export const css = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Fraunces:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap");
.pkst{--n:#0b1f3b;--g:#c6a04a;--c:#f7f3eb;--p:#fffdf8;--m:#586474;--l:#ddd9ce;--weak:#b5532f;
  font-family:Archivo,system-ui,sans-serif;color:var(--n);background:var(--c);padding:28px;border:1px solid var(--l);border-radius:3px;box-sizing:border-box;max-width:1180px;margin:0 auto;line-height:1.6}
.pkst *,.pkst *::before,.pkst *::after{box-sizing:border-box}
.pkst h2,.pkst h3,.pkst h4{font-family:Fraunces,Georgia,serif;font-weight:400;margin:0;color:var(--n)}
.pkst p{margin:0}
.pkst h3{font-size:22px;line-height:1.3}
.pkst h4{font-size:18px;line-height:1.3}
.pkst-form-title{margin-bottom:18px !important}
.pkst-eyebrow{font:500 11px "IBM Plex Mono",monospace;letter-spacing:1.5px;color:#7a6634}
.pkst-intro{margin:8px 0 22px !important;max-width:680px;color:var(--m);font-size:15px}
.pkst-columns{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:28px;align-items:start}
.pkst-form,.pkst-result,.pkst-ladder{background:var(--p);border:1px solid var(--l);border-radius:3px;padding:22px}
.pkst-result{position:sticky;top:20px}
.pkst-field{display:flex;flex-direction:column;gap:6px;margin:0 0 20px;border:0;padding:0;min-width:0}
.pkst-label{font-size:13px;font-weight:600;padding:0}
.pkst-label output{font:500 13px "IBM Plex Mono",monospace;margin-left:6px}
.pkst-hint{font-size:12px;color:var(--m)}
.pkst input[type=range]{width:100%;accent-color:var(--n);min-height:44px;margin:0}
.pkst-scale-ends{display:flex;justify-content:space-between;font:10px "IBM Plex Mono",monospace;color:var(--m)}
.pkst input[type=number],.pkst input[type=text],.pkst input[type=time],.pkst input[type=date],.pkst input[type=tel]{width:100%;min-height:46px;padding:10px 12px;border:1px solid #c9c9be;border-radius:3px;background:#fffefb;color:var(--n);font:inherit;font-size:14px}
.pkst select{width:100%;min-height:46px;padding:10px 12px;border:1px solid #c9c9be;border-radius:3px;background:#fffefb;color:var(--n);font:inherit;font-size:14px}
.pkst :focus-visible{outline:3px solid #006cc3;outline-offset:3px}
.pkst-choices{display:flex;flex-wrap:wrap;gap:8px}
.pkst-choice{min-height:44px;padding:10px 14px;border:1px solid #bfc2b7;border-radius:3px;background:var(--c);color:var(--n);font:inherit;font-size:13px;cursor:pointer}
.pkst-choice.is-on{background:var(--n);border-color:var(--n);color:var(--c)}
.pkst-months{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.pkst-months label{display:flex;flex-direction:column;gap:4px;font:500 11px "IBM Plex Mono",monospace}
.pkst-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pkst-score{display:flex;align-items:baseline;gap:8px;margin:4px 0 6px}
.pkst-score strong{font:400 56px/1 Fraunces,Georgia,serif}
.pkst-score span{font:12px "IBM Plex Mono",monospace;color:var(--m)}
.pkst-band{display:inline-block;font:500 11px "IBM Plex Mono",monospace;letter-spacing:1px;padding:4px 8px;border-radius:2px;background:#e9e3d3}
.pkst-band.low{background:#f3dcd2;color:#7d3018}.pkst-band.high{background:#dbe8df;color:#24513f}
.pkst-fix{margin-top:18px;padding:16px;border-left:3px solid var(--weak);background:#fbf3ee}
.pkst-fix h4{font-size:18px;margin-bottom:4px}
.pkst-fix p{font-size:14px}
.pkst-wheel{width:100%;max-width:360px;display:block;margin:6px auto 0}
.pkst-wheel text{font:11px "IBM Plex Mono",monospace;fill:var(--m)}
.pkst-wedge-bg{fill:#efeadf}
.pkst-wedge{fill:var(--n)}
.pkst-wedge.is-weak{fill:var(--weak)}
.pkst-check{list-style:none;padding:0;margin:8px 0 0}
.pkst-check h4{font-size:16px;margin:16px 0 6px}
.pkst-check label{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #eee8db;font-size:14px;min-height:44px;cursor:pointer}
.pkst-check input{width:20px;height:20px;margin:2px 0 0;accent-color:var(--n);flex:none}
.pkst-check input:checked+span{color:var(--m);text-decoration:line-through}
.pkst-progress{font:12px "IBM Plex Mono",monospace;color:var(--m)}
.pkst-bars{list-style:none;padding:0;margin:14px 0 0}
.pkst-bars li{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;font:12px "IBM Plex Mono",monospace;padding:3px 0}
.pkst-bar{height:12px;background:#efeadf;position:relative;border-radius:1px;overflow:hidden}
.pkst-bar i{position:absolute;inset:0 auto 0 0;background:var(--n)}
.pkst-bar b{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--g)}
.pkst-bars li.is-worst .pkst-bar i{background:var(--weak)}
.pkst-legend{font:10px "IBM Plex Mono",monospace;color:var(--m);margin-top:6px}
.pkst-yesno{display:flex;gap:8px;margin-top:4px}
.pkst-fixes{padding-left:20px;margin:10px 0 0}
.pkst-fixes li{margin:0 0 12px;font-size:14px}
.pkst-fixes a,.pkst-link{color:#0b4f8a;text-decoration:underline}
.pkst-after{margin-top:24px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center}
.pkst-ladder{margin:0}
.pkst-ladder h3{font-size:20px;margin-bottom:10px}
.pkst-ladder ol{list-style:none;padding:0;margin:0}
.pkst-ladder li{display:grid;grid-template-columns:150px 1fr auto;gap:12px;padding:10px 0;border-top:1px solid #eee8db;font-size:13px;align-items:center}
.pkst-ladder li.is-current{font-weight:600}
.pkst-level{font:500 11px "IBM Plex Mono",monospace;letter-spacing:.5px}
.pkst-tag{font:10px "IBM Plex Mono",monospace;color:var(--m);white-space:nowrap}
.pkst-ladder li.is-current .pkst-tag{color:#24513f}
.pkst-button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 22px;border-radius:3px;font:600 14px Archivo,sans-serif;text-decoration:none;background:var(--n);color:var(--c) !important;border:0}
.pkst-gold{background:var(--g);color:var(--n) !important}
.pkst-note{font-size:13px;color:var(--m);margin-top:14px !important}
.pkst-gate h3{font-size:26px;margin-top:6px}
.pkst-gate-actions{display:flex;flex-wrap:wrap;gap:12px}
.pkst-upgrade{color:#0b4f8a !important;text-decoration:underline;font-weight:600}
.pkst-tips{list-style:none;padding:0;margin:14px 0 0}
.pkst-tips li{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;padding:10px 0;border-top:1px solid #eee8db;font-size:14px}
.pkst-tips b{font-weight:600}
.pkst-tips span{font:12px "IBM Plex Mono",monospace;color:var(--m);grid-row:span 2;padding-top:2px;min-width:38px}
.pkst-tips li.is-weak span{color:var(--weak)}
.pkst-saved{margin-top:18px;border-top:1px solid var(--l);padding-top:14px}
.pkst-saved ul{list-style:none;padding:0;margin:10px 0 0}
.pkst-saved li{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #eee8db}
.pkst-saved li>span{font-family:"IBM Plex Mono",monospace;font-size:12px}
.pkst-small{min-height:36px;padding:6px 12px;border:1px solid #bfc2b7;border-radius:3px;background:var(--c);color:var(--n);font:inherit;font-size:12px;cursor:pointer}
.pkst-list{padding-left:20px;margin:8px 0 0}
.pkst-list li{margin:0 0 6px;font-size:14px}
.pkst-timeline{list-style:none;padding:0;margin:14px 0 0}
.pkst-timeline li{display:grid;grid-template-columns:56px 1fr;gap:10px;padding:7px 0;border-top:1px solid #eee8db;font-size:14px}
.pkst-timeline span{font:500 13px "IBM Plex Mono",monospace}
.pkst-copy{margin-top:8px}
.pkst-copy pre{white-space:pre-wrap;word-break:break-word;background:var(--c);border:1px solid var(--l);border-radius:3px;padding:14px;font:12px/1.6 "IBM Plex Mono",monospace;margin:0 0 10px;max-height:420px;overflow:auto}
.pkst-day{border:0;border-top:1px solid var(--l);padding:14px 0 0;margin:0 0 6px;min-width:0}
.pkst-day:first-of-type{border-top:0;padding-top:0}
.pkst-day>legend{padding:0 0 8px;font-family:"IBM Plex Mono",monospace;letter-spacing:1px;font-size:11px;text-transform:uppercase}
.pkst-row3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.pkst-have{margin:0}
.pkst-have label{min-height:40px;padding:6px 0}
.pkst-have input:checked+span{color:var(--n);text-decoration:none}
.pkst-bars-wide li{grid-template-columns:64px 1fr auto}
.pkst-form>.pkst-button{width:100%;cursor:pointer}
.pkst textarea{width:100%;padding:10px 12px;border:1px solid #c9c9be;border-radius:3px;background:#fffefb;color:var(--n);font:inherit;font-size:14px;resize:vertical}
.pkst-learners{list-style:none;padding:0;margin:8px 0 0}
.pkst-learners>li{padding:12px 0;border-top:1px solid #eee8db}
.pkst-learner{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pkst-learner span{font:12px "IBM Plex Mono",monospace;color:var(--m);margin-right:auto}
.pkst-learners .pkst-choice{min-height:36px;padding:6px 10px;font-size:12px}
.pkst-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.pkst-week label{display:flex;flex-direction:column;gap:4px;font:500 11px "IBM Plex Mono",monospace}
.pkst-week input{padding-left:6px;padding-right:4px}
.pkst-days{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pkst-days label{display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:4px 8px;border:1px solid #c9c9be;border-radius:3px;font:12px "IBM Plex Mono",monospace;cursor:pointer}
.pkst-days input{margin:0;accent-color:var(--n)}
.pkst-privacy{font-size:12px;color:var(--m);margin-top:18px !important}
@media (max-width:860px){
  .pkst{padding:18px 16px}
  .pkst-columns,.pkst-after{grid-template-columns:minmax(0,1fr)}
  .pkst-result{position:static}
  .pkst-ladder li{grid-template-columns:1fr auto}
  .pkst-ladder li>span:nth-child(2){grid-column:1/-1;grid-row:2}
}
@media (max-width:420px){.pkst-months{grid-template-columns:repeat(2,minmax(0,1fr))}.pkst-week{grid-template-columns:repeat(4,minmax(0,1fr))}.pkst-row2{grid-template-columns:1fr}.pkst-row3{grid-template-columns:1fr 1fr 1fr}}
`;
