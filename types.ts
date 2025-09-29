export interface Skill {
  id: string;
  name: string;
}

export interface Internship {
  id: number;
  title: string;
  organization: string;
  location: string;
  stipend?: string;
  duration: string;
  skills: string[];
  applyLink: string;
}

export interface UserData {
  name: string;
  email?: string;
  skills: Skill[];
}

export interface MatchedInternship extends Internship {
  matchScore: number;
}
