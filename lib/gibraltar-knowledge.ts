// Curated background on Gibraltar public services. Verified 2026-10-16 from the sources listed.
// Sources: gibraltar.gov.gi (Income Tax Office, contacts, arrears, social insurance, Department of
// Employment, Housing), gea.gi, aquagib.gi, gha.gi, cab.gi, gra.gi, boe.es (UK–Spain tax agreement
// on Gibraltar), exteriores.gob.es (EU–UK agreement on Gibraltar, 2026).
export const GIBRALTAR_GUIDE = `# Gibraltar public services: background for explaining letters

Only use these facts as background. Always prefer what the letter itself says (amounts, deadlines, reference numbers). If unsure, tell the person to contact the office named on the letter or Citizens Advice.

## Income tax (Income Tax Office, HM Government of Gibraltar)
- Income tax is run by the Income Tax Office under the Income Tax Act 2010.
- The tax year ("year of assessment") runs from 1 July to 30 June the next year.
- Individuals can be taxed under the Allowance Based System (ABS: allowances are deducted first, then rates apply) or the Gross Income Based System (GIBS: rates apply to gross income, with only a few limited deductions such as mortgage interest, approved pension contributions and approved medical insurance).
- PAYE: employees have tax deducted from pay by their employer, who passes it to the Government.
- Tax returns must now be submitted electronically; paper returns are no longer accepted.
- If a letter is an assessment you disagree with, contact the Income Tax Office promptly and check the letter for any appeal deadline. Do not ignore it.
- Official emails (from the Income Tax Office contacts page): PAYE general enquiries paye.enquiries@gibraltar.gov.gi; PAYE assessment queries paye.assessments@gibraltar.gov.gi; payments and refunds tax.accountsenquiries@gibraltar.gov.gi; self-employed selfemployed@gibraltar.gov.gi; leaving Gibraltar (final assessment) paye.leavinggib@gibraltar.gov.gi.
- Arrears (tax or social security debts): individuals in arrears can ask about payment plans at pia@gibraltar.gov.gi. The arrears page also lists T: 20045632, E: cau@gibraltar.gov.gi.

## Social insurance contributions
- Anyone employed or self-employed in Gibraltar is generally compulsorily insured and must pay social insurance contributions.
- Contributions are earnings-related, with a weekly minimum and maximum.
- Contributions are handled by the Income Tax Office (Social Insurance Contributions Section): sicontributions@gibraltar.gov.gi. S1 certificate (healthcare cover) enquiries: s1@gibraltar.gov.gi.
- Benefits (as opposed to contributions) are handled by the Department of Social Security.

## Employment (Department of Employment)
- Every job must be registered: employers file a Notice of Terms of Engagement with the Department of Employment for ALL workers, and a termination notice when a job ends.
- Pay cannot be below the Standard Minimum Wage, and employers must give a wage slip with each payment.
- The first week of a contract is a probationary period during which either side can end it without notice.
- People not entitled to work in Gibraltar need a work permit before starting.
- Department of Employment: Unit 75/77, Harbours Walk, New Harbours, Gibraltar GX11 1AA. Main office: 200 11000.
- Workplace disputes (e.g. dismissal) can go to the Employment Tribunal. Claims have short time limits, so get advice quickly (Citizens Advice).

## Housing
- The Housing Department (Ministry for Housing) administers public housing: allocation, rent collection, maintenance and repairs.
- For rent or arrears letters, contact the Housing Department using the details on the letter or on gibraltar.gov.gi, and get free advice from Citizens Advice if you are struggling to pay.

## Electricity (Gibraltar Electricity Authority, GEA)
- The GEA is the only electricity utility provider in Gibraltar (a Government authority).
- Bills are due on demand. If a bill is not paid within 60 days of issue, or a payment-plan instalment is missed, supply may be disconnected; reconnection requires paying the debt plus administrative costs.
- If you are struggling to pay, contact GEA early: (+350) 20049235 or arrears@gea.gi. Tell them if you rely on electrically powered medical/disability equipment, receive Social Assistance, or have had a major change in circumstances. Payment plans are confirmed in writing.
- General queries: consumer@gea.gi, +350 20075957 (Mon–Thu 08:30–15:00, Fri 08:30–14:30). Pay by phone with a card on (+350) 20041288 ext. 1, by Direct Debit, online via paperless bill links, or in person at AquaGib Limited's offices.

## Water (AquaGib Ltd)
- AquaGib provides water services in Gibraltar (meters, connections, bills).
- Customer Services: +350 200 41288, customerservice@aquagib.gi. 24-hour fault reports: +350 200 73659.
- Office: Suite 10b Leanse Place, 50 Town Range, Gibraltar (Mon–Thu 08:30–15:00, Fri 08:30–14:30).

## Health (Gibraltar Health Authority, GHA)
- The Group Practice Medical Scheme (GPMS) gives entitled people and their dependants healthcare at no charge. Entitled: insured persons (social insurance contributors) and their dependants, and people ordinarily resident in Gibraltar.
- Prescriptions cost £5 per item (maximum £15). Adult dental care is emergency only.
- Register or renew a GHA card online via eGov or with paper forms; incomplete applications are not accepted.
- Primary care appointments: 20052441. Urgent medical advice: 111.

## Cross-border (frontier) workers living in Spain
- The UK–Spain International Agreement on taxation concerning Gibraltar was signed on 4 March 2019 and entered into force on 4 March 2021 (published in Spain's BOE on 13 March 2021).
- If someone counts as tax resident in both Spain and Gibraltar, it treats them as resident only in Spain if, for example: they spend more than 183 nights a year in Spain; their spouse/partner or dependants live in Spain; their only permanent home is in Spain; or two-thirds of their net assets are in Spain.
- Spanish nationals who moved their residence to Gibraltar after 4 March 2019 are always treated as tax resident only in Spain.
- Employees working in Gibraltar have tax deducted by their employer through PAYE. The Government of Gibraltar said when the agreement was signed that cross-frontier workers benefit from the elimination of double taxation. Whether and how to declare Gibraltar income in Spain is a Spanish tax question: refer people to the Agencia Tributaria or a qualified adviser.
- The EU–UK agreement on Gibraltar was signed on 14 July 2026 and applies provisionally from 15 July 2026 (pending European Parliament ratification). It provides for free movement between the Campo de Gibraltar and Gibraltar with no passport checks, specific protection measures for cross-border workers and stronger social security coordination. Details for individuals were not yet set out in the official summary, so do not guess.

## Free advice and complaints
- Citizens Advice Bureau Gibraltar: 10A Governor's Lane. Tel: 00350 200 40006. Email: info@cab.gi. GEA refers people with debts to the CAB's Money Advice clinic for free, independent advice.
- Data protection: the Gibraltar Regulatory Authority (GRA) is the Information Commissioner. It enforces the Gibraltar GDPR and the Data Protection Act 2004 and investigates complaints. GRA, 2nd floor, Eurotowers 4, 1 Europort Road, Gibraltar. Phone (+350) 20074636. Email info@gra.gi.
`;

export type HelpLink = { id: string; name: string; nameEs: string; url: string; topics: string };

export const HELP_LINKS: HelpLink[] = [
  {
    id: "income_tax_office",
    name: "Income Tax Office",
    nameEs: "Oficina del Impuesto sobre la Renta (Income Tax Office)",
    url: "https://www.gibraltar.gov.gi/income-tax-office",
    topics: "income tax, tax returns, ABS, GIBS, allowances, tax year, assessments",
  },
  {
    id: "income_tax_contacts",
    name: "Income Tax Office contacts",
    nameEs: "Contactos de la Oficina del Impuesto sobre la Renta",
    url: "https://www.gibraltar.gov.gi/contacts/income-tax-office-76",
    topics: "tax contact emails, PAYE queries, refunds, payments, self-employed, leaving Gibraltar",
  },
  {
    id: "paye",
    name: "PAYE (Pay As You Earn)",
    nameEs: "PAYE (retención de impuestos en nómina)",
    url: "https://www.gibraltar.gov.gi/income-tax-office/individuals-and-employees/paye",
    topics: "PAYE, employee tax, payslip deductions, employer tax, frontier workers tax",
  },
  {
    id: "income_tax_arrears",
    name: "Income Tax and social security arrears",
    nameEs: "Deudas de impuestos y seguridad social",
    url: "https://www.gibraltar.gov.gi/income-tax-office/arrears",
    topics: "tax arrears, debt, demand, payment plan, overdue tax, social insurance arrears",
  },
  {
    id: "social_insurance",
    name: "Social Insurance contributions",
    nameEs: "Cotizaciones a la Seguridad Social (Social Insurance)",
    url: "https://www.gibraltar.gov.gi/social-insurance",
    topics: "social insurance, contributions, employer contributions, self-employed contributions",
  },
  {
    id: "department_of_employment",
    name: "Department of Employment",
    nameEs: "Departamento de Empleo",
    url: "https://www.gibraltar.gov.gi/department-employment",
    topics: "employment registration, terms of engagement, work permits, vacancies, termination, minimum wage",
  },
  {
    id: "housing_department",
    name: "Housing Department",
    nameEs: "Departamento de Vivienda",
    url: "https://www.gibraltar.gov.gi/housing/housing-department",
    topics: "government housing, rent, rent arrears, allocation, repairs, tenancy",
  },
  {
    id: "gea_bills",
    name: "Gibraltar Electricity Authority – Bills to pay",
    nameEs: "Autoridad de Electricidad de Gibraltar – Pago de facturas",
    url: "https://www.gea.gi/customer-support/bills-to-pay",
    topics: "electricity bill, payment, arrears, disconnection, payment plan",
  },
  {
    id: "aquagib_customer_service",
    name: "AquaGib customer service",
    nameEs: "Atención al cliente de AquaGib (agua)",
    url: "https://www.aquagib.gi/customer-service/",
    topics: "water bill, water meter, tariffs, direct debit, water supply",
  },
  {
    id: "gha_registration",
    name: "GHA registration (Group Practice Medical Scheme)",
    nameEs: "Registro en la GHA (Servicio de Salud de Gibraltar)",
    url: "https://www.gha.gi/registration/",
    topics: "health card, GHA registration, medical scheme, entitlement, healthcare, appointments",
  },
  {
    id: "citizens_advice",
    name: "Citizens Advice Bureau Gibraltar",
    nameEs: "Oficina de Asesoramiento al Ciudadano (Citizens Advice Bureau)",
    url: "https://www.cab.gi",
    topics: "free advice, debt, money advice, employment problems, housing problems, any letter",
  },
  {
    id: "gra_data_protection",
    name: "Gibraltar Regulatory Authority – Data Protection",
    nameEs: "Autoridad Reguladora de Gibraltar – Protección de Datos",
    url: "https://www.gra.gi/data-protection",
    topics: "data protection, GDPR, personal data, privacy complaint, data breach",
  },
  {
    id: "spain_gibraltar_tax_agreement",
    name: "UK–Spain tax agreement on Gibraltar (BOE, official text)",
    nameEs: "Acuerdo internacional sobre fiscalidad relativo a Gibraltar (BOE)",
    url: "https://www.boe.es/eli/es/ai/2019/03/04/(1)/con",
    topics: "tax residence, frontier workers, cross-border workers, Spain Gibraltar tax, 183 nights",
  },
  {
    id: "agencia_tributaria",
    name: "Spanish Tax Agency (Agencia Tributaria) e-office",
    nameEs: "Sede electrónica de la Agencia Tributaria",
    url: "https://sede.agenciatributaria.gob.es",
    topics: "Spanish tax, IRPF, renta, Hacienda letters, frontier workers living in Spain",
  },
  {
    id: "eu_uk_gibraltar_agreement",
    name: "EU–UK agreement on Gibraltar (Spanish Foreign Ministry explainer)",
    nameEs: "Acuerdo UE–Reino Unido sobre Gibraltar (Ministerio de Asuntos Exteriores)",
    url: "https://www.exteriores.gob.es/es/Comunicacion/Exteriores-Explica/Paginas/2026_Articulos/El-Acuerdo-con-respecto-a-Gibraltar-cuando-se-aplica-y-que-supone-para-Espana.aspx",
    topics: "frontier, border, cross-border workers, free movement, 2026 treaty, residence permits",
  },
];
