// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md).
//
// lat/lng feed hooks/useNearby.js so "Where to study" can sort by real distance
// when a learner opts into location, and fall back to province when they don't.

import { KHETHA } from '../theme/tokens';

export const PROVIDER_TYPES = {
  university: "Traditional university",
  uot: "University of technology",
  tvet: "TVET college",
  cet: "Community education college",
};

export const TYPE_COLOR = { university: KHETHA.blue, uot: KHETHA.gold, tvet: KHETHA.red, cet: KHETHA.green };

export const PROVIDERS = [
  { id: "p1", name: "University of the Witwatersrand", type: "university", province: "Gauteng", city: "Johannesburg", phone: "011 717 1000", site: "wits.ac.za", nsfas: true, residence: true, lat: -26.1929, lng: 28.0305 },
  { id: "p2", name: "University of Johannesburg", type: "university", province: "Gauteng", city: "Johannesburg", phone: "011 559 4555", site: "uj.ac.za", nsfas: true, residence: true, lat: -26.1825, lng: 27.9977 },
  { id: "p3", name: "University of Pretoria", type: "university", province: "Gauteng", city: "Pretoria", phone: "012 420 3111", site: "up.ac.za", nsfas: true, residence: true, lat: -25.7545, lng: 28.2314 },
  { id: "p4", name: "Tshwane University of Technology", type: "uot", province: "Gauteng", city: "Pretoria", phone: "086 110 2421", site: "tut.ac.za", nsfas: true, residence: true, lat: -25.7320, lng: 28.1640 },
  { id: "p5", name: "Vaal University of Technology", type: "uot", province: "Gauteng", city: "Vanderbijlpark", phone: "016 950 9000", site: "vut.ac.za", nsfas: true, residence: true, lat: -26.7100, lng: 27.8600 },
  { id: "p6", name: "Durban University of Technology", type: "uot", province: "KwaZulu-Natal", city: "Durban", phone: "031 373 2000", site: "dut.ac.za", nsfas: true, residence: true, lat: -29.8500, lng: 31.0100 },
  { id: "p7", name: "Ekurhuleni West TVET College", type: "tvet", province: "Gauteng", city: "Germiston", phone: "011 323 1600", site: "ewc.edu.za", nsfas: true, residence: false, lat: -26.2180, lng: 28.1670 },
  { id: "p8", name: "South West Gauteng TVET College", type: "tvet", province: "Gauteng", city: "Soweto", phone: "011 989 8000", site: "swgc.co.za", nsfas: true, residence: false, lat: -26.2560, lng: 27.8770 },
  { id: "p9", name: "Tshwane North TVET College", type: "tvet", province: "Gauteng", city: "Pretoria", phone: "012 401 5000", site: "tnc.edu.za", nsfas: true, residence: false, lat: -25.7100, lng: 28.1900 },
  { id: "p10", name: "University of South Africa (Unisa)", type: "university", province: "National", city: "Distance learning", phone: "080 000 1870", site: "unisa.ac.za", nsfas: true, residence: false, lat: -25.7690, lng: 28.2020 },
  { id: "p11", name: "University of Cape Town", type: "university", province: "Western Cape", city: "Cape Town", phone: "021 650 9111", site: "uct.ac.za", nsfas: true, residence: true, lat: -33.9570, lng: 18.4610 },
  { id: "p12", name: "Gauteng Community Education & Training College", type: "cet", province: "Gauteng", city: "Multiple centres", phone: "011 355 0000", site: "dhet.gov.za", nsfas: false, residence: false, lat: -26.2041, lng: 28.0473 },
];

export const providerById = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]));
