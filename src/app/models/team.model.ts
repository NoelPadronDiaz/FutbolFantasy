export interface Team {
  name: string;
  crest: string;
}

const BADGE_BASE = 'https://r2.thesportsdb.com/images/media/team/badge';

export const LALIGA_TEAMS: Team[] = [
  { name: 'Real Madrid', crest: `${BADGE_BASE}/vwvwrw1473502969.png` },
  { name: 'FC Barcelona', crest: `${BADGE_BASE}/k4zo0k1641767927.png` },
  { name: 'Atlético de Madrid', crest: `${BADGE_BASE}/0ulh3q1719984315.png` },
  { name: 'Athletic Club', crest: `${BADGE_BASE}/68w7fe1639408210.png` },
  { name: 'Villarreal', crest: `${BADGE_BASE}/vrypqy1473503073.png` },
  { name: 'Real Betis', crest: `${BADGE_BASE}/2oqulv1663245386.png` },
  { name: 'Real Sociedad', crest: `${BADGE_BASE}/vptvpr1473502986.png` },
  { name: 'Sevilla FC', crest: `${BADGE_BASE}/vpsqqx1473502977.png` },
  { name: 'Valencia CF', crest: `${BADGE_BASE}/dm8l6o1655594864.png` },
  { name: 'Celta de Vigo', crest: `${BADGE_BASE}/xfjtku1690436219.png` },
  { name: 'Rayo Vallecano', crest: `${BADGE_BASE}/nzhu941655595465.png` },
  { name: 'Getafe CF', crest: `${BADGE_BASE}/eyh2891655594452.png` },
  { name: 'Osasuna', crest: `${BADGE_BASE}/rvspvt1473502960.png` },
  { name: 'RCD Espanyol', crest: `${BADGE_BASE}/867nzz1681703222.png` },
  { name: 'Deportivo Alavés', crest: `${BADGE_BASE}/0aaifo1734673843.png` },
  { name: 'Levante UD', crest: `${BADGE_BASE}/xwtxsx1473503739.png` },
  { name: 'Elche CF', crest: `${BADGE_BASE}/e4vaw51655594332.png` },
  { name: 'Málaga CF', crest: `${BADGE_BASE}/upqyvr1473502952.png` },
  { name: 'RC Deportivo', crest: `${BADGE_BASE}/62bvwv1783013156.png` },
  { name: 'Racing de Santander', crest: `${BADGE_BASE}/97kkiq1536575158.png` },
];

export function findTeamCrest(name: string | undefined): string | undefined {
  return LALIGA_TEAMS.find((t) => t.name === name)?.crest;
}
