const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResearchSchema = new Schema({
  research_title: String,
  proposed_title: String,
  final_title: String,
  date_approved: Date,
  date_of_completion: Date,
  research_status: String,
  research_categories: [String],
  research_agendas: [String],
  type_of_discipline: String,
  teaching_assignment: String,
  accession_number: String,
  type_of_research: [String],
  honorarium: Number,
  project_budget: Number,
  approved_budget: Number,
  college: Object,
  department: Object,
  college_agendas: Object,
  department_agendas: Object,
  commissioned_by: String,
  department_head: String,
  dean: String,
  venue_of_deliberation: String,
  academic_year: String,
  is_an_external_funded_research: Boolean,
  funding_agency: {
    name_of_funding_agency: String,
    name_of_head: String,
    designation_of_head: String,
    email_address: String,
    contact_number: String,
    total_grant: Number
  },
  proponents: [
    {
      name: String,
      degree: String,
      specialization: String,
      type_of_research: String,
      position: String,
      faculty_status: String,
      role: String
    }
  ],
  paper_presentations: [
    {
      dates: [Date],
      title: String,
      venue: String,
      organizer: String,
      presentation_categories: [String],
      name_of_event: String,
      theme: String,
      name_of_presenter: String,
      country: String
    }
  ],
  publications: [
    {
      title_of_paper: String,
      title_of_research: String,
      authors: String,
      journal: String,
      issn: String,
      year_published: Number,
      volume_number: String,
      issue_number: String,
      pages: String,
      editors: String,
      publisher: String,
      keywords: String,
      indexed_in: String,
      bibliographic_citation: String
    }
  ],
  panels: {
    chairperson: String,
    statistician: String,
    technical_adviser: String,
    dean: String,
    research_coordinator: String,
    department_chair: String,
    rero_technical_representative: String
  },
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ],
  attachments: [
    {
      label: String,
      attachment_category: String,
      files: [Object]
    }
  ]
});

module.exports = mongoose.model("researches", ResearchSchema);
