import { AppState, Chapter, SubjectColumnNames, Weightage } from './types';

const createChapter = (name: string, weight: Weightage = 'med'): Chapter => ({
  id: crypto.randomUUID(),
  name,
  weightage: weight,
  progress: [false, false, false],
  todaysTasks: [false, false, false],
});

export const INITIAL_DATA: AppState = {
  physics: [
    "Units & Dimensions", "Kinematics", "Laws of Motion", "WPE & Circular", 
    "COM & Collision", "Rotational Motion", "Gravitation", "SHM", 
    "Solids & Fluids", "Thermodynamics", "KTG", "Waves", "Electrostatics", 
    "Capacitors", "Current Electricity", "Magnetism", "EMI & AC", 
    "Ray Optics", "Wave Optics", "Modern Physics", "Semiconductors"
  ].map(name => createChapter(name)),
  math: [
    "3D Geometry", "Vectors", "Matrices & Det", "Sequences", "Functions", 
    "Limits & Continuity", "Differentiation", "AOD", "Indefinite Integration", 
    "Definite Integration", "Area Under Curve", "Differential Eq", 
    "Straight Lines", "Circles", "Conic Sections", "P & C", "Probability", 
    "Complex Numbers", "Binomial Theorem", "Sets & Relations", 
    "Trigonometry", "Statistics"
  ].map(name => createChapter(name)),
  chemistry: [
    "GOC", "Hydrocarbons", "Haloalkanes", "Alcohol & Phenol", 
    "Aldehydes & Ketones", "Amines", "Biomolecules", "Coordination Comp", 
    "d & f Block", "p Block", "Chemical Bonding", "Periodic Table", 
    "Atomic Structure", "Mole Concept", "Thermodynamics", "Equilibrium", 
    "Electrochemistry", "Redox", "Solutions", "Practical Chem"
  ].map(name => createChapter(name))
};

export const INITIAL_COLUMN_NAMES: SubjectColumnNames = {
  physics: { col1: 'Theory', col2: 'Practice', col3: 'PYQs' },
  math: { col1: 'Theory', col2: 'Practice', col3: 'PYQs' },
  chemistry: { col1: 'Theory', col2: 'Practice', col3: 'PYQs' },
};

export const WEIGHTAGE_COLORS = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
  med: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
};

export const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "There are no shortcuts to any place worth going.",
  "JEE is not just an exam, it's a journey of self-discipline.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your only limit is you.",
  "Work hard in silence, let your success be your noise.",
  "Consistency is the key to cracking JEE.",
  "Dream big. Work hard. Stay focused.",
  "It always seems impossible until it's done.",
  "Believe you can and you're halfway there.",
  "Focus on the process, not just the result.",
  "Every problem you solve is a step closer to your dream college.",
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "Fall seven times, stand up eight.",
  "The future belongs to those who prepare for it today."
];