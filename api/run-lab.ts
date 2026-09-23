import type{VercelRequest,VercelResponse}from'@vercel/node';
import evidenceBudget from'./_evidence-budget.js';import marbles from'./_marbles.js';
// Shared function for smaller Lab apps, to stay within the Vercel Hobby 12-function cap.
// Public URLs are unchanged: vercel.json rewrites /api/run-evidence-budget and /api/run-marbles here with ?app=.
const apps:Record<string,(req:VercelRequest,res:VercelResponse)=>unknown>={'evidence-budget':evidenceBudget,marbles};
export default async function handler(req:VercelRequest,res:VercelResponse){const app=String(req.query?.app||'');const h=apps[app];if(!h)return res.status(404).json({error:'unknown_app'});return h(req,res)}
